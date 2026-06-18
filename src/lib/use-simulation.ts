'use client'

import { useEffect, useRef, useCallback } from 'react'
import {
  useHyperXStore,
  generateLead,
  genMsgId,
  getConversationScript,
  type Lead,
  type LeadStatus,
} from './hyperx-store'

// Real-time pacing: 1 sim-hour = 4 seconds real-time at 1x
const SIM_HOUR_REAL_MS = 4000
const RETRY_DELAYS_HOURS = [0, 2, 4, 24] // hours
const WHATSAPP_TIMEOUT_HOURS = 48

// Conversation pacing (real ms)
const RING_DURATION = 4000
const CONNECT_DELAY = 1500
const MSG_BASE_DELAY = 2000

export function useSimulation() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const convTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const retryTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const addLead = useHyperXStore((s) => s.addLead)
  const updateLead = useHyperXStore((s) => s.updateLead)
  const addChatMessage = useHyperXStore((s) => s.addChatMessage)
  const setSimulating = useHyperXStore((s) => s.setSimulating)
  const isSimulating = useHyperXStore((s) => s.isSimulating)
  const speed = useHyperXStore((s) => s.simulationSpeed)
  const simTime = useHyperXStore((s) => s.simTime)
  const setSimTime = useHyperXStore((s) => s.setSimTime)

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    convTimersRef.current.forEach((t) => clearTimeout(t))
    convTimersRef.current.clear()
    retryTimersRef.current.forEach((t) => clearTimeout(t))
    retryTimersRef.current.clear()
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Start a conversation for a connected lead
  const startConversation = useCallback((leadId: string, outcome: 'interested' | 'not_interested' | 'call_later') => {
    const store = useHyperXStore.getState()
    const lead = store.leads.find((l) => l.id === leadId)
    if (!lead) return

    const script = getConversationScript(lead, outcome)
    let cumulativeDelay = 0

    script.forEach((step, i) => {
      cumulativeDelay += step.delayMs / speed
      const timer = setTimeout(() => {
        const current = useHyperXStore.getState().leads.find((l) => l.id === leadId)
        if (!current || !['connected', 'conversation'].includes(current.status)) return

        // First message sets status to conversation
        if (i === 0) {
          updateLead(leadId, {
            status: 'conversation',
            conversationStep: i + 1,
          })
        } else {
          updateLead(leadId, { conversationStep: i + 1 })
        }

        addChatMessage(leadId, {
          id: genMsgId(),
          speaker: step.speaker,
          text: step.text.replace('${name}', lead.name.split(' ')[0]).replace('${car}', lead.selectedCar),
          timestamp: Date.now(),
        })

        // Last message - trigger outcome
        if (i === script.length - 1) {
          const callDur = Math.floor(15 + Math.random() * 120)
          setTimeout(() => {
            if (outcome === 'interested') {
              updateLead(leadId, {
                status: 'interested',
                callDuration: callDur,
                callEndTime: Date.now(),
              })
            } else if (outcome === 'not_interested') {
              updateLead(leadId, {
                status: 'not_interested',
                callDuration: callDur,
                callEndTime: Date.now(),
              })
            } else {
              updateLead(leadId, {
                status: 'call_later',
                callDuration: Math.floor(10 + Math.random() * 20),
                callEndTime: Date.now(),
              })
            }
          }, 1500 / speed)
        }
      }, cumulativeDelay)

      convTimersRef.current.set(`${leadId}-step-${i}`, timer)
    })
  }, [updateLead, addChatMessage, speed])

  // Initiate a call to a lead
  const initiateCall = useCallback((leadId: string) => {
    const store = useHyperXStore.getState()
    const lead = store.leads.find((l) => l.id === leadId)
    if (!lead) return

    updateLead(leadId, {
      status: 'calling',
      attemptCount: lead.attemptCount + 1,
      callStartTime: Date.now(),
      chatMessages: [{
        id: genMsgId(),
        speaker: 'system',
        text: `Attempt ${lead.attemptCount + 1} - Calling ${lead.name}...`,
        timestamp: Date.now(),
      }],
    })

    // After dial delay, start ringing
    const dialTimer = setTimeout(() => {
      const current = useHyperXStore.getState().leads.find((l) => l.id === leadId)
      if (!current || current.status !== 'calling') return

      updateLead(leadId, { status: 'ringing' })
      addChatMessage(leadId, {
        id: genMsgId(),
        speaker: 'system',
        text: 'Ringing... Tring tring...',
        timestamp: Date.now(),
      })

      // After ring duration, determine outcome
      const ringTimer = setTimeout(() => {
        const cur = useHyperXStore.getState().leads.find((l) => l.id === leadId)
        if (!cur || cur.status !== 'ringing') return

        const rand = Math.random()
        if (rand < 0.40) {
          // Customer picks up
          updateLead(leadId, { status: 'connected' })
          addChatMessage(leadId, {
            id: genMsgId(),
            speaker: 'system',
            text: 'Call connected!',
            timestamp: Date.now(),
          })

          // Determine conversation outcome and start conversation
          const outRand = Math.random()
          const outcome = outRand < 0.45 ? 'interested' : outRand < 0.70 ? 'call_later' : 'not_interested'
          setTimeout(() => startConversation(leadId, outcome), CONNECT_DELAY / speed)
        } else {
          // No answer
          updateLead(leadId, {
            status: 'no_answer',
            callEndTime: Date.now(),
          })
          addChatMessage(leadId, {
            id: genMsgId(),
            speaker: 'system',
            text: 'No answer. Call not picked up.',
            timestamp: Date.now(),
          })
        }
      }, (RING_DURATION + Math.random() * 2000) / speed)

      convTimersRef.current.set(`${leadId}-ring`, ringTimer)
    }, (1500 + Math.random() * 1000) / speed)

    convTimersRef.current.set(`${leadId}-dial`, dialTimer)
  }, [updateLead, addChatMessage, startConversation, speed])

  // Schedule retry for a lead
  const scheduleRetry = useCallback((leadId: string, attemptCount: number) => {
    const delayHours = RETRY_DELAYS_HOURS[Math.min(attemptCount, RETRY_DELAYS_HOURS.length - 1)]
    if (delayHours === 0) {
      // Immediate retry
      initiateCall(leadId)
      return
    }

    const delayMs = (delayHours * SIM_HOUR_REAL_MS) / speed
    const timer = setTimeout(() => {
      const current = useHyperXStore.getState().leads.find((l) => l.id === leadId)
      if (!current) return

      if (attemptCount >= current.maxAttempts) {
        // Max attempts reached, send WhatsApp
        updateLead(leadId, {
          status: 'whatsapp_sent',
          chatMessages: [{
            id: genMsgId(),
            speaker: 'system',
            text: `All ${current.maxAttempts} attempts failed. Sending WhatsApp message...`,
            timestamp: Date.now(),
          }, {
            id: genMsgId(),
            speaker: 'bot',
            text: `Hi ${current.name.split(' ')[0]}, we tried reaching you about the Toyota ${current.selectedCar}. Are you still interested? Reply YES or NO.`,
            timestamp: Date.now(),
          }],
        })
      } else {
        initiateCall(leadId)
      }
    }, delayMs)

    retryTimersRef.current.set(`${leadId}-retry-${attemptCount}`, timer)
  }, [initiateCall, updateLead, speed])

  // Process status transitions
  const processStatusTransitions = useCallback(() => {
    const store = useHyperXStore.getState()
    const leads = store.leads

    for (const lead of leads) {
      switch (lead.status) {
        case 'new': {
          initiateCall(lead.id)
          break
        }
        case 'interested': {
          // Send WhatsApp confirmation
          setTimeout(() => {
            const cur = useHyperXStore.getState().leads.find((l) => l.id === lead.id)
            if (!cur || cur.status !== 'interested') return
            updateLead(lead.id, {
              status: 'whatsapp_sent',
              chatMessages: [...cur.chatMessages, {
                id: genMsgId(),
                speaker: 'system',
                text: 'Sending WhatsApp confirmation...',
                timestamp: Date.now(),
              }, {
                id: genMsgId(),
                speaker: 'bot',
                text: `Hi ${lead.name.split(' ')[0]}, thank you for your interest in Toyota ${lead.selectedCar}! Our senior executive will contact you shortly. Reply YES to confirm.`,
                timestamp: Date.now(),
              }],
            })
          }, 2000 / speed)
          break
        }
        case 'whatsapp_sent': {
          // Process WhatsApp responses
          const timeSince = Date.now() - lead.lastUpdatedAt
          if (timeSince > 5000 / speed) {
            if (lead.statusHistory.some((h) => h.status === 'interested')) {
              // From interested path - always yes
              updateLead(lead.id, { status: 'whatsapp_yes' })
              addChatMessage(lead.id, {
                id: genMsgId(),
                speaker: 'customer',
                text: 'YES',
                timestamp: Date.now(),
              })
            } else {
              // From max-attempt path
              const rand = Math.random()
              if (rand < 0.20) {
                updateLead(lead.id, { status: 'whatsapp_yes' })
                addChatMessage(lead.id, {
                  id: genMsgId(),
                  speaker: 'customer',
                  text: 'YES',
                  timestamp: Date.now(),
                })
              } else if (rand < 0.50) {
                updateLead(lead.id, { status: 'whatsapp_no' })
                addChatMessage(lead.id, {
                  id: genMsgId(),
                  speaker: 'customer',
                  text: 'NO',
                  timestamp: Date.now(),
                })
              } else if (timeSince > (WHATSAPP_TIMEOUT_HOURS * SIM_HOUR_REAL_MS) / speed) {
                updateLead(lead.id, { status: 'failed' })
                addChatMessage(lead.id, {
                  id: genMsgId(),
                  speaker: 'system',
                  text: 'No WhatsApp response within 48 hours. Lead marked as failed.',
                  timestamp: Date.now(),
                })
              }
            }
          }
          break
        }
        case 'whatsapp_yes': {
          const timeSince = Date.now() - lead.lastUpdatedAt
          if (timeSince > 1500 / speed) {
            updateLead(lead.id, {
              status: 'crm_transferred',
              chatMessages: [...lead.chatMessages, {
                id: genMsgId(),
                speaker: 'system',
                text: 'Lead transferred to Toyota CRM successfully!',
                timestamp: Date.now(),
              }],
            })
          }
          break
        }
        case 'not_interested': {
          const timeSince = Date.now() - lead.lastUpdatedAt
          if (timeSince > 2000 / speed) {
            updateLead(lead.id, {
              status: 'junk',
              chatMessages: [...lead.chatMessages, {
                id: genMsgId(),
                speaker: 'system',
                text: 'Lead removed from calling list. Marked as Junk.',
                timestamp: Date.now(),
              }],
            })
          }
          break
        }
        case 'whatsapp_no': {
          const timeSince = Date.now() - lead.lastUpdatedAt
          if (timeSince > 1500 / speed) {
            updateLead(lead.id, {
              status: 'junk',
              chatMessages: [...lead.chatMessages, {
                id: genMsgId(),
                speaker: 'system',
                text: 'WhatsApp response: NO. Lead removed from calling list. Marked as Junk.',
                timestamp: Date.now(),
              }],
            })
          }
          break
        }
        case 'no_answer': {
          // Schedule retry
          if (!retryTimersRef.current.has(`${lead.id}-retry-${lead.attemptCount}`)) {
            scheduleRetry(lead.id, lead.attemptCount)
          }
          break
        }
        case 'call_later': {
          // Treat same as no_answer for retry
          if (!retryTimersRef.current.has(`${lead.id}-retry-${lead.attemptCount}`)) {
            const nextAttempt = lead.attemptCount + 1
            if (nextAttempt <= lead.maxAttempts) {
              updateLead(lead.id, { status: 'no_answer', attemptCount: nextAttempt })
            } else {
              updateLead(lead.id, {
                status: 'whatsapp_sent',
                chatMessages: [{
                  id: genMsgId(),
                  speaker: 'system',
                  text: `All ${lead.maxAttempts} attempts completed. Sending WhatsApp...`,
                  timestamp: Date.now(),
                }, {
                  id: genMsgId(),
                  speaker: 'bot',
                  text: `Hi ${lead.name.split(' ')[0]}, we tried reaching you about the Toyota ${lead.selectedCar}. Are you still interested? Reply YES or NO.`,
                  timestamp: Date.now(),
                }],
              })
            }
          }
          break
        }
      }
    }
  }, [initiateCall, updateLead, addChatMessage, scheduleRetry, speed])

  const startSimulation = useCallback(() => {
    setSimulating(true)
  }, [setSimulating])

  const stopSimulation = useCallback(() => {
    setSimulating(false)
  }, [setSimulating])

  // Time jump - fast forward simulation
  const timeJump = useCallback((hours: number) => {
    const store = useHyperXStore.getState()
    if (!store.isSimulating) setSimulating(true)

    const newSimTime = hours
    setSimTime(newSimTime)

    // Add leads that would have come in during this time
    const leadsPerHour = 3 // average leads per hour
    const totalNewLeads = Math.floor(hours * leadsPerHour * (0.8 + Math.random() * 0.4))
    const currentLeads = store.leads.length

    for (let i = 0; i < totalNewLeads; i++) {
      const lead = generateLead(hours)
      // Randomly assign various statuses based on time elapsed
      const rand = Math.random()
      const progressFactor = Math.min(hours / 30, 1) // how far along the simulation is

      if (hours >= 30 && rand < 0.35) {
        // Some leads fully completed
        const subRand = Math.random()
        if (subRand < 0.40) {
          lead.status = 'crm_transferred'
          lead.attemptCount = Math.floor(1 + Math.random() * 3)
          lead.callDuration = Math.floor(15 + Math.random() * 120)
        } else if (subRand < 0.75) {
          lead.status = 'junk'
          lead.attemptCount = Math.floor(1 + Math.random() * 4)
        } else {
          lead.status = 'failed'
          lead.attemptCount = 4
        }
      } else if (hours >= 24 && rand < 0.55) {
        const subRand = Math.random()
        if (subRand < 0.30) {
          lead.status = 'crm_transferred'
          lead.attemptCount = Math.floor(1 + Math.random() * 3)
          lead.callDuration = Math.floor(15 + Math.random() * 120)
        } else if (subRand < 0.50) {
          lead.status = 'whatsapp_sent'
          lead.attemptCount = 4
        } else if (subRand < 0.70) {
          lead.status = 'junk'
          lead.attemptCount = Math.floor(1 + Math.random() * 4)
        } else {
          lead.status = 'no_answer'
          lead.attemptCount = Math.floor(2 + Math.random() * 3)
          lead.nextRetryAt = Date.now() + 5000
        }
      } else if (hours >= 4 && rand < 0.65) {
        const subRand = Math.random()
        if (subRand < 0.20) {
          lead.status = 'crm_transferred'
          lead.attemptCount = Math.floor(1 + Math.random() * 2)
          lead.callDuration = Math.floor(15 + Math.random() * 120)
        } else if (subRand < 0.40) {
          lead.status = 'conversation'
          lead.attemptCount = 1
          lead.callStartTime = Date.now()
        } else if (subRand < 0.55) {
          lead.status = 'no_answer'
          lead.attemptCount = Math.floor(1 + Math.random() * 2)
          lead.nextRetryAt = Date.now() + 3000
        } else if (subRand < 0.70) {
          lead.status = 'junk'
          lead.attemptCount = Math.floor(1 + Math.random() * 2)
        } else {
          lead.status = 'ringing'
          lead.attemptCount = 1
        }
      } else if (hours >= 2 && rand < 0.60) {
        const subRand = Math.random()
        if (subRand < 0.25) {
          lead.status = 'no_answer'
          lead.attemptCount = 1
          lead.nextRetryAt = Date.now() + 2000
        } else if (subRand < 0.45) {
          lead.status = 'ringing'
          lead.attemptCount = 1
        } else if (subRand < 0.60) {
          lead.status = 'connected'
          lead.attemptCount = 1
          lead.callStartTime = Date.now()
        } else {
          lead.status = 'new'
        }
      } else {
        // Within first 2 hours - mostly new/calling/ringing
        const subRand = Math.random()
        if (subRand < 0.30) {
          lead.status = 'new'
        } else if (subRand < 0.50) {
          lead.status = 'calling'
          lead.attemptCount = 1
        } else if (subRand < 0.70) {
          lead.status = 'ringing'
          lead.attemptCount = 1
        } else {
          lead.status = 'connected'
          lead.attemptCount = 1
          lead.callStartTime = Date.now()
        }
      }

      addLead(lead)
    }

    // Process status transitions for existing leads
    processStatusTransitions()
  }, [setSimulating, setSimTime, addLead, processStatusTransitions])

  // Main simulation loop
  useEffect(() => {
    if (!isSimulating) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Add new leads periodically
    let leadTimeout: ReturnType<typeof setTimeout>

    const addNewLead = () => {
      if (!useHyperXStore.getState().isSimulating) return
      const activeCount = useHyperXStore.getState().leads.filter(
        (l) => !['crm_transferred', 'junk', 'failed'].includes(l.status)
      ).length
      if (activeCount < 10) {
        const currentSimTime = useHyperXStore.getState().simTime
        addLead(generateLead(currentSimTime))
      }
      leadTimeout = setTimeout(addNewLead, (4000 + Math.random() * 3000) / speed)
    }

    leadTimeout = setTimeout(addNewLead, 500 / speed)

    // Process status transitions
    intervalRef.current = setInterval(processStatusTransitions, 600 / speed)

    // Increment sim time
    const simTimeInterval = setInterval(() => {
      const current = useHyperXStore.getState().simTime
      setSimTime(current + 0.05) // increment by ~3 min per tick
    }, 1000)

    return () => {
      clearTimeout(leadTimeout)
      if (intervalRef.current) clearInterval(intervalRef.current)
      clearInterval(simTimeInterval)
    }
  }, [isSimulating, speed, addLead, processStatusTransitions, setSimTime])

  return { startSimulation, stopSimulation, isSimulating, timeJump, clearAllTimers }
}
