'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, PhoneOff, PhoneIncoming, PhoneMissed, PhoneCall,
  MessageSquare, Users, Trash2, TrendingUp, Clock, Zap,
  ArrowRight, ChevronRight, Bot, User, Send, BarChart3,
  Activity, AlertTriangle, CheckCircle2, XCircle, Timer,
  Volume2, Pause, Play, FastForward, RotateCcw, Wifi,
  MessageCircle, Filter, Target, Sparkles
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
} from '@/lib/hyperx-store'
import { useSimulation } from '@/lib/use-simulation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

// ─── Pulse Dot ──────────────────────────────────────────────────────────────

function PulseDot({ color = 'bg-green-400', size = 'h-2 w-2' }: { color?: string; size?: string }) {
  return (
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex rounded-full ${size} ${color}`} />
    </span>
  )
}

// ─── Stats Bar ──────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = useHyperXStore((s) => s.stats)
  const isSimulating = useHyperXStore((s) => s.isSimulating)

  const statItems = [
    { label: 'Leads Received', value: stats.totalLeadsReceived, icon: Users, color: 'text-amber-400' },
    { label: 'Calls Made', value: stats.totalCallsMade, icon: PhoneCall, color: 'text-cyan-400' },
    { label: 'Active Calls', value: stats.totalCallsActive, icon: Activity, color: 'text-yellow-400' },
    { label: 'WhatsApp Sent', value: stats.totalWhatsappSent, icon: MessageCircle, color: 'text-emerald-400' },
    { label: 'CRM Transferred', value: stats.totalInterested, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Junk Leads', value: stats.totalJunk, icon: Trash2, color: 'text-red-400' },
    { label: 'Failed', value: stats.totalFailed, icon: XCircle, color: 'text-gray-400' },
    { label: 'Conversion', value: `${stats.conversionRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-purple-400' },
  ]

  return (
    <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
      {statItems.map((item) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/80 border border-slate-700/50 rounded-lg p-2 text-center"
        >
          <item.icon className={`h-3.5 w-3.5 mx-auto mb-1 ${item.color}`} />
          <div className="text-lg font-bold text-white">{item.value}</div>
          <div className="text-[10px] text-slate-400 truncate">{item.label}</div>
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

  const activeLeads = leads.filter((l) => !['crm_transferred', 'junk', 'failed'].includes(l.status))
  const completedLeads = leads.filter((l) => ['crm_transferred', 'junk', 'failed'].includes(l.status))

  return (
    <div className="h-full flex flex-col bg-slate-900/95 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-b border-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-300">LEAD AGGREGATOR</h2>
              <p className="text-[10px] text-amber-400/60">Incoming lead stream</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <PulseDot color="bg-amber-400" />
            <span className="text-[10px] text-amber-400">LIVE</span>
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-300 bg-amber-500/10">
            Active: {activeLeads.length}
          </Badge>
          <Badge variant="outline" className="text-[10px] border-slate-500/30 text-slate-300 bg-slate-500/10">
            Total: {leads.length}
          </Badge>
        </div>
      </div>

      {/* Lead Stream */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1.5">
          <AnimatePresence mode="popLayout">
            {leads.slice(0, 30).map((lead) => (
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
                  <span className="text-[10px] text-slate-500">{lead.source}</span>
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

// ─── Call Card (Active Call in HyperX) ──────────────────────────────────────

function CallCard({ lead, isSelected, onSelect }: { lead: Lead; isSelected: boolean; onSelect: () => void }) {
  const isOnCall = ['calling', 'ringing', 'connected', 'conversation'].includes(lead.status)

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
      <div className="flex items-center justify-between mb-2">
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
        <div className="mt-1.5 text-[10px] text-cyan-400/80 flex items-center gap-1">
          <Target className="h-3 w-3" />
          Interested in: Toyota {lead.selectedCar}
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
  }, [lead?.chatMessages])

  if (!lead) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-slate-600" />
          <p>Select a lead to view call script</p>
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
          <span className="text-xs font-medium text-slate-300">
            {lead.name} - {lead.phone}
          </span>
        </div>
        <Badge
          variant="outline"
          className={`text-[9px] px-1.5 py-0 ${getStatusBgColor(lead.status)} ${getStatusColor(lead.status)} border-0`}
        >
          {getStatusLabel(lead.status)}
        </Badge>
      </div>

      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {lead.status === 'no_answer' && (
          <div className="text-center text-slate-500 text-xs py-4">
            <PhoneMissed className="h-6 w-6 mx-auto mb-2 text-slate-600" />
            <p>No answer on attempt {lead.attemptCount}</p>
            {lead.nextRetryAt && (
              <p className="text-slate-600 mt-1">Next retry scheduled...</p>
            )}
          </div>
        )}

        {lead.chatMessages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex gap-2 ${msg.speaker === 'bot' ? '' : 'flex-row-reverse'}`}
          >
            <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs ${
              msg.speaker === 'bot' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {msg.speaker === 'bot' ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            </div>
            <div className={`max-w-[75%] rounded-lg px-3 py-1.5 text-xs ${
              msg.speaker === 'bot'
                ? 'bg-slate-700/50 text-slate-200 rounded-tl-none'
                : 'bg-cyan-600/20 text-cyan-100 rounded-tr-none'
            }`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-[9px] font-semibold ${
                  msg.speaker === 'bot' ? 'text-cyan-400' : 'text-amber-400'
                }`}>
                  {msg.speaker === 'bot' ? 'Hyper X Bot' : lead.name.split(' ')[0]}
                </span>
              </div>
              {msg.text}
            </div>
          </motion.div>
        ))}

        {['ringing', 'calling'].includes(lead.status) && (
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <div className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Ringing...</span>
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

  const activeLeads = leads.filter(
    (l) => !['crm_transferred', 'junk', 'failed'].includes(l.status)
  )
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
              <div className="text-[9px] text-slate-400">Total Calls</div>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-md px-2 py-1 text-center">
            <div className="text-xs font-bold text-cyan-300">
              {leads.filter((l) => ['ringing', 'calling'].includes(l.status)).length}
            </div>
            <div className="text-[8px] text-cyan-400/60">Ringing</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-md px-2 py-1 text-center">
            <div className="text-xs font-bold text-green-300">
              {leads.filter((l) => ['connected', 'conversation'].includes(l.status)).length}
            </div>
            <div className="text-[8px] text-green-400/60">On Call</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-1 text-center">
            <div className="text-xs font-bold text-emerald-300">
              {leads.filter((l) => l.status === 'whatsapp_sent').length}
            </div>
            <div className="text-[8px] text-emerald-400/60">WhatsApp</div>
          </div>
        </div>
      </div>

      {/* Active calls grid */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-2 border-b border-slate-700/30">
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Calls</h3>
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
      <div className="h-64 border-t border-slate-700/30 flex flex-col">
        <div className="px-3 py-1.5 bg-slate-800/50 border-b border-slate-700/30 flex items-center gap-2">
          <MessageSquare className="h-3 w-3 text-cyan-400" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Call Script</span>
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
      <div className="flex-1 flex flex-col bg-slate-900/95 border border-slate-700/50 rounded-xl overflow-hidden">
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
                  className="rounded-lg border border-green-500/20 bg-green-500/5 p-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-green-300">{lead.name}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  </div>
                  <div className="text-[10px] text-slate-400">{lead.phone}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-cyan-400/80 flex items-center gap-1">
                      <Target className="h-2.5 w-2.5" />
                      Toyota {lead.selectedCar}
                    </span>
                    <span className="text-[10px] text-green-400/60">via {lead.source}</span>
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
      <div className="h-48 flex flex-col bg-slate-900/95 border border-red-500/20 rounded-xl overflow-hidden">
        <div className="p-2.5 bg-gradient-to-r from-red-600/20 to-orange-600/20 border-b border-red-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-400" />
              <h2 className="text-xs font-bold text-red-300">JUNK LEADS</h2>
            </div>
            <Badge variant="outline" className="text-[9px] border-red-500/30 text-red-400 bg-red-500/10">
              {junkLeads.length + failedLeads.length}
            </Badge>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
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

// ─── Flow Visualization ─────────────────────────────────────────────────────

function FlowVisualization() {
  const stats = useHyperXStore((s) => s.stats)

  return (
    <div className="bg-slate-900/95 border border-slate-700/50 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 className="h-3 w-3" />
          Pipeline Flow
        </h3>
      </div>

      <div className="flex items-center gap-1">
        {/* Aggregator */}
        <div className="flex-1 text-center">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
            <div className="text-lg font-bold text-amber-400">{stats.totalLeadsReceived}</div>
            <div className="text-[9px] text-amber-400/60">Aggregator</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <ChevronRight className="h-4 w-4 text-slate-600" />
          <span className="text-[8px] text-slate-600">calls</span>
        </div>

        {/* Hyper X */}
        <div className="flex-1 text-center">
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2">
            <div className="text-lg font-bold text-cyan-400">{stats.totalCallsMade}</div>
            <div className="text-[9px] text-cyan-400/60">Hyper X</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <ChevronRight className="h-4 w-4 text-green-600" />
          <span className="text-[8px] text-green-600">qualified</span>
        </div>

        {/* CRM */}
        <div className="flex-1 text-center">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
            <div className="text-lg font-bold text-green-400">{stats.totalInterested}</div>
            <div className="text-[9px] text-green-400/60">Toyota CRM</div>
          </div>
        </div>
      </div>

      {/* Conversion funnel bar */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
          <span>Conversion Funnel</span>
          <span>{stats.conversionRate.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 via-cyan-500 to-green-500 rounded-full"
            animate={{ width: `${Math.min(stats.conversionRate, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function HyperXDashboard() {
  const { startSimulation, stopSimulation, isSimulating } = useSimulation()
  const setSpeed = useHyperXStore((s) => s.setSimulationSpeed)
  const speed = useHyperXStore((s) => s.simulationSpeed)
  const resetAll = useHyperXStore((s) => s.resetAll)
  const [hasStarted, setHasStarted] = useState(false)

  const handleStart = () => {
    if (!hasStarted) setHasStarted(true)
    startSimulation()
  }

  const handleStop = () => {
    stopSimulation()
  }

  const handleReset = () => {
    stopSimulation()
    resetAll()
    setHasStarted(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Top Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-[1920px] mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  HYPER X
                </h1>
                <p className="text-[10px] text-slate-500">AI Voice Bot Lead Qualification System</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Speed controls */}
              <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-2 py-1">
                <span className="text-[10px] text-slate-400 mr-1">Speed:</span>
                {[1, 2, 4].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`text-[10px] px-1.5 py-0.5 rounded transition-all ${
                      speed === s
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Sim controls */}
              {!isSimulating ? (
                <Button
                  size="sm"
                  onClick={handleStart}
                  className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Start
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStop}
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 text-xs"
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </Button>
              )}

              {hasStarted && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="border-slate-600/30 text-slate-400 hover:bg-slate-700/50 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto p-3 space-y-3">
        {/* Stats Bar */}
        <StatsBar />

        {/* Flow Visualization */}
        <FlowVisualization />

        {/* Three-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3" style={{ minHeight: 'calc(100vh - 260px)' }}>
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

      {/* Animated background effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
