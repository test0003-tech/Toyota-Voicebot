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
  speaker: 'bot' | 'customer'
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
}

interface HyperXState {
  leads: Lead[]
  stats: SimulationStats
  selectedLeadId: string | null
  isSimulating: boolean
  simulationSpeed: number

  // Actions
  addLead: (lead: Lead) => void
  updateLead: (id: string, updates: Partial<Lead>) => void
  removeLead: (id: string) => void
  setSelectedLeadId: (id: string | null) => void
  setSimulating: (val: boolean) => void
  setSimulationSpeed: (speed: number) => void
  recalcStats: () => void
  resetAll: () => void
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
}

export const useHyperXStore = create<HyperXState>((set, get) => ({
  leads: [],
  stats: { ...defaultStats },
  selectedLeadId: null,
  isSimulating: false,
  simulationSpeed: 1,

  addLead: (lead) =>
    set((state) => {
      const leads = [lead, ...state.leads]
      return { leads, stats: recalc(leads) }
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
      return { leads, stats: recalc(leads) }
    }),

  removeLead: (id) =>
    set((state) => {
      const leads = state.leads.filter((l) => l.id !== id)
      return { leads, stats: recalc(leads) }
    }),

  setSelectedLeadId: (id) => set({ selectedLeadId: id }),
  setSimulating: (val) => set({ isSimulating: val }),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  recalcStats: () => set((state) => ({ stats: recalc(state.leads) })),
  resetAll: () => set({ leads: [], stats: { ...defaultStats }, selectedLeadId: null, isSimulating: false }),
}))

function recalc(leads: Lead[]): SimulationStats {
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
  }
}

// ─── Helper functions for simulation ────────────────────────────────────────

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

const SOURCES = ['CarDekho', 'CarWale', 'ZigWheels', 'Google Ads', 'Facebook', 'Website']
const CARS = ['Fortuner', 'Innova Crysta', 'Camry', 'Glanza', 'Urban Cruiser', 'Vellfire', 'Rumion']

let leadCounter = 0

export function generateLead(): Lead {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  const id = `L-${String(++leadCounter).padStart(4, '0')}`
  const now = Date.now()

  return {
    id,
    name: `${firstName} ${lastName}`,
    phone: `+91 ${Math.floor(7000000000 + Math.random() * 3000000000)}`,
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
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
  }
}

// Chat script templates
export function generateChatScript(lead: Lead, status: LeadStatus): ChatMessage[] {
  const msgs: ChatMessage[] = []
  const now = Date.now()
  const car = lead.selectedCar

  if (status === 'ringing') {
    msgs.push({ speaker: 'bot', text: `Hello! This is Hyper X calling from Toyota. May I speak with ${lead.name.split(' ')[0]}?`, timestamp: now })
  }

  if (status === 'connected' || status === 'conversation') {
    msgs.push(
      { speaker: 'bot', text: `Hello ${lead.name.split(' ')[0]}! I'm calling from Toyota about your interest in the ${car}.`, timestamp: now - 8000 },
      { speaker: 'bot', text: 'Are you still looking to explore this vehicle?', timestamp: now - 6000 },
    )
  }

  if (status === 'interested') {
    msgs.push(
      { speaker: 'bot', text: `Hello ${lead.name.split(' ')[0]}! I'm calling from Toyota about your interest in the ${car}.`, timestamp: now - 12000 },
      { speaker: 'bot', text: 'Are you still looking to explore this vehicle?', timestamp: now - 10000 },
      { speaker: 'customer', text: 'Yes, I am interested. Tell me more about it.', timestamp: now - 7000 },
      { speaker: 'bot', text: "That's great! The Toyota Fortuner offers premium comfort and powerful performance.", timestamp: now - 5000 },
      { speaker: 'bot', text: "Our senior executive will get in touch with you shortly. You'll also receive a WhatsApp with more details.", timestamp: now - 3000 },
      { speaker: 'customer', text: 'Sure, that sounds good. Thank you!', timestamp: now - 1000 },
    )
  }

  if (status === 'not_interested') {
    msgs.push(
      { speaker: 'bot', text: `Hello ${lead.name.split(' ')[0]}! I'm calling from Toyota about your interest in the ${car}.`, timestamp: now - 12000 },
      { speaker: 'bot', text: 'Are you still looking to explore this vehicle?', timestamp: now - 10000 },
      { speaker: 'customer', text: "No, I'm not interested anymore.", timestamp: now - 7000 },
      { speaker: 'bot', text: "No problem at all. Thank you for your time. Have a great day!", timestamp: now - 4000 },
    )
  }

  if (status === 'call_later') {
    msgs.push(
      { speaker: 'bot', text: `Hello ${lead.name.split(' ')[0]}! I'm calling from Toyota about your interest in the ${car}.`, timestamp: now - 12000 },
      { speaker: 'bot', text: 'Are you still looking to explore this vehicle?', timestamp: now - 10000 },
      { speaker: 'customer', text: "Can you call me after 2 hours? I'm busy right now.", timestamp: now - 7000 },
      { speaker: 'bot', text: "Of course! I'll call you back later. Thank you!", timestamp: now - 4000 },
    )
  }

  if (status === 'whatsapp_sent') {
    msgs.push(
      { speaker: 'bot', text: `Hi ${lead.name.split(' ')[0]}, we tried reaching you about the Toyota ${car}. Are you still interested? Reply YES or NO.`, timestamp: now - 2000 },
    )
  }

  return msgs
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
