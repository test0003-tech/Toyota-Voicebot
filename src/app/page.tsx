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
  PhoneForwarded, PhoneOutgoing, Siren, Waypoints, Globe,
  RefreshCw, PhoneCall as PhoneCallIcon,
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

// ─── Flow Node Box ──────────────────────────────────────────────────────────

function FlowBox({
  icon: Icon, label, sublabel, count, color, glow, pulse,
}: {
  icon: any; label: string; sublabel?: string; count: number;
  color: string; glow: string; pulse?: boolean
}) {
  return (
    <div className={`relative rounded-xl border ${color} ${glow} px-4 py-3 text-center min-w-[120px] shadow-lg`}>
      {pulse && <div className="absolute -top-1 -right-1"><PulseDot color="bg-cyan-400" size="h-1.5 w-1.5" /></div>}
      <Icon className={`h-5 w-5 mx-auto mb-1 ${color.split(' ')[0]}`} />
      <div className={`text-2xl font-bold ${color.split(' ')[0]} tabular-nums`}>{count}</div>
      <div className="text-[11px] text-slate-200 font-semibold mt-0.5">{label}</div>
      {sublabel && <div className="text-[9px] text-slate-400 mt-0.5">{sublabel}</div>}
    </div>
  )
}

// ─── Flow Arrow ─────────────────────────────────────────────────────────────

function FlowArrow({ label, color = 'text-slate-500', vertical = false, dashed = false }: {
  label?: string; color?: string; vertical?: boolean; dashed?: boolean
}) {
  if (vertical) {
    return (
      <div className="flex flex-col items-center py-1">
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown className={`h-5 w-5 ${color}`} />
        </motion.div>
        {label && <span className={`text-[9px] ${color} mt-0.5 text-center max-w-[80px]`}>{label}</span>}
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1 px-1">
      <motion.div
        animate={{ x: [0, 4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`flex items-center ${dashed ? 'opacity-50' : ''}`}
      >
        <div className={`w-6 border-t-2 ${dashed ? 'border-dashed' : ''} ${color.replace('text-', 'border-')}`} />
        <ArrowRight className={`h-4 w-4 ${color}`} />
      </motion.div>
      {label && <span className={`text-[8px] ${color} whitespace-nowrap`}>{label}</span>}
    </div>
  )
}

// ─── Animated Lead Dot ──────────────────────────────────────────────────────

function LeadDot({ color, delay = 0 }: { color: string; delay?: number }) {
  return (
    <motion.div
      className={`w-2.5 h-2.5 rounded-full ${color} shadow-lg`}
      style={{ boxShadow: `0 0 6px currentColor` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
      transition={{ delay, duration: 0.4 }}
    />
  )
}

// ─── Animated Flowchart (CLEAN STRUCTURED LAYOUT) ───────────────────────────

function AnimatedFlowchart() {
  const stats = useHyperXStore((s) => s.stats)
  const leads = useHyperXStore((s) => s.leads)
  const flow = stats.flowNodes

  // Count leads in various states for animated dots
  const callingCount = leads.filter(l => ['calling', 'ringing'].includes(l.status)).length
  const connectedCount = leads.filter(l => ['connected', 'conversation'].includes(l.status)).length
  const interestedCount = leads.filter(l => ['interested', 'whatsapp_sent', 'whatsapp_yes'].includes(l.status)).length
  const notInterestedCount = leads.filter(l => ['not_interested'].includes(l.status)).length
  const noAnswerCount = leads.filter(l => ['no_answer', 'call_later'].includes(l.status)).length
  const whatsappNoCount = leads.filter(l => ['whatsapp_no'].includes(l.status)).length

  return (
    <div className="bg-slate-900/95 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Waypoints className="h-4 w-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">Live Process Flow</h3>
        <div className="flex-1" />
        <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400">
          <Activity className="h-3 w-3 mr-1" /> Real-time
        </Badge>
      </div>

      {/* ── ROW 1: Main Pipeline ── */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* CarWale Source */}
        <FlowBox
          icon={Globe}
          label="CarWale.com"
          sublabel="Lead Source"
          count={stats.totalLeadsReceived}
          color="text-amber-400 border-amber-500/30 bg-amber-500/10"
          glow="shadow-amber-500/5"
        />

        <FlowArrow label="leads flow" color="text-amber-400" />

        {/* Hyper X Calling */}
        <div className="relative">
          <FlowBox
            icon={Bot}
            label="Hyper X Bot"
            sublabel="Initiates Call"
            count={flow.calling + flow.ringing}
            color="text-cyan-400 border-cyan-500/30 bg-cyan-500/10"
            glow="shadow-cyan-500/5"
            pulse
          />
          {/* Animated dots showing active calls */}
          {callingCount > 0 && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
              {Array.from({ length: Math.min(callingCount, 5) }).map((_, i) => (
                <LeadDot key={i} color="bg-cyan-400" delay={i * 0.1} />
              ))}
            </div>
          )}
        </div>

        <FlowArrow label="ringing" color="text-cyan-400" />

        {/* Ringing */}
        <FlowBox
          icon={Phone}
          label="Ringing"
          sublabel="Customer phone"
          count={flow.ringing}
          color="text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
          glow="shadow-yellow-500/5"
        />

        <FlowArrow label="pickup" color="text-green-400" />

        {/* Connected / Conversation */}
        <div className="relative">
          <FlowBox
            icon={MessageSquare}
            label="Connected"
            sublabel="In Conversation"
            count={flow.connected + flow.conversation}
            color="text-green-400 border-green-500/30 bg-green-500/10"
            glow="shadow-green-500/5"
          />
          {connectedCount > 0 && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
              {Array.from({ length: Math.min(connectedCount, 5) }).map((_, i) => (
                <LeadDot key={i} color="bg-green-400" delay={i * 0.15} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── SPLIT: Three outcomes ── */}
      <div className="mt-4 flex items-start justify-center gap-4">
        {/* LEFT: No Answer / Call Later path */}
        <div className="flex flex-col items-center gap-2 min-w-[140px]">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">No Pickup</div>

          <FlowArrow label="no answer" color="text-gray-400" vertical />

          <div className="relative">
            <FlowBox
              icon={PhoneMissed}
              label="No Answer"
              sublabel="or Call Later"
              count={flow.no_answer + flow.call_later}
              color="text-orange-400 border-orange-500/30 bg-orange-500/10"
              glow="shadow-orange-500/5"
            />
            {noAnswerCount > 0 && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
                {Array.from({ length: Math.min(noAnswerCount, 4) }).map((_, i) => (
                  <LeadDot key={i} color="bg-orange-400" delay={i * 0.1} />
                ))}
              </div>
            )}
          </div>

          <FlowArrow label="retry cycle" color="text-orange-400" vertical />

          {/* Retry Schedule */}
          <div className="bg-slate-800/80 border border-orange-500/20 rounded-lg p-2.5 w-full text-center">
            <RefreshCw className="h-4 w-4 mx-auto mb-1 text-orange-400" />
            <div className="text-[10px] font-semibold text-orange-300">Retry Schedule</div>
            <div className="space-y-0.5 mt-1.5">
              <div className="text-[9px] text-slate-400 flex justify-between">
                <span>1st retry</span><span className="text-orange-400">after 2 hrs</span>
              </div>
              <div className="text-[9px] text-slate-400 flex justify-between">
                <span>2nd retry</span><span className="text-orange-400">after 4 hrs</span>
              </div>
              <div className="text-[9px] text-slate-400 flex justify-between">
                <span>3rd retry</span><span className="text-orange-400">after 24 hrs</span>
              </div>
            </div>
            <div className="text-[8px] text-orange-400/60 mt-1.5 border-t border-orange-500/10 pt-1">
              Total: 30 hrs window
            </div>
          </div>

          <FlowArrow label="4th fail" color="text-emerald-400" vertical dashed />

          {/* WhatsApp after 4th fail */}
          <FlowBox
            icon={MessageCircle}
            label="WhatsApp"
            sublabel="After 4th attempt"
            count={flow.whatsapp_sent}
            color="text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
            glow="shadow-emerald-500/5"
          />
        </div>

        {/* CENTER: Interested path */}
        <div className="flex flex-col items-center gap-2 min-w-[140px]">
          <div className="text-[10px] text-green-400 font-semibold uppercase tracking-wider mb-1">Interested</div>

          <FlowArrow label="yes" color="text-green-400" vertical />

          <div className="relative">
            <FlowBox
              icon={CheckCircle2}
              label="Interested"
              sublabel="Wants to explore"
              count={flow.interested + flow.whatsapp_yes}
              color="text-green-400 border-green-500/30 bg-green-500/10"
              glow="shadow-green-500/5"
            />
            {interestedCount > 0 && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
                {Array.from({ length: Math.min(interestedCount, 4) }).map((_, i) => (
                  <LeadDot key={i} color="bg-green-400" delay={i * 0.1} />
                ))}
              </div>
            )}
          </div>

          <FlowArrow label="confirm" color="text-emerald-400" vertical />

          {/* WhatsApp confirmation */}
          <FlowBox
            icon={MessageCircle}
            label="WhatsApp"
            sublabel="Confirmation msg"
            count={flow.whatsapp_sent + flow.whatsapp_yes}
            color="text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
            glow="shadow-emerald-500/5"
          />

          <FlowArrow label="YES" color="text-green-400" vertical />

          {/* TOYOTA CRM - Big final node */}
          <div className="relative">
            <div className="bg-emerald-500/15 border-2 border-emerald-500/40 rounded-xl px-5 py-4 text-center min-w-[140px] shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="h-7 w-7 mx-auto mb-1 text-emerald-400" />
              <div className="text-3xl font-bold text-emerald-400 tabular-nums">{flow.crm_transferred}</div>
              <div className="text-sm font-bold text-emerald-300">Toyota CRM</div>
              <div className="text-[10px] text-emerald-400/60">Qualified Leads</div>
              <div className="absolute -top-1 -right-1"><PulseDot color="bg-emerald-400" size="h-2 w-2" /></div>
            </div>
          </div>
        </div>

        {/* RIGHT: Not Interested path */}
        <div className="flex flex-col items-center gap-2 min-w-[140px]">
          <div className="text-[10px] text-red-400 font-semibold uppercase tracking-wider mb-1">Not Interested</div>

          <FlowArrow label="no" color="text-red-400" vertical />

          <div className="relative">
            <FlowBox
              icon={XCircle}
              label="Not Interested"
              sublabel="Declined offer"
              count={flow.not_interested}
              color="text-red-400 border-red-500/30 bg-red-500/10"
              glow="shadow-red-500/5"
            />
            {notInterestedCount > 0 && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
                {Array.from({ length: Math.min(notInterestedCount, 4) }).map((_, i) => (
                  <LeadDot key={i} color="bg-red-400" delay={i * 0.1} />
                ))}
              </div>
            )}
          </div>

          <FlowArrow label="removed" color="text-red-400" vertical />

          {/* JUNK BIN */}
          <div className="bg-red-500/15 border-2 border-red-500/30 rounded-xl px-5 py-4 text-center min-w-[140px] shadow-xl shadow-red-500/5">
            <Trash2 className="h-6 w-6 mx-auto mb-1 text-red-400" />
            <div className="text-2xl font-bold text-red-400 tabular-nums">{flow.junk}</div>
            <div className="text-sm font-bold text-red-300">Junk Bin</div>
            <div className="text-[10px] text-red-400/60">Removed from calling list</div>
          </div>

          {/* WhatsApp No → also Junk */}
          {whatsappNoCount > 0 && (
            <>
              <div className="text-[9px] text-slate-500 mt-1">WhatsApp "NO" also goes here</div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3 text-red-400/60" />
                <span className="text-[9px] text-red-400/60">WhatsApp No: {whatsappNoCount}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Failed row */}
      <div className="mt-3 flex justify-end pr-4">
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-500">WhatsApp no response 48hr →</span>
          <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg px-3 py-1.5 text-center">
            <AlertTriangle className="h-3.5 w-3.5 mx-auto mb-0.5 text-gray-400" />
            <span className="text-sm font-bold text-gray-400">{flow.failed}</span>
            <span className="text-[9px] text-gray-400 ml-1">Failed</span>
          </div>
        </div>
      </div>
    </div>
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
          <Button key={btn.hours} size="sm" onClick={() => timeJump(btn.hours)}
            className={`text-[10px] h-7 px-2.5 ${btn.active ? `bg-gradient-to-r ${btn.color} text-white shadow-lg` : 'bg-slate-800/80 border border-slate-600/30 text-slate-300 hover:bg-slate-700/80'}`}>
            <FastForward className="h-3 w-3 mr-1" /> {btn.label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-2 py-1">
        <span className="text-[10px] text-slate-400">Speed:</span>
        {[1, 2, 4, 8].map((s) => (
          <button key={s} onClick={() => setSpeed(s)}
            className={`text-[10px] px-1.5 py-0.5 rounded transition-all ${speed === s ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'}`}>
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
        <motion.div key={item.label} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
          className={`bg-gradient-to-br ${item.bg} border border-slate-700/30 rounded-xl p-2.5 text-center`}>
          <item.icon className={`h-4 w-4 mx-auto mb-1 ${item.color}`} />
          <div className="text-xl font-bold text-white">{item.value}</div>
          <div className="text-[10px] text-slate-400">{item.label}</div>
        </motion.div>
      ))}
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
              <Globe className="h-4 w-4 text-amber-400" />
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
              <motion.div key={lead.id} layout
                initial={{ opacity: 0, x: -30, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                onClick={() => setSelected(lead.id === selectedLeadId ? null : lead.id)}
                className={`cursor-pointer rounded-lg border p-2 transition-all ${
                  lead.id === selectedLeadId ? 'border-cyan-500/50 bg-cyan-500/10 ring-1 ring-cyan-500/30'
                  : `border-slate-700/30 ${getStatusBgColor(lead.status)} hover:border-slate-600/50`
                }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px]">{getStatusIcon(lead.status)}</span>
                    <span className="text-xs font-semibold text-slate-200">{lead.id}</span>
                  </div>
                  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${getStatusBgColor(lead.status)} ${getStatusColor(lead.status)} border-0`}>
                    {getStatusLabel(lead.status)}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-300 truncate">{lead.name}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-500">CarWale.com</span>
                  {lead.attemptCount > 0 && <span className="text-[10px] text-slate-500">Attempt {lead.attemptCount}/{lead.maxAttempts}</span>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  )
}

// ─── Call Card ──────────────────────────────────────────────────────────────

function CallCard({ lead, isSelected, onSelect }: { lead: Lead; isSelected: boolean; onSelect: () => void }) {
  const isOnCall = ['calling', 'ringing', 'connected', 'conversation'].includes(lead.status)
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }}
      onClick={onSelect}
      className={`cursor-pointer rounded-xl border p-3 transition-all ${
        isSelected ? 'border-cyan-400/50 bg-cyan-900/30 ring-2 ring-cyan-400/20'
        : isOnCall ? 'border-cyan-500/20 bg-slate-800/80 hover:border-cyan-500/40'
        : 'border-slate-700/30 bg-slate-800/50 hover:border-slate-600/50'
      }`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {isOnCall && <PulseDot color="bg-green-400" size="h-2.5 w-2.5" />}
          <span className="text-sm font-bold text-white">{lead.name}</span>
        </div>
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getStatusBgColor(lead.status)} ${getStatusColor(lead.status)} border-0`}>
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
            <motion.div className="h-full bg-green-400 rounded-full" animate={{ width: ['0%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
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

// ─── Live Conversation Panel (PROMINENT TEXT-BASED) ─────────────────────────

function LiveConversationPanel() {
  const leads = useHyperXStore((s) => s.leads)
  const selectedLeadId = useHyperXStore((s) => s.selectedLeadId)
  const setSelected = useHyperXStore((s) => s.setSelectedLeadId)
  const stats = useHyperXStore((s) => s.stats)
  const selectedLead = leads.find((l) => l.id === selectedLeadId)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [selectedLead?.chatMessages?.length])

  const activeLeads = leads.filter((l) => !['crm_transferred', 'junk', 'failed'].includes(l.status))

  // Auto-select first active lead with conversation
  useEffect(() => {
    if (!selectedLeadId && activeLeads.length > 0) {
      const withChat = activeLeads.find(l => l.chatMessages.length > 0 && l.chatMessages.some(m => m.speaker !== 'system'))
      if (withChat) setSelected(withChat.id)
    }
  }, [activeLeads, selectedLeadId, setSelected])

  return (
    <div className="h-full flex flex-col bg-slate-900/95 border border-cyan-500/20 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-cyan-600/20 to-teal-600/20 border-b border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-cyan-300">HYPER X — Live Calls</h2>
              <p className="text-[10px] text-cyan-400/60">Text-based Conversation View</p>
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
            <div className="text-xs font-bold text-yellow-300">{leads.filter(l => ['ringing', 'calling'].includes(l.status)).length}</div>
            <div className="text-[8px] text-yellow-400/60">Ringing</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-md px-2 py-1 text-center">
            <div className="text-xs font-bold text-green-300">{leads.filter(l => ['connected', 'conversation'].includes(l.status)).length}</div>
            <div className="text-[8px] text-green-400/60">On Call</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-1 text-center">
            <div className="text-xs font-bold text-emerald-300">{leads.filter(l => l.status === 'whatsapp_sent').length}</div>
            <div className="text-[8px] text-emerald-400/60">WhatsApp</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left: Active Calls List */}
        <div className="w-2/5 border-r border-slate-700/30 flex flex-col">
          <div className="p-2 border-b border-slate-700/30 flex items-center justify-between">
            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Calls</h3>
            <Badge variant="outline" className="text-[9px] border-cyan-500/30 text-cyan-400 bg-cyan-500/10">
              {activeLeads.length} live
            </Badge>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-1.5 space-y-1.5">
              <AnimatePresence mode="popLayout">
                {activeLeads.map((lead) => (
                  <CallCard key={lead.id} lead={lead} isSelected={lead.id === selectedLeadId}
                    onSelect={() => setSelected(lead.id === selectedLeadId ? null : lead.id)} />
                ))}
              </AnimatePresence>
              {activeLeads.length === 0 && (
                <div className="text-center text-slate-600 text-xs py-8">
                  <Phone className="h-8 w-8 mx-auto mb-2 text-slate-700" /> Waiting for leads...
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right: Live Conversation Text */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Conversation header */}
          <div className="px-4 py-2 bg-slate-800/60 border-b border-slate-700/30">
            {selectedLead ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    ['ringing', 'calling', 'connected', 'conversation'].includes(selectedLead.status) ? 'bg-green-400 animate-pulse' : 'bg-slate-500'
                  }`} />
                  <span className="text-sm font-semibold text-white">{selectedLead.name}</span>
                  <span className="text-[11px] text-slate-400">{selectedLead.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${getStatusBgColor(selectedLead.status)} ${getStatusColor(selectedLead.status)} border-0`}>
                    {getStatusLabel(selectedLead.status)}
                  </Badge>
                  <span className="text-[10px] text-slate-500">Attempt {selectedLead.attemptCount}/{selectedLead.maxAttempts}</span>
                  {selectedLead.selectedCar && (
                    <span className="text-[10px] text-cyan-400/80 flex items-center gap-0.5">
                      <Target className="h-2.5 w-2.5" /> {selectedLead.selectedCar}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">Select a lead to view live conversation</span>
              </div>
            )}
          </div>

          {/* Chat messages - THE MAIN TEXT CONVERSATION */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-slate-950/50">
            {!selectedLead ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm h-full">
                <div className="text-center py-16">
                  <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="h-8 w-8 text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">No conversation selected</p>
                  <p className="text-[11px] text-slate-500 mt-1">Click any active call to see the bot ↔ customer text conversation</p>
                </div>
              </div>
            ) : (
              <>
                {/* Call info banner */}
                <div className="text-center py-2">
                  <div className="inline-flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700/30">
                    <PhoneCall className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-[11px] text-slate-300">
                      Call to <span className="text-white font-semibold">{selectedLead.name}</span> from CarWale.com about Toyota {selectedLead.selectedCar}
                    </span>
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${getStatusBgColor(selectedLead.status)} ${getStatusColor(selectedLead.status)} border-0`}>
                      {getStatusLabel(selectedLead.status)}
                    </Badge>
                  </div>
                </div>

                {/* Messages */}
                {selectedLead.chatMessages.map((msg, i) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                    className={msg.speaker === 'system' ? 'flex justify-center' : 'flex gap-3'}>

                    {msg.speaker === 'system' ? (
                      <div className="flex items-center gap-2 py-1">
                        <div className="h-px flex-1 bg-slate-700/30" />
                        <span className="text-[10px] text-slate-500 bg-slate-800/60 px-3 py-1 rounded-full">{msg.text}</span>
                        <div className="h-px flex-1 bg-slate-700/30" />
                      </div>
                    ) : (
                      <>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center border ${
                          msg.speaker === 'bot'
                            ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                            : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                        }`}>
                          {msg.speaker === 'bot' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </div>

                        {/* Message bubble */}
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                          msg.speaker === 'bot'
                            ? 'bg-cyan-900/30 border border-cyan-500/10 rounded-tl-sm'
                            : 'bg-slate-700/40 border border-slate-600/20 rounded-tr-sm'
                        }`}>
                          <div className={`text-[10px] font-bold mb-1 ${
                            msg.speaker === 'bot' ? 'text-cyan-400' : 'text-amber-400'
                          }`}>
                            {msg.speaker === 'bot' ? 'Hyper X Bot' : selectedLead.name.split(' ')[0]}
                            {msg.speaker === 'bot' && <span className="text-cyan-500/40 ml-1 font-normal">(Voice AI)</span>}
                            {msg.speaker === 'customer' && <span className="text-amber-500/40 ml-1 font-normal">(Customer)</span>}
                          </div>
                          <div className={`text-[13px] leading-relaxed ${
                            msg.speaker === 'bot' ? 'text-cyan-50' : 'text-slate-200'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}

                {/* Live indicators */}
                {['ringing', 'calling'].includes(selectedLead.status) && (
                  <div className="flex items-center gap-2 text-yellow-400 text-xs justify-center py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm font-medium">Ringing...</span>
                  </div>
                )}

                {selectedLead.status === 'conversation' && (
                  <div className="flex items-center gap-2 text-green-400 text-xs justify-center py-2">
                    <Volume2 className="h-4 w-4 animate-pulse" />
                    <span className="text-sm font-medium">Conversation in progress...</span>
                  </div>
                )}

                {selectedLead.status === 'connected' && (
                  <div className="flex items-center gap-2 text-green-400 text-xs justify-center py-2">
                    <Phone className="h-4 w-4 animate-pulse" />
                    <span className="text-sm font-medium">Connected — starting conversation...</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
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
                <motion.div key={lead.id} layout
                  initial={{ opacity: 0, x: 30, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="rounded-lg border border-green-500/20 bg-green-500/5 p-2.5">
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
                    <div className="text-[10px] text-slate-500 mt-1">Call: {lead.callDuration}s | {lead.attemptCount} attempt(s)</div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {crmLeads.length === 0 && (
              <div className="text-center text-slate-600 text-xs py-8">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-700" /> No qualified leads yet
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
                <motion.div key={lead.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 0.6, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center justify-between rounded-md border border-red-500/10 bg-red-500/5 px-2 py-1">
                  <div className="flex items-center gap-1.5">
                    <XCircle className="h-3 w-3 text-red-400/60" />
                    <span className="text-[10px] text-slate-400">{lead.name}</span>
                  </div>
                  <span className="text-[9px] text-red-400/60">{lead.status === 'junk' ? 'JUNK' : 'FAILED'}</span>
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
                <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">HYPER X</h1>
                <p className="text-[10px] text-slate-500">AI Voice Bot Lead Qualification System | CarWale.com</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isSimulating ? (
                <Button size="sm" onClick={handleStart}
                  className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs">
                  <Play className="h-3 w-3 mr-1" /> Start Simulation
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={stopSimulation}
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-xs">
                  <Pause className="h-3 w-3 mr-1" /> Pause
                </Button>
              )}
              {hasStarted && (
                <Button size="sm" variant="outline" onClick={handleReset}
                  className="border-slate-600/30 text-slate-400 hover:bg-slate-700/50 text-xs">
                  <RotateCcw className="h-3 w-3 mr-1" /> Reset
                </Button>
              )}
            </div>
          </div>
          <TimeJumpBar />
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto p-3 space-y-3">
        <StatsBar />
        <AnimatedFlowchart />

        {/* Main panels: Aggregator | Live Conversation | CRM+Junk */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3" style={{ minHeight: 'calc(100vh - 500px)' }}>
          <div className="lg:col-span-3">
            <AggregatorPanel />
          </div>
          <div className="lg:col-span-6">
            <LiveConversationPanel />
          </div>
          <div className="lg:col-span-3">
            <ToyotaCRMPanel />
          </div>
        </div>
      </main>

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
