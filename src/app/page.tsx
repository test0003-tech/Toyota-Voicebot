'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, PhoneOff, PhoneIncoming, PhoneMissed, PhoneCall,
  MessageSquare, Users, Trash2, TrendingUp, Clock, Zap,
  ArrowRight, ChevronRight, Bot, User, Send, BarChart3,
  Activity, AlertTriangle, CheckCircle2, XCircle, Timer,
  Volume2, Pause, Play, FastForward, RotateCcw, Wifi,
  MessageCircle, Filter, Target, Sparkles, ArrowDownRight,
  ArrowDown, ArrowRightLeft, CircleDot, Database, Inbox,
  PhoneForwarded, PhoneOutgoing, Siren, Waypoints,
} from 'lucide-react'
import {
  useHyperXStore,
  getStatusColor,
  getStatusBgColor,
  getStatusLabel,
  getStatusIcon,
  type Lead,
  type LeadStatus,
  type ChatMessage,
  type FlowNodeStats,
} from '@/lib/hyperx-store'
import { useSimulation } from '@/lib/use-simulation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

// ─── Pulse Dot ──────────────────────────────────────────────────────────────

function PulseDot({ color = 'bg-green-400', size = 'h-2 w-2' }: { color?: string; size?: string }) {
  return (
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex rounded-full ${size} ${color}`} />
    </span>
  )
}

// ─── Time Jump Buttons ──────────────────────────────────────────────────────

function TimeJumpBar() {
  const { timeJump, isSimulating, startSimulation } = useSimulation()
  const simTime = useHyperXStore((s) => s.simTime)
  const speed = useHyperXStore((s) => s.simulationSpeed)
  const setSpeed = useHyperXStore((s) => s.setSimulationSpeed)

  const timeButtons = [
    { hours: 2, label: '2 Hrs Complete', color: 'from-amber-500 to-orange-500', active: simTime >= 2 },
    { hours: 4, label: '4 Hrs Complete', color: 'from-orange-500 to-red-500', active: simTime >= 4 },
    { hours: 24, label: '24 Hrs Complete', color: 'from-red-500 to-pink-500', active: simTime >= 24 },
    { hours: 48, label: '48 Hrs Complete', color: 'from-pink-500 to-purple-500', active: simTime >= 48 },
  ]

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-2 py-1">
        <Clock className="h-3 w-3 text-cyan-400" />
        <span className="text-[10px] text-slate-400 mr-1">Sim Time:</span>
        <span className="text-xs font-bold text-cyan-400">{simTime.toFixed(1)} hrs</span>
      </div>

      <div className="flex gap-1.5">
        {timeButtons.map((btn) => (
          <Button
            key={btn.hours}
            size="sm"
            onClick={() => timeJump(btn.hours)}
            className={`text-[10px] h-7 px-2.5 ${
              btn.active
                ? `bg-gradient-to-r ${btn.color} text-white shadow-lg`
                : 'bg-slate-800/80 border border-slate-600/30 text-slate-300 hover:bg-slate-700/80'
            }`}
          >
            <FastForward className="h-3 w-3 mr-1" />
            {btn.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-2 py-1">
        <span className="text-[10px] text-slate-400">Speed:</span>
        {[1, 2, 4, 8].map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`text-[10px] px-1.5 py-0.5 rounded transition-all ${
              speed === s ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Stats Bar ──────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = useHyperXStore((s) => s.stats)

  const statItems = [
    { label: 'Leads In', value: stats.totalLeadsReceived, icon: Inbox, color: 'text-amber-400', bg: 'from-amber-500/10 to-orange-500/10' },
    { label: 'Calls Made', value: stats.totalCallsMade, icon: PhoneCall, color: 'text-cyan-400', bg: 'from-cyan-500/10 to-teal-500/10' },
    { label: 'Active', value: stats.totalCallsActive, icon: Activity, color: 'text-yellow-400', bg: 'from-yellow-500/10 to-amber-500/10' },
    { label: 'WhatsApp', value: stats.totalWhatsappSent, icon: MessageCircle, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-green-500/10' },
    { label: 'CRM', value: stats.totalInterested, icon: CheckCircle2, color: 'text-green-400', bg: 'from-green-500/10 to-emerald-500/10' },
    { label: 'Junk', value: stats.totalJunk, icon: Trash2, color: 'text-red-400', bg: 'from-red-500/10 to-orange-500/10' },
    { label: 'Failed', value: stats.totalFailed, icon: XCircle, color: 'text-gray-400', bg: 'from-gray-500/10 to-slate-500/10' },
    { label: 'Conversion', value: `${stats.conversionRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-purple-400', bg: 'from-purple-500/10 to-pink-500/10' },
  ]

  return (
    <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
      {statItems.map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.03 }}
          className={`bg-gradient-to-br ${item.bg} border border-slate-700/30 rounded-xl p-2.5 text-center`}
        >
          <item.icon className={`h-4 w-4 mx-auto mb-1 ${item.color}`} />
          <div className="text-xl font-bold text-white">{item.value}</div>
          <div className="text-[10px] text-slate-400">{item.label}</div>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Animated Flowchart ─────────────────────────────────────────────────────

function AnimatedFlowchart() {
  const stats = useHyperXStore((s) => s.stats)
  const leads = useHyperXStore((s) => s.leads)
  const flow = stats.flowNodes

  // Animated particles flowing through the diagram
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; path: string }>>([])
  const particleId = useRef(0)

  // Generate particles based on active leads
  useEffect(() => {
    const activeLeads = leads.filter((l) => !['crm_transferred', 'junk', 'failed'].includes(l.status))
    if (activeLeads.length === 0) return

    const interval = setInterval(() => {
      const randomLead = activeLeads[Math.floor(Math.random() * activeLeads.length)]
      if (!randomLead) return

      let color = 'bg-amber-400'
      let path = 'to-calling'

      if (['new'].includes(randomLead.status)) {
        color = 'bg-amber-400'; path = 'to-calling'
      } else if (['calling', 'ringing'].includes(randomLead.status)) {
        color = 'bg-yellow-400'; path = 'to-ring'
      } else if (['connected', 'conversation'].includes(randomLead.status)) {
        color = 'bg-green-400'; path = Math.random() > 0.5 ? 'to-interested' : 'to-not-interested'
      } else if (['interested', 'whatsapp_sent', 'whatsapp_yes'].includes(randomLead.status)) {
        color = 'bg-emerald-400'; path = 'to-crm'
      } else if (['not_interested'].includes(randomLead.status)) {
        color = 'bg-red-400'; path = 'to-junk'
      } else if (['no_answer', 'call_later'].includes(randomLead.status)) {
        color = 'bg-orange-400'; path = 'to-retry'
      } else if (['whatsapp_no'].includes(randomLead.status)) {
        color = 'bg-red-400'; path = 'to-junk-wa'
      }

      setParticles((prev) => {
        const newParticles = [...prev, { id: ++particleId.current, x: 0, y: 0, color, path }]
        // Keep max 20 particles
        return newParticles.slice(-20)
      })

      // Remove particle after animation
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== particleId.current))
      }, 2000)
    }, 400)

    return () => clearInterval(interval)
  }, [leads])

  // Flow node component
  const FlowNode = ({
    label, count, icon: Icon, color, bgColor, borderColor, x, y, pulse,
  }: {
    label: string; count: number; icon: any; color: string; bgColor: string; borderColor: string;
    x: string; y: string; pulse?: boolean
  }) => (
    <motion.div
      className={`absolute ${x} ${y} z-10`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className={`relative ${bgColor} border ${borderColor} rounded-xl px-3 py-2 min-w-[100px] text-center shadow-xl`}>
        {pulse && <PulseDot color={color.replace('text-', 'bg-')} />}
        <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
        <div className={`text-lg font-bold ${color}`}>{count}</div>
        <div className="text-[9px] text-slate-300 font-medium">{label}</div>
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-xl ${bgColor} opacity-50 blur-sm -z-10`} />
      </div>
    </motion.div>
  )

  // Animated arrow
  const FlowArrow = ({ x1, y1, x2, y2, color, dashed, label }: {
    x1: string; y1: string; x2: string; y2: string; color: string; dashed?: boolean; label?: string
  }) => (
    <div className="absolute" style={{ left: 0, top: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
      <svg className="w-full h-full" viewBox="0 0 1000 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d={`M${x1},${y1} C${(parseInt(x1)+parseInt(x2))/2},${y1} ${(parseInt(x1)+parseInt(x2))/2},${y2} ${x2},${y2}`}
          stroke={color}
          strokeWidth={dashed ? 1.5 : 2}
          strokeDasharray={dashed ? '6 4' : 'none'}
          fill="none"
          opacity={0.5}
        />
      </svg>
      {label && (
        <div
          className="absolute text-[8px] text-slate-500"
          style={{
            left: `${(parseInt(x1) + parseInt(x2)) / 2 / 10}%`,
            top: `${(parseInt(y1) + parseInt(y2)) / 2 / 4}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {label}
        </div>
      )}
    </div>
  )

  // Particle animation
  const ParticleDot = ({ particle }: { particle: { id: number; color: string; path: string } }) => {
    const pathAnimations: Record<string, { startX: string; startY: string; endX: string; endY: string }> = {
      'to-calling': { startX: '4%', startY: '42%', endX: '18%', endY: '42%' },
      'to-ring': { startX: '22%', startY: '42%', endX: '34%', endY: '42%' },
      'to-interested': { startX: '42%', startY: '25%', endX: '58%', endY: '18%' },
      'to-not-interested': { startX: '42%', startY: '60%', endX: '58%', endY: '72%' },
      'to-crm': { startX: '68%', startY: '18%', endX: '85%', endY: '18%' },
      'to-junk': { startX: '68%', startY: '72%', endX: '85%', endY: '78%' },
      'to-retry': { startX: '42%', startY: '55%', endX: '18%', endY: '55%' },
      'to-junk-wa': { startX: '68%', startY: '48%', endX: '85%', endY: '78%' },
    }

    const anim = pathAnimations[particle.path] || pathAnimations['to-calling']

    return (
      <motion.div
        className={`absolute ${particle.color} rounded-full shadow-lg`}
        style={{ width: 8, height: 8, zIndex: 30, boxShadow: `0 0 8px currentColor` }}
        initial={{ left: anim.startX, top: anim.startY, opacity: 1, scale: 1 }}
        animate={{ left: anim.endX, top: anim.endY, opacity: 0.3, scale: 0.5 }}
        transition={{ duration: 1.8, ease: 'easeInOut' }}
      />
    )
  }

  return (
    <div className="bg-slate-900/95 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Waypoints className="h-4 w-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Live Process Flow</h3>
        <div className="flex-1" />
        <Badge variant="outline" className="text-[9px] border-cyan-500/30 text-cyan-400">
          <Activity className="h-2.5 w-2.5 mr-1" />
          Real-time
        </Badge>
      </div>

      {/* Flow Diagram */}
      <div className="relative" style={{ height: 320 }}>
        {/* Particles */}
        {particles.map((p) => (
          <ParticleDot key={p.id} particle={p} />
        ))}

        {/* SVG Connections */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* CarWale → HyperX Calling */}
          <path d="M110,180 C140,180 140,180 180,180" stroke="#f59e0b" strokeWidth="2" opacity="0.4" />
          {/* Calling → Ringing */}
          <path d="M280,180 C310,180 310,180 340,180" stroke="#22d3ee" strokeWidth="2" opacity="0.4" />
          {/* Ringing → Connected (top) */}
          <path d="M440,170 C470,100 470,70 500,70" stroke="#4ade80" strokeWidth="2" opacity="0.4" />
          {/* Ringing → No Answer (bottom) */}
          <path d="M440,190 C470,260 470,230 500,240" stroke="#9ca3af" strokeWidth="2" opacity="0.4" />
          {/* Connected → Interested */}
          <path d="M600,70 C630,50 630,50 660,50" stroke="#22c55e" strokeWidth="2" opacity="0.4" />
          {/* Connected → Not Interested */}
          <path d="M600,80 C630,120 630,140 660,155" stroke="#ef4444" strokeWidth="2" opacity="0.4" />
          {/* Connected → Call Later */}
          <path d="M600,75 C630,200 630,200 660,230" stroke="#f97316" strokeWidth="2" opacity="0.4" />
          {/* No Answer → Retry (loop back) */}
          <path d="M500,260 C400,320 200,320 180,200" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.3" />
          <text x="340" y="340" fill="#64748b" fontSize="10" textAnchor="middle">Retry 2hr→4hr→24hr</text>
          {/* No Answer → WhatsApp (after 4th) */}
          <path d="M550,240 C600,240 620,200 660,165" stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.3" />
          <text x="620" y="195" fill="#64748b" fontSize="9" textAnchor="middle">After 4th attempt</text>
          {/* Interested → WhatsApp → CRM */}
          <path d="M760,50 C800,50 820,50 860,50" stroke="#22c55e" strokeWidth="2" opacity="0.4" />
          {/* Not Interested → Junk */}
          <path d="M760,155 C800,155 820,155 860,165" stroke="#ef4444" strokeWidth="2" opacity="0.4" />
          {/* Call Later → Retry loop */}
          <path d="M760,230 C800,280 400,350 180,200" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.3" />
          <text x="480" y="365" fill="#64748b" fontSize="9" textAnchor="middle">Same retry cycle</text>
          {/* WhatsApp No → Junk */}
          <path d="M760,165 C800,180 820,200 860,165" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.3" />

          {/* Arrow heads */}
          {[
            { x: 180, y: 180, angle: 0 },
            { x: 340, y: 180, angle: 0 },
            { x: 500, y: 70, angle: -30 },
            { x: 500, y: 240, angle: 20 },
            { x: 660, y: 50, angle: 0 },
            { x: 660, y: 155, angle: 15 },
            { x: 660, y: 230, angle: 15 },
            { x: 860, y: 50, angle: 0 },
            { x: 860, y: 165, angle: 5 },
          ].map((arrow, i) => (
            <polygon
              key={i}
              points={`${arrow.x},${arrow.y} ${arrow.x - 8},${arrow.y - 4} ${arrow.x - 8},${arrow.y + 4}`}
              fill="#64748b"
              opacity="0.6"
            />
          ))}
        </svg>

        {/* Flow Nodes */}
        {/* CarWale Source */}
        <div className="absolute left-[2%] top-[34%] z-10">
          <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl px-3 py-2 text-center shadow-xl min-w-[90px]">
            <Database className="h-4 w-4 mx-auto mb-1 text-amber-400" />
            <div className="text-lg font-bold text-amber-400">{flow.new + stats.totalLeadsReceived}</div>
            <div className="text-[9px] text-amber-300/80 font-medium">CarWale.com</div>
            <div className="text-[8px] text-amber-400/50">Lead Source</div>
          </div>
        </div>

        {/* HyperX Calling */}
        <div className="absolute left-[16%] top-[34%] z-10">
          <div className="bg-cyan-500/15 border border-cyan-500/30 rounded-xl px-3 py-2 text-center shadow-xl min-w-[90px]">
            <PulseDot color="bg-cyan-400" size="h-2 w-2" />
            <Bot className="h-4 w-4 mx-auto mb-1 text-cyan-400" />
            <div className="text-lg font-bold text-cyan-400">{flow.calling + flow.ringing}</div>
            <div className="text-[9px] text-cyan-300/80 font-medium">Hyper X</div>
            <div className="text-[8px] text-cyan-400/50">Calling/Ringing</div>
          </div>
        </div>

        {/* Ringing / Connected Split */}
        <div className="absolute left-[32%] top-[34%] z-10">
          <div className="bg-yellow-500/15 border border-yellow-500/30 rounded-xl px-3 py-2 text-center shadow-xl min-w-[90px]">
            <Phone className="h-4 w-4 mx-auto mb-1 text-yellow-400" />
            <div className="text-lg font-bold text-yellow-400">{flow.connected + flow.conversation}</div>
            <div className="text-[9px] text-yellow-300/80 font-medium">Connected</div>
            <div className="text-[8px] text-yellow-400/50">In Conversation</div>
          </div>
        </div>

        {/* Interested */}
        <div className="absolute left-[62%] top-[5%] z-10">
          <div className="bg-green-500/15 border border-green-500/30 rounded-xl px-3 py-2 text-center shadow-xl min-w-[90px]">
            <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-green-400" />
            <div className="text-lg font-bold text-green-400">{flow.interested + flow.whatsapp_sent + flow.whatsapp_yes}</div>
            <div className="text-[9px] text-green-300/80 font-medium">Interested</div>
            <div className="text-[8px] text-green-400/50">+ WhatsApp</div>
          </div>
        </div>

        {/* Not Interested */}
        <div className="absolute left-[62%] top-[32%] z-10">
          <div className="bg-red-500/15 border border-red-500/30 rounded-xl px-3 py-2 text-center shadow-xl min-w-[90px]">
            <XCircle className="h-4 w-4 mx-auto mb-1 text-red-400" />
            <div className="text-lg font-bold text-red-400">{flow.not_interested}</div>
            <div className="text-[9px] text-red-300/80 font-medium">Not Interested</div>
            <div className="text-[8px] text-red-400/50">→ Junk</div>
          </div>
        </div>

        {/* Call Later / No Answer */}
        <div className="absolute left-[62%] top-[55%] z-10">
          <div className="bg-orange-500/15 border border-orange-500/30 rounded-xl px-3 py-2 text-center shadow-xl min-w-[90px]">
            <Timer className="h-4 w-4 mx-auto mb-1 text-orange-400" />
            <div className="text-lg font-bold text-orange-400">{flow.call_later + flow.no_answer}</div>
            <div className="text-[9px] text-orange-300/80 font-medium">Call Later</div>
            <div className="text-[8px] text-orange-400/50">No Answer → Retry</div>
          </div>
        </div>

        {/* Toyota CRM */}
        <div className="absolute left-[82%] top-[5%] z-10">
          <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-3 py-2 text-center shadow-xl shadow-emerald-500/10 min-w-[100px]">
            <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
            <div className="text-xl font-bold text-emerald-400">{flow.crm_transferred}</div>
            <div className="text-[9px] text-emerald-300/80 font-bold">Toyota CRM</div>
            <div className="text-[8px] text-emerald-400/50">Qualified Leads</div>
          </div>
        </div>

        {/* Junk Bin */}
        <div className="absolute left-[82%] top-[38%] z-10">
          <div className="bg-red-500/15 border border-red-500/40 rounded-xl px-3 py-2 text-center shadow-xl shadow-red-500/10 min-w-[100px]">
            <Trash2 className="h-5 w-5 mx-auto mb-1 text-red-400" />
            <div className="text-xl font-bold text-red-400">{flow.junk}</div>
            <div className="text-[9px] text-red-300/80 font-bold">Junk Bin</div>
            <div className="text-[8px] text-red-400/50">Removed Leads</div>
          </div>
        </div>

        {/* Failed */}
        <div className="absolute left-[82%] top-[62%] z-10">
          <div className="bg-gray-500/15 border border-gray-500/40 rounded-xl px-3 py-2 text-center shadow-xl min-w-[100px]">
            <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-gray-400" />
            <div className="text-lg font-bold text-gray-400">{flow.failed}</div>
            <div className="text-[9px] text-gray-300/80 font-bold">Failed</div>
            <div className="text-[8px] text-gray-400/50">No Response 48hr</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Aggregator Panel ───────────────────────────────────────────────────────

function AggregatorPanel() {
  const leads = useHyperXStore((s) => s.leads)
  const selectedLeadId = useHyperXStore((s) => s.selectedLeadId)
  const setSelected = useHyperXStore((s) => s.setSelectedLeadId)

  return (
    <div className="h-full flex flex-col bg-slate-900/95 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="p-3 bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-b border-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Database className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-300">CARWALE.COM</h2>
              <p className="text-[10px] text-amber-400/60">Lead Aggregator Stream</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <PulseDot color="bg-amber-400" />
            <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-300 bg-amber-500/10">
              {leads.filter((l) => !['crm_transferred', 'junk', 'failed'].includes(l.status)).length} Active
            </Badge>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1.5">
          <AnimatePresence mode="popLayout">
            {leads.slice(0, 40).map((lead) => (
              <motion.div
                key={lead.id}
                layout
                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                onClick={() => setSelected(lead.id === selectedLeadId ? null : lead.id)}
                className={`cursor-pointer rounded-lg border p-2 transition-all ${
                  lead.id === selectedLeadId
                    ? 'border-cyan-500/50 bg-cyan-500/10 ring-1 ring-cyan-500/30'
                    : `border-slate-700/30 ${getStatusBgColor(lead.status)} hover:border-slate-600/50`
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">{getStatusIcon(lead.status)}</span>
                    <span className="text-xs font-semibold text-slate-200">{lead.id}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1.5 py-0 ${getStatusBgColor(lead.status)} ${getStatusColor(lead.status)} border-0`}
                  >
                    {getStatusLabel(lead.status)}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-300 truncate">{lead.name}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-500">CarWale.com</span>
                  {lead.attemptCount > 0 && (
                    <span className="text-[10px] text-slate-500">
                      Attempt {lead.attemptCount}/{lead.maxAttempts}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  )
}

// ─── Call Card (Active Call) ────────────────────────────────────────────────

function CallCard({ lead, isSelected, onSelect }: { lead: Lead; isSelected: boolean; onSelect: () => void }) {
  const isOnCall = ['calling', 'ringing', 'connected', 'conversation'].includes(lead.status)
  const callElapsed = lead.callStartTime ? Math.floor((Date.now() - lead.callStartTime) / 1000) : 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={onSelect}
      className={`cursor-pointer rounded-xl border p-3 transition-all ${
        isSelected
          ? 'border-cyan-400/50 bg-cyan-900/30 ring-2 ring-cyan-400/20'
          : isOnCall
          ? 'border-cyan-500/20 bg-slate-800/80 hover:border-cyan-500/40'
          : 'border-slate-700/30 bg-slate-800/50 hover:border-slate-600/50'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {isOnCall && <PulseDot color="bg-green-400" size="h-2.5 w-2.5" />}
          <span className="text-sm font-bold text-white">{lead.name}</span>
        </div>
        <Badge
          variant="outline"
          className={`text-[10px] px-1.5 py-0 ${getStatusBgColor(lead.status)} ${getStatusColor(lead.status)} border-0`}
        >
          {getStatusLabel(lead.status)}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-400">{lead.phone}</span>
        <span className="text-slate-500">Attempt {lead.attemptCount}/{lead.maxAttempts}</span>
      </div>
      {lead.selectedCar && (
        <div className="mt-1 text-[10px] text-cyan-400/80 flex items-center gap-1">
          <Target className="h-3 w-3" /> Toyota {lead.selectedCar}
        </div>
      )}
      {isOnCall && (
        <div className="mt-2 flex items-center gap-1.5">
          <Volume2 className="h-3 w-3 text-green-400 animate-pulse" />
          <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-400 rounded-full"
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <span className="text-[10px] text-green-400">LIVE</span>
        </div>
      )}
      {lead.status === 'whatsapp_sent' && (
        <div className="mt-2 flex items-center gap-1.5">
          <MessageCircle className="h-3 w-3 text-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400">Waiting for WhatsApp response...</span>
        </div>
      )}
    </motion.div>
  )
}

// ─── Chat Script Panel ──────────────────────────────────────────────────────

function ChatScriptPanel({ lead }: { lead: Lead | undefined }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lead?.chatMessages?.length])

  if (!lead) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-slate-600" />
          <p>Select a lead to view call script</p>
          <p className="text-[10px] text-slate-600 mt-1">Click any lead in the Aggregator or Active Calls panel</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Call header */}
      <div className="px-3 py-2 bg-slate-800/50 border-b border-slate-700/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            ['ringing', 'calling', 'connected', 'conversation'].includes(lead.status) ? 'bg-green-400 animate-pulse' : 'bg-slate-500'
          }`} />
          <span className="text-xs font-medium text-slate-300">{lead.name}</span>
          <span className="text-[10px] text-slate-500">{lead.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-[9px] px-1.5 py-0 ${getStatusBgColor(lead.status)} ${getStatusColor(lead.status)} border-0`}
          >
            {getStatusLabel(lead.status)}
          </Badge>
          {lead.attemptCount > 0 && (
            <span className="text-[9px] text-slate-500">Attempt {lead.attemptCount}/{lead.maxAttempts}</span>
          )}
        </div>
      </div>

      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
        {lead.chatMessages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-2 ${
              msg.speaker === 'system' ? 'justify-center' : msg.speaker === 'bot' ? '' : 'flex-row-reverse'
            }`}
          >
            {msg.speaker === 'system' ? (
              <div className="text-center">
                <span className="text-[10px] text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
                  {msg.text}
                </span>
              </div>
            ) : (
              <>
                <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                  msg.speaker === 'bot' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {msg.speaker === 'bot' ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                </div>
                <div className={`max-w-[78%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                  msg.speaker === 'bot'
                    ? 'bg-slate-700/50 text-slate-200 rounded-tl-none'
                    : 'bg-cyan-600/20 text-cyan-100 rounded-tr-none'
                }`}>
                  <div className={`text-[9px] font-semibold mb-0.5 ${
                    msg.speaker === 'bot' ? 'text-cyan-400' : 'text-amber-400'
                  }`}>
                    {msg.speaker === 'bot' ? 'Hyper X Bot' : lead.name.split(' ')[0]}
                  </div>
                  {msg.text}
                </div>
              </>
            )}
          </motion.div>
        ))}

        {['ringing', 'calling'].includes(lead.status) && (
          <div className="flex items-center gap-2 text-slate-500 text-xs justify-center">
            <div className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-yellow-400">Ringing...</span>
          </div>
        )}

        {lead.status === 'conversation' && (
          <div className="flex items-center gap-2 text-green-400 text-xs justify-center">
            <Volume2 className="h-3 w-3 animate-pulse" />
            <span>Conversation in progress...</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Hyper X Panel ──────────────────────────────────────────────────────────

function HyperXPanel() {
  const leads = useHyperXStore((s) => s.leads)
  const selectedLeadId = useHyperXStore((s) => s.selectedLeadId)
  const setSelected = useHyperXStore((s) => s.setSelectedLeadId)
  const stats = useHyperXStore((s) => s.stats)

  const activeLeads = leads.filter((l) => !['crm_transferred', 'junk', 'failed'].includes(l.status))
  const selectedLead = leads.find((l) => l.id === selectedLeadId)

  return (
    <div className="h-full flex flex-col bg-slate-900/95 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-cyan-600/20 to-teal-600/20 border-b border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-cyan-300">HYPER X</h2>
              <p className="text-[10px] text-cyan-400/60">AI Voice Bot Agent</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-300">{stats.totalCallsActive}</div>
              <div className="text-[9px] text-cyan-400/60">Active</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{stats.totalCallsMade}</div>
              <div className="text-[9px] text-slate-400">Total</div>
            </div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md px-2 py-1 text-center">
            <div className="text-xs font-bold text-yellow-300">{leads.filter((l) => ['ringing', 'calling'].includes(l.status)).length}</div>
            <div className="text-[8px] text-yellow-400/60">Ringing</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-md px-2 py-1 text-center">
            <div className="text-xs font-bold text-green-300">{leads.filter((l) => ['connected', 'conversation'].includes(l.status)).length}</div>
            <div className="text-[8px] text-green-400/60">On Call</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-1 text-center">
            <div className="text-xs font-bold text-emerald-300">{leads.filter((l) => l.status === 'whatsapp_sent').length}</div>
            <div className="text-[8px] text-emerald-400/60">WhatsApp</div>
          </div>
        </div>
      </div>

      {/* Active calls */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-2 border-b border-slate-700/30 flex items-center justify-between">
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Calls</h3>
          <Badge variant="outline" className="text-[9px] border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
            {activeLeads.length} live
          </Badge>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-2 space-y-2">
            <AnimatePresence mode="popLayout">
              {activeLeads.map((lead) => (
                <CallCard
                  key={lead.id}
                  lead={lead}
                  isSelected={lead.id === selectedLeadId}
                  onSelect={() => setSelected(lead.id === selectedLeadId ? null : lead.id)}
                />
              ))}
            </AnimatePresence>
            {activeLeads.length === 0 && (
              <div className="text-center text-slate-600 text-xs py-8">
                <Phone className="h-8 w-8 mx-auto mb-2 text-slate-700" />
                Waiting for leads...
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Script */}
      <div className="h-72 border-t border-cyan-500/10 flex flex-col">
        <div className="px-3 py-1.5 bg-slate-800/50 border-b border-slate-700/30 flex items-center gap-2">
          <MessageSquare className="h-3 w-3 text-cyan-400" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Live Call Script</span>
          {selectedLead && (
            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${getStatusBgColor(selectedLead.status)} ${getStatusColor(selectedLead.status)} border-0`}>
              {getStatusLabel(selectedLead.status)}
            </Badge>
          )}
        </div>
        <ChatScriptPanel lead={selectedLead} />
      </div>
    </div>
  )
}

// ─── Toyota CRM Panel ───────────────────────────────────────────────────────

function ToyotaCRMPanel() {
  const leads = useHyperXStore((s) => s.leads)
  const crmLeads = leads.filter((l) => l.status === 'crm_transferred')
  const junkLeads = leads.filter((l) => l.status === 'junk')
  const failedLeads = leads.filter((l) => l.status === 'failed')

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Toyota CRM */}
      <div className="flex-1 flex flex-col bg-slate-900/95 border border-emerald-500/20 rounded-xl overflow-hidden">
        <div className="p-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-b border-green-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-green-300">TOYOTA CRM</h2>
                <p className="text-[10px] text-green-400/60">Qualified Leads</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <PulseDot color="bg-green-400" />
              <span className="text-lg font-bold text-green-400">{crmLeads.length}</span>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1.5">
            <AnimatePresence mode="popLayout">
              {crmLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  layout
                  initial={{ opacity: 0, x: 30, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="rounded-lg border border-green-500/20 bg-green-500/5 p-2.5"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-green-300">{lead.name}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  </div>
                  <div className="text-[10px] text-slate-400">{lead.phone}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-cyan-400/80 flex items-center gap-1">
                      <Target className="h-2.5 w-2.5" /> Toyota {lead.selectedCar}
                    </span>
                    <span className="text-[10px] text-green-400/60">CarWale.com</span>
                  </div>
                  {lead.callDuration > 0 && (
                    <div className="text-[10px] text-slate-500 mt-1">
                      Call: {lead.callDuration}s | {lead.attemptCount} attempt(s)
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {crmLeads.length === 0 && (
              <div className="text-center text-slate-600 text-xs py-8">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-700" />
                No qualified leads yet
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Junk Bin */}
      <div className="h-44 flex flex-col bg-slate-900/95 border border-red-500/20 rounded-xl overflow-hidden">
        <div className="p-2.5 bg-gradient-to-r from-red-600/20 to-orange-600/20 border-b border-red-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-400" />
              <h2 className="text-xs font-bold text-red-300">JUNK / FAILED LEADS</h2>
            </div>
            <Badge variant="outline" className="text-[9px] border-red-500/30 text-red-400 bg-red-500/10">
              {junkLeads.length + failedLeads.length}
            </Badge>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            <AnimatePresence mode="popLayout">
              {[...junkLeads, ...failedLeads].map((lead) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between rounded-md border border-red-500/10 bg-red-500/5 px-2 py-1"
                >
                  <div className="flex items-center gap-1.5">
                    <XCircle className="h-3 w-3 text-red-400/60" />
                    <span className="text-[10px] text-slate-400">{lead.name}</span>
                  </div>
                  <span className="text-[9px] text-red-400/60">
                    {lead.status === 'junk' ? 'JUNK' : 'FAILED'}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function HyperXDashboard() {
  const { startSimulation, stopSimulation, isSimulating, timeJump } = useSimulation()
  const resetAll = useHyperXStore((s) => s.resetAll)
  const [hasStarted, setHasStarted] = useState(false)

  const handleStart = () => {
    if (!hasStarted) setHasStarted(true)
    startSimulation()
  }

  const handleReset = () => {
    stopSimulation()
    resetAll()
    setHasStarted(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Top Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  HYPER X
                </h1>
                <p className="text-[10px] text-slate-500">AI Voice Bot Lead Qualification System | CarWale.com</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isSimulating ? (
                <Button
                  size="sm"
                  onClick={handleStart}
                  className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs"
                >
                  <Play className="h-3 w-3 mr-1" /> Start Simulation
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={stopSimulation}
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-xs"
                >
                  <Pause className="h-3 w-3 mr-1" /> Pause
                </Button>
              )}
              {hasStarted && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="border-slate-600/30 text-slate-400 hover:bg-slate-700/50 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" /> Reset
                </Button>
              )}
            </div>
          </div>

          {/* Time Jump Bar */}
          <TimeJumpBar />
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto p-3 space-y-3">
        {/* Stats */}
        <StatsBar />

        {/* Flowchart */}
        <AnimatedFlowchart />

        {/* Three-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3" style={{ minHeight: 'calc(100vh - 560px)' }}>
          {/* Left: Aggregator */}
          <div className="lg:col-span-3">
            <AggregatorPanel />
          </div>

          {/* Center: Hyper X */}
          <div className="lg:col-span-5">
            <HyperXPanel />
          </div>

          {/* Right: Toyota CRM + Junk */}
          <div className="lg:col-span-4">
            <ToyotaCRMPanel />
          </div>
        </div>
      </main>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
