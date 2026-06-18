import { create } from 'zustand'

// ─── Types ──────────────────────────────────────────────────────────────────

export type LeadStatus =
  | 'new'
  | 'calling'
  | 'ringing'
  | 'connected'
  | 'conversation'
  | 'interested'
  | 'not_interested'
  | 'call_later'
  | 'no_answer'
  | 'whatsapp_sent'
  | 'whatsapp_yes'
  | 'whatsapp_no'
  | 'crm_transferred'
  | 'junk'
  | 'failed'

export interface ChatMessage {
  id: string
  speaker: 'bot' | 'customer' | 'system'
  text: string
  timestamp: number
}

export interface Lead {
  id: string
  name: string
  phone: string
  source: string
  status: LeadStatus
  attemptCount: number
  maxAttempts: number
  nextRetryAt: number | null
  enteredAt: number
  lastUpdatedAt: number
  chatMessages: ChatMessage[]
  selectedCar: string
  callDuration: number
  statusHistory: { status: LeadStatus; timestamp: number }[]
  conversationStep: number
  callStartTime: number | null
  callEndTime: number | null
  timePeriod: number // which time-jump period this lead belongs to
}

export interface FlowNodeStats {
  new: number
  calling: number
  ringing: number
  connected: number
  conversation: number
  interested: number
  not_interested: number
  call_later: number
  no_answer: number
  whatsapp_sent: number
  whatsapp_yes: number
  whatsapp_no: number
  crm_transferred: number
  junk: number
  failed: number
}

export interface SimulationStats {
  totalLeadsReceived: number
  totalCallsMade: number
  totalCallsActive: number
  totalInterested: number
  totalJunk: number
  totalFailed: number
  totalWhatsappSent: number
  conversionRate: number
  avgCallDuration: number
  avgAttemptsPerLead: number
  flowNodes: FlowNodeStats
  simTime: number // simulation time in hours
}

interface HyperXState {
  leads: Lead[]
  stats: SimulationStats
  selectedLeadId: string | null
  isSimulating: boolean
  simulationSpeed: number
  simTime: number // current simulation time in hours

  addLead: (lead: Lead) => void
  updateLead: (id: string, updates: Partial<Lead>) => void
  removeLead: (id: string) => void
  setSelectedLeadId: (id: string | null) => void
  setSimulating: (val: boolean) => void
  setSimulationSpeed: (speed: number) => void
  setSimTime: (time: number) => void
  addChatMessage: (id: string, msg: ChatMessage) => void
  recalcStats: () => void
  resetAll: () => void
}

const defaultFlowNodes: FlowNodeStats = {
  new: 0, calling: 0, ringing: 0, connected: 0, conversation: 0,
  interested: 0, not_interested: 0, call_later: 0, no_answer: 0,
  whatsapp_sent: 0, whatsapp_yes: 0, whatsapp_no: 0,
  crm_transferred: 0, junk: 0, failed: 0,
}

const defaultStats: SimulationStats = {
  totalLeadsReceived: 0,
  totalCallsMade: 0,
  totalCallsActive: 0,
  totalInterested: 0,
  totalJunk: 0,
  totalFailed: 0,
  totalWhatsappSent: 0,
  conversionRate: 0,
  avgCallDuration: 0,
  avgAttemptsPerLead: 0,
  flowNodes: { ...defaultFlowNodes },
  simTime: 0,
}

export const useHyperXStore = create<HyperXState>((set, get) => ({
  leads: [],
  stats: { ...defaultStats },
  selectedLeadId: null,
  isSimulating: false,
  simulationSpeed: 1,
  simTime: 0,

  addLead: (lead) =>
    set((state) => {
      const leads = [lead, ...state.leads]
      return { leads, stats: recalc(leads, state.simTime) }
    }),

  updateLead: (id, updates) =>
    set((state) => {
      const leads = state.leads.map((l) =>
        l.id === id
          ? {
              ...l,
              ...updates,
              lastUpdatedAt: Date.now(),
              statusHistory: [
                ...l.statusHistory,
                ...(updates.status && updates.status !== l.status
                  ? [{ status: updates.status, timestamp: Date.now() }]
                  : []),
              ],
            }
          : l
      )
      return { leads, stats: recalc(leads, state.simTime) }
    }),

  removeLead: (id) =>
    set((state) => {
      const leads = state.leads.filter((l) => l.id !== id)
      return { leads, stats: recalc(leads, state.simTime) }
    }),

  setSelectedLeadId: (id) => set({ selectedLeadId: id }),
  setSimulating: (val) => set({ isSimulating: val }),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  setSimTime: (time) => set((state) => ({ simTime: time, stats: recalc(state.leads, time) })),

  addChatMessage: (id, msg) =>
    set((state) => {
      const leads = state.leads.map((l) =>
        l.id === id ? { ...l, chatMessages: [...l.chatMessages, msg] } : l
      )
      return { leads }
    }),

  recalcStats: () => set((state) => ({ stats: recalc(state.leads, state.simTime) })),
  resetAll: () => set({
    leads: [],
    stats: { ...defaultStats },
    selectedLeadId: null,
    isSimulating: false,
    simTime: 0,
  }),
}))

function recalc(leads: Lead[], simTime: number): SimulationStats {
  const totalLeadsReceived = leads.length
  const totalCallsMade = leads.reduce((s, l) => s + l.attemptCount, 0)
  const totalCallsActive = leads.filter(
    (l) => l.status === 'calling' || l.status === 'ringing' || l.status === 'connected' || l.status === 'conversation'
  ).length
  const totalInterested = leads.filter((l) => l.status === 'crm_transferred').length
  const totalJunk = leads.filter((l) => l.status === 'junk').length
  const totalFailed = leads.filter((l) => l.status === 'failed').length
  const totalWhatsappSent = leads.filter((l) => ['whatsapp_sent', 'whatsapp_yes', 'whatsapp_no'].includes(l.status)).length
  const conversionRate = totalLeadsReceived > 0 ? (totalInterested / totalLeadsReceived) * 100 : 0
  const callDurations = leads.filter((l) => l.callDuration > 0).map((l) => l.callDuration)
  const avgCallDuration = callDurations.length > 0 ? callDurations.reduce((a, b) => a + b, 0) / callDurations.length : 0
  const avgAttemptsPerLead = totalLeadsReceived > 0 ? totalCallsMade / totalLeadsReceived : 0

  const flowNodes: FlowNodeStats = { ...defaultFlowNodes }
  for (const l of leads) {
    flowNodes[l.status] = (flowNodes[l.status] || 0) + 1
  }

  return {
    totalLeadsReceived,
    totalCallsMade,
    totalCallsActive,
    totalInterested,
    totalJunk,
    totalFailed,
    totalWhatsappSent,
    conversionRate,
    avgCallDuration,
    avgAttemptsPerLead,
    flowNodes,
    simTime,
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anita', 'Suresh', 'Deepa',
  'Arjun', 'Kavita', 'Ramesh', 'Pooja', 'Sanjay', 'Meena', 'Rahul', 'Sunita',
  'Manish', 'Rekha', 'Dinesh', 'Nisha', 'Vivek', 'Asha', 'Kiran', 'Suman',
  'Pradeep', 'Lata', 'Gaurav', 'Neeta', 'Ashok', 'Ritu', 'Mukesh', 'Jaya',
  'Tarun', 'Shalini', 'Nitin', 'Swati', 'Pankaj', 'Divya', 'Harsh', 'Pallavi',
]

const LAST_NAMES = [
  'Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Joshi', 'Mehta', 'Reddy',
  'Nair', 'Iyer', 'Rao', 'Verma', 'Agarwal', 'Chauhan', 'Malhotra', 'Das',
  'Pillai', 'Bhat', 'Hegde', 'Desai', 'Shah', 'Patil', 'Kulkarni', 'Naik',
]

const CARS = ['Fortuner', 'Innova Crysta', 'Camry', 'Glanza', 'Urban Cruiser', 'Vellfire', 'Rumion']

let leadCounter = 0
let msgCounter = 0

export function genMsgId(): string {
  return `msg-${++msgCounter}`
}

export function generateLead(timePeriod: number = 0): Lead {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  const id = `L-${String(++leadCounter).padStart(4, '0')}`
  const now = Date.now()

  return {
    id,
    name: `${firstName} ${lastName}`,
    phone: `+91 ${Math.floor(7000000000 + Math.random() * 3000000000)}`,
    source: 'CarWale.com',
    status: 'new',
    attemptCount: 0,
    maxAttempts: 4,
    nextRetryAt: null,
    enteredAt: now,
    lastUpdatedAt: now,
    chatMessages: [],
    selectedCar: CARS[Math.floor(Math.random() * CARS.length)],
    callDuration: 0,
    statusHistory: [{ status: 'new', timestamp: now }],
    conversationStep: 0,
    callStartTime: null,
    callEndTime: null,
    timePeriod,
  }
}

export function getStatusColor(status: LeadStatus): string {
  switch (status) {
    case 'new': return 'text-amber-400'
    case 'calling': return 'text-cyan-400'
    case 'ringing': return 'text-yellow-300'
    case 'connected': return 'text-green-400'
    case 'conversation': return 'text-emerald-300'
    case 'interested': return 'text-green-500'
    case 'not_interested': return 'text-red-400'
    case 'call_later': return 'text-orange-400'
    case 'no_answer': return 'text-gray-400'
    case 'whatsapp_sent': return 'text-emerald-400'
    case 'whatsapp_yes': return 'text-green-500'
    case 'whatsapp_no': return 'text-red-400'
    case 'crm_transferred': return 'text-green-600'
    case 'junk': return 'text-red-500'
    case 'failed': return 'text-gray-500'
    default: return 'text-gray-400'
  }
}

export function getStatusBgColor(status: LeadStatus): string {
  switch (status) {
    case 'new': return 'bg-amber-500/20 border-amber-500/30'
    case 'calling': return 'bg-cyan-500/20 border-cyan-500/30'
    case 'ringing': return 'bg-yellow-500/20 border-yellow-500/30'
    case 'connected': return 'bg-green-500/20 border-green-500/30'
    case 'conversation': return 'bg-emerald-500/20 border-emerald-500/30'
    case 'interested': return 'bg-green-500/20 border-green-500/30'
    case 'not_interested': return 'bg-red-500/20 border-red-500/30'
    case 'call_later': return 'bg-orange-500/20 border-orange-500/30'
    case 'no_answer': return 'bg-gray-500/20 border-gray-500/30'
    case 'whatsapp_sent': return 'bg-emerald-500/20 border-emerald-500/30'
    case 'whatsapp_yes': return 'bg-green-500/20 border-green-500/30'
    case 'whatsapp_no': return 'bg-red-500/20 border-red-500/30'
    case 'crm_transferred': return 'bg-green-600/20 border-green-600/30'
    case 'junk': return 'bg-red-600/20 border-red-600/30'
    case 'failed': return 'bg-gray-600/20 border-gray-600/30'
    default: return 'bg-gray-500/20 border-gray-500/30'
  }
}

export function getStatusLabel(status: LeadStatus): string {
  switch (status) {
    case 'new': return 'New Lead'
    case 'calling': return 'Calling...'
    case 'ringing': return 'Ringing'
    case 'connected': return 'Connected'
    case 'conversation': return 'In Conversation'
    case 'interested': return 'Interested'
    case 'not_interested': return 'Not Interested'
    case 'call_later': return 'Call Later'
    case 'no_answer': return 'No Answer'
    case 'whatsapp_sent': return 'WhatsApp Sent'
    case 'whatsapp_yes': return 'WhatsApp Yes'
    case 'whatsapp_no': return 'WhatsApp No'
    case 'crm_transferred': return 'In CRM'
    case 'junk': return 'Junk'
    case 'failed': return 'Failed'
    default: return status
  }
}

export function getStatusIcon(status: LeadStatus): string {
  switch (status) {
    case 'new': return '📥'
    case 'calling': return '📞'
    case 'ringing': return '🔔'
    case 'connected': return '🟢'
    case 'conversation': return '💬'
    case 'interested': return '✅'
    case 'not_interested': return '❌'
    case 'call_later': return '⏰'
    case 'no_answer': return '📵'
    case 'whatsapp_sent': return '📱'
    case 'whatsapp_yes': return '✅📱'
    case 'whatsapp_no': return '❌📱'
    case 'crm_transferred': return '🏆'
    case 'junk': return '🗑️'
    case 'failed': return '⛔'
    default: return '❓'
  }
}

// Conversation script templates - each step is a message that appears with delay
export interface ConversationStep {
  speaker: 'bot' | 'customer' | 'system'
  text: string
  delayMs: number // delay from previous step
}

export function getConversationScript(lead: Lead, outcome: 'interested' | 'not_interested' | 'call_later'): ConversationStep[] {
  const name = lead.name.split(' ')[0]
  const car = lead.selectedCar

  const base: ConversationStep[] = [
    { speaker: 'bot', text: `Hello! This is Hyper X calling from Toyota. May I speak with ${name}?`, delayMs: 2000 },
    { speaker: 'customer', text: 'Yes, speaking. Who is this?', delayMs: 3000 },
    { speaker: 'bot', text: `Hi ${name}! I'm calling regarding your inquiry on CarWale.com about the Toyota ${car}.`, delayMs: 2500 },
    { speaker: 'bot', text: 'I wanted to check if you are still interested in exploring this vehicle?', delayMs: 2000 },
  ]

  if (outcome === 'interested') {
    return [
      ...base,
      { speaker: 'customer', text: `Yes, I am interested in the ${car}. Can you tell me more?`, delayMs: 3000 },
      { speaker: 'bot', text: `Great choice, ${name}! The Toyota ${car} is one of our most popular models.`, delayMs: 2500 },
      { speaker: 'bot', text: 'It offers excellent performance, premium interiors, and great resale value.', delayMs: 2000 },
      { speaker: 'customer', text: 'That sounds good. What about the pricing and availability?', delayMs: 3000 },
      { speaker: 'bot', text: "I'll have our senior executive reach out to you with all the details on pricing and test drive options.", delayMs: 2500 },
      { speaker: 'bot', text: "You'll also receive a WhatsApp message with more information shortly.", delayMs: 1500 },
      { speaker: 'customer', text: 'Sure, that would be helpful. Thank you!', delayMs: 2000 },
      { speaker: 'bot', text: `Thank you for your interest, ${name}! Have a wonderful day!`, delayMs: 1500 },
    ]
  }

  if (outcome === 'not_interested') {
    return [
      ...base,
      { speaker: 'customer', text: "No, I'm not interested anymore. I've changed my mind.", delayMs: 3000 },
      { speaker: 'bot', text: "I understand, ${name}. Just out of curiosity, may I ask what changed your mind?", delayMs: 2500 },
      { speaker: 'customer', text: "I've decided to go with a different brand. Thanks.", delayMs: 2500 },
      { speaker: 'bot', text: "No problem at all! Thank you for your time, ${name}. Have a great day!", delayMs: 2000 },
    ]
  }

  // call_later
  return [
    ...base,
    { speaker: 'customer', text: "I'm a bit busy right now. Can you call me back later?", delayMs: 3000 },
    { speaker: 'bot', text: "Of course! When would be a good time to reach you?", delayMs: 2000 },
    { speaker: 'customer', text: 'Maybe after a couple of hours. I should be free then.', delayMs: 2500 },
    { speaker: 'bot', text: "Perfect! I'll schedule a callback for you. Thank you, ${name}!", delayMs: 2000 },
  ]
}
