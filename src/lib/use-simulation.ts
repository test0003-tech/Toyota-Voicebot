'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useHyperXStore, generateLead, generateChatScript, type Lead, type LeadStatus } from './hyperx-store'

// Accelerated simulation: each "hour" = 2 seconds real-time
const HOUR_MS = 2000
const RETRY_DELAYS = [0, 2 * HOUR_MS, 4 * HOUR_MS, 24 * HOUR_MS] // 0, 2hr, 4hr, 24hr in sim time
const WHATSAPP_TIMEOUT = 48 * HOUR_MS
const CALL_RING_TIME = 2000
const CONVERSATION_TIME = 4000

export function useSimulation() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const addLead = useHyperXStore((s) => s.addLead)
  const updateLead = useHyperXStore((s) => s.updateLead)
  const setSimulating = useHyperXStore((s) => s.setSimulating)
  const isSimulating = useHyperXStore((s) => s.isSimulating)
  const speed = useHyperXStore((s) => s.simulationSpeed)
  const leads = useHyperXStore((s) => s.leads)
  const leadsRef = useRef(leads)
  useEffect(() => {
    leadsRef.current = leads
  }, [leads])

  const simulateStep = useCallback(() => {
    const currentLeads = leadsRef.current
    const now = Date.now()

    for (const lead of currentLeads) {
      switch (lead.status) {
        case 'new': {
          // Start calling immediately
          updateLead(lead.id, {
            status: 'calling',
            attemptCount: 1,
            chatMessages: generateChatScript(lead, 'calling'),
          })
          // After brief delay, start ringing
          setTimeout(() => {
            const current = leadsRef.current.find((l) => l.id === lead.id)
            if (current && current.status === 'calling') {
              updateLead(lead.id, {
                status: 'ringing',
                chatMessages: generateChatScript(lead, 'ringing'),
              })
            }
          }, 800 / speed)
          break
        }

        case 'ringing': {
          // After ring time, determine outcome
          const timeRinging = now - lead.lastUpdatedAt
          if (timeRinging > CALL_RING_TIME / speed) {
            const rand = Math.random()
            if (rand < 0.35) {
              // Customer picks up
              updateLead(lead.id, {
                status: 'connected',
                chatMessages: generateChatScript(lead, 'connected'),
              })
            } else {
              // No answer
              updateLead(lead.id, {
                status: 'no_answer',
                chatMessages: [],
              })
            }
          }
          break
        }

        case 'connected': {
          // Start conversation
          const timeConnected = now - lead.lastUpdatedAt
          if (timeConnected > 1500 / speed) {
            updateLead(lead.id, {
              status: 'conversation',
              chatMessages: generateChatScript(lead, 'conversation'),
            })
          }
          break
        }

        case 'conversation': {
          // Determine conversation outcome
          const timeConversing = now - lead.lastUpdatedAt
          if (timeConversing > CONVERSATION_TIME / speed) {
            const rand = Math.random()
            if (rand < 0.45) {
              // Interested
              updateLead(lead.id, {
                status: 'interested',
                chatMessages: generateChatScript(lead, 'interested'),
                callDuration: Math.floor(30 + Math.random() * 120),
              })
            } else if (rand < 0.70) {
              // Call later
              updateLead(lead.id, {
                status: 'call_later',
                chatMessages: generateChatScript(lead, 'call_later'),
                callDuration: Math.floor(10 + Math.random() * 30),
              })
            } else {
              // Not interested
              updateLead(lead.id, {
                status: 'not_interested',
                chatMessages: generateChatScript(lead, 'not_interested'),
                callDuration: Math.floor(5 + Math.random() * 20),
              })
            }
          }
          break
        }

        case 'interested': {
          // After a moment, send to WhatsApp then CRM
          const timeSince = now - lead.lastUpdatedAt
          if (timeSince > 2000 / speed) {
            updateLead(lead.id, { status: 'whatsapp_sent', chatMessages: generateChatScript(lead, 'whatsapp_sent') })
          }
          break
        }

        case 'whatsapp_sent': {
          const timeSince = now - lead.lastUpdatedAt
          if (timeSince > 3000 / speed) {
            // For interested leads, WhatsApp always returns yes
            updateLead(lead.id, { status: 'whatsapp_yes' })
          }
          break
        }

        case 'whatsapp_yes': {
          const timeSince = now - lead.lastUpdatedAt
          if (timeSince > 1500 / speed) {
            updateLead(lead.id, { status: 'crm_transferred' })
          }
          break
        }

        case 'not_interested': {
          const timeSince = now - lead.lastUpdatedAt
          if (timeSince > 1500 / speed) {
            updateLead(lead.id, { status: 'junk' })
          }
          break
        }

        case 'call_later': {
          const timeSince = now - lead.lastUpdatedAt
          if (timeSince > 2000 / speed) {
            // Reset for next attempt (same as no_answer retry logic)
            const nextAttempt = lead.attemptCount + 1
            if (nextAttempt <= lead.maxAttempts) {
              const retryDelay = RETRY_DELAYS[Math.min(nextAttempt - 1, RETRY_DELAYS.length - 1)]
              updateLead(lead.id, {
                status: 'no_answer',
                attemptCount: nextAttempt,
                nextRetryAt: now + retryDelay,
                chatMessages: [],
              })
            } else {
              // Max attempts reached, send WhatsApp
              updateLead(lead.id, {
                status: 'whatsapp_sent',
                chatMessages: generateChatScript(lead, 'whatsapp_sent'),
                nextRetryAt: null,
              })
            }
          }
          break
        }

        case 'no_answer': {
          // Check if it's time for retry
          if (lead.nextRetryAt && now >= lead.nextRetryAt) {
            const nextAttempt = lead.attemptCount + 1
            if (nextAttempt <= lead.maxAttempts) {
              updateLead(lead.id, {
                status: 'calling',
                attemptCount: nextAttempt,
                nextRetryAt: null,
                chatMessages: [],
              })
              // Ringing after brief delay
              setTimeout(() => {
                const current = leadsRef.current.find((l) => l.id === lead.id)
                if (current && current.status === 'calling') {
                  updateLead(lead.id, {
                    status: 'ringing',
                    chatMessages: generateChatScript(lead, 'ringing'),
                  })
                }
              }, 800 / speed)
            } else {
              // After 4th attempt, send WhatsApp
              updateLead(lead.id, {
                status: 'whatsapp_sent',
                chatMessages: generateChatScript(lead, 'whatsapp_sent'),
                nextRetryAt: null,
              })
            }
          } else if (!lead.nextRetryAt) {
            // First no_answer - schedule retry
            const retryDelay = RETRY_DELAYS[Math.min(lead.attemptCount, RETRY_DELAYS.length - 1)]
            updateLead(lead.id, {
              nextRetryAt: now + retryDelay,
            })
          }
          break
        }

        case 'whatsapp_no': {
          const timeSince = now - lead.lastUpdatedAt
          if (timeSince > 1500 / speed) {
            updateLead(lead.id, { status: 'junk' })
          }
          break
        }
      }
    }
  }, [updateLead, speed])

  const startSimulation = useCallback(() => {
    setSimulating(true)
  }, [setSimulating])

  const stopSimulation = useCallback(() => {
    setSimulating(false)
  }, [setSimulating])

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
      if (activeCount < 12) {
        addLead(generateLead())
      }
      leadTimeout = setTimeout(addNewLead, (2500 + Math.random() * 2000) / speed)
    }

    leadTimeout = setTimeout(addNewLead, 500 / speed)

    // Process simulation steps
    intervalRef.current = setInterval(simulateStep, 500 / speed)

    return () => {
      clearTimeout(leadTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isSimulating, simulateStep, addLead, speed])

  // Handle WhatsApp follow-ups for no_answer -> whatsapp_sent path
  useEffect(() => {
    if (!isSimulating) return

    const whatsappInterval = setInterval(() => {
      const currentLeads = useHyperXStore.getState().leads
      const now = Date.now()

      for (const lead of currentLeads) {
        if (lead.status === 'whatsapp_sent' && lead.attemptCount >= lead.maxAttempts) {
          // WhatsApp for max-attempt-reached leads (not from "interested" path)
          const timeSince = now - lead.lastUpdatedAt
          if (timeSince > 4000 / speed) {
            const rand = Math.random()
            if (rand < 0.25) {
              updateLead(lead.id, { status: 'whatsapp_yes' })
            } else if (rand < 0.60) {
              updateLead(lead.id, { status: 'whatsapp_no' })
            } else if (timeSince > WHATSAPP_TIMEOUT / speed) {
              // No response within 48hr → failed
              updateLead(lead.id, { status: 'failed' })
            }
          }
        }
      }
    }, 1000 / speed)

    return () => clearInterval(whatsappInterval)
  }, [isSimulating, updateLead, speed])

  return { startSimulation, stopSimulation, isSimulating }
}
