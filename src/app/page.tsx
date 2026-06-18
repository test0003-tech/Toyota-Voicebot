'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, PhoneMissed, PhoneCall, MessageSquare, Users, Trash2, TrendingUp,
  Clock, Zap, ArrowRight, Bot, User, Activity, AlertTriangle, CheckCircle2,
  XCircle, Timer, Volume2, Pause, Play, FastForward, RotateCcw, MessageCircle,
  Target, Sparkles, Database, Globe, RefreshCw, Download, Bolt, Car,
  PhoneOutgoing, CircleDot,
} from 'lucide-react'
import {
  useHyperXStore,
  getStatusColor,
  getStatusBgColor,
  getStatusLabel,
  getStatusIcon,
  type Lead,
  type ChatMessage,
} from '@/lib/hyperx-store'
import { useSimulation } from '@/lib/use-simulation'

// ─── Pulse Dot ──────────────────────────────────────────────────────────────

function PulseDot({ color = 'bg-green-400', size = 'h-2 w-2' }: { color?: string; size?: string }) {
  return (
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex rounded-full ${size} ${color}`} />
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB: OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════

function OverviewPage() {
  const stats = useHyperXStore((s) => s.stats)
  const flow = stats.flowNodes

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center py-8">
        <div className="inline-block bg-amber-500/12 border border-amber-500/30 text-amber-400 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider mb-4">
          TOYOTA × HYPERX LEAD QUALIFICATION ENGINE
        </div>
        <h1 className="text-4xl font-extrabold leading-tight mb-3">
          Convert Aggregator Leads<br />into <span className="text-amber-400">Qualified Buyers</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6">
          HyperX uses an AI voice bot to instantly engage every incoming lead — running simultaneous calls, qualifying interest, and routing hot prospects directly into Toyota CRM.
        </p>
        <div className="flex justify-center gap-8 flex-wrap">
          {[
            { num: '~10s', label: 'Avg call connect' },
            { num: '30 hrs', label: 'Total retry window' },
            { num: '4 +WA', label: 'Touch attempts' },
            { num: '100%', label: 'Leads auto-classified' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-extrabold text-amber-400">{s.num}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* End-to-End Flow */}
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">End-to-End Flow</div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { icon: Globe, label: 'Aggregator', sub: 'Leads stream in', gold: true },
            { icon: Bolt, label: 'HyperX Engine', sub: 'AI triggers calls', gold: true },
            { icon: Phone, label: 'Voice Bot', sub: 'Simultaneous calls', gold: false },
            { icon: MessageSquare, label: 'Qualification', sub: 'AI chat + retry', gold: false },
            { icon: CheckCircle2, label: 'Toyota CRM', sub: 'Interested leads', gold: false, green: true },
            { icon: Trash2, label: 'Junk Bin', sub: 'Not interested', gold: false, red: true },
          ].map((node, i, arr) => (
            <React.Fragment key={node.label}>
              <div className={`rounded-xl border p-4 min-w-[130px] text-center flex-shrink-0 ${
                node.gold ? 'border-amber-500/30 bg-amber-500/8'
                : node.green ? 'border-green-500/30 bg-green-500/7'
                : node.red ? 'border-red-500/30 bg-red-500/7'
                : 'border-slate-700/30 bg-slate-800/50'
              }`}>
                <node.icon className={`h-5 w-5 mx-auto mb-2 ${
                  node.gold ? 'text-amber-400' : node.green ? 'text-green-400' : node.red ? 'text-red-400' : 'text-amber-400/70'
                }`} />
                <div className="text-xs font-bold text-white">{node.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{node.sub}</div>
              </div>
              {i < arr.length - 1 && (
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-slate-500 text-lg flex-shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Call Outcomes */}
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Call Outcomes</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="border border-green-500/30 bg-green-500/6 rounded-xl p-4">
            <CheckCircle2 className="h-5 w-5 text-green-400 mb-2" />
            <div className="text-sm font-bold text-white">Customer Says YES</div>
            <div className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              WhatsApp confirmation sent: &quot;Our Toyota senior will get in touch.&quot; Lead forwarded to Toyota CRM immediately.
            </div>
          </div>
          <div className="border border-amber-500/30 bg-amber-500/6 rounded-xl p-4">
            <Timer className="h-5 w-5 text-amber-400 mb-2" />
            <div className="text-sm font-bold text-white">Call Back / Not Picked</div>
            <div className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Retry at +2hr → +4hr → +24hr. Then WhatsApp. If no YES within 48hr of WA → mark as Junk.
            </div>
          </div>
          <div className="border border-red-500/30 bg-red-500/6 rounded-xl p-4">
            <XCircle className="h-5 w-5 text-red-400 mb-2" />
            <div className="text-sm font-bold text-white">Customer Says NO</div>
            <div className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Immediately removed from call list. Marked as Junk in system. No further outreach.
            </div>
          </div>
        </div>
      </div>

      {/* Retry Timeline */}
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Retry & Engagement Timeline (Total Window: 30 Hours)
        </div>
        <div className="bg-[#12121a] border border-amber-500/15 rounded-xl p-5">
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {[
              { num: '1', time: 'T+0', label: '1st Call', color: 'border-amber-500 bg-amber-500/15 text-amber-400' },
              { num: '2', time: 'T+2hr', label: '2nd Call', color: 'border-amber-500 bg-amber-500/15 text-amber-400' },
              { num: '3', time: 'T+6hr', label: '3rd Call', color: 'border-orange-500 bg-orange-500/15 text-orange-400' },
              { num: '4', time: 'T+30hr', label: '4th Call', color: 'border-blue-500 bg-blue-500/12 text-blue-400' },
              { num: 'WA', time: 'Post 4th', label: 'WhatsApp', color: 'border-blue-500 bg-blue-500/12 text-blue-400' },
              { num: '✕', time: '+48hr', label: '→ Junk', color: 'border-red-500 bg-red-500/10 text-red-400' },
            ].map((step, i, arr) => (
              <React.Fragment key={step.label}>
                <div className="flex-shrink-0 text-center">
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold ${step.color} mx-auto mb-1`}>
                    {step.num}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-300">{step.time}</div>
                  <div className="text-[9px] text-slate-500">{step.label}</div>
                </div>
                {i < arr.length - 1 && (
                  <div className="h-0.5 w-10 bg-amber-500/15 flex-shrink-0 relative top-[-14px] mx-1" />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="text-[11px] text-slate-500 mt-4 leading-relaxed">
            After 4th call attempt — WhatsApp message sent asking: <strong className="text-slate-200">&quot;Are you interested in the Toyota offer? Reply YES or NO.&quot;</strong><br />
            YES → Lead routed to Toyota CRM &nbsp;|&nbsp; NO / No reply within 48hr → Marked as Junk
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB: LIVE PLATFORM
// ═══════════════════════════════════════════════════════════════════════════

function LivePlatformPage() {
  const leads = useHyperXStore((s) => s.leads)
  const selectedLeadId = useHyperXStore((s) => s.selectedLeadId)
  const setSelected = useHyperXStore((s) => s.setSelectedLeadId)
  const stats = useHyperXStore((s) => s.stats)
  const selectedLead = leads.find((l) => l.id === selectedLeadId)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [selectedLead?.chatMessages?.length])

  const activeLeads = leads.filter((l) => !['crm_transferred', 'junk', 'failed'].includes(l.status))
  const crmLeads = leads.filter((l) => l.status === 'crm_transferred')
  const junkLeads = leads.filter((l) => l.status === 'junk' || l.status === 'failed')

  // Auto-select first lead with conversation
  useEffect(() => {
    if (!selectedLeadId && activeLeads.length > 0) {
      const withChat = activeLeads.find(l => l.chatMessages.some(m => m.speaker !== 'system'))
      if (withChat) setSelected(withChat.id)
    }
  }, [activeLeads, selectedLeadId, setSelected])

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* HyperX Strip */}
      <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/4 border border-amber-500/25 rounded-xl p-3 mb-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <Bolt className="h-5 w-5 text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">HyperX Engine</span>
        </div>
        <div className="flex gap-6">
          {[
            { num: stats.totalCallsActive, label: 'Active Calls', color: 'text-amber-400' },
            { num: stats.totalCallsMade, label: 'Total Calls', color: 'text-amber-400' },
            { num: stats.totalInterested, label: 'Interested', color: 'text-green-400' },
            { num: stats.totalJunk, label: 'Junk', color: 'text-red-400' },
            { num: `${stats.conversionRate.toFixed(0)}%`, label: 'Conv. Rate', color: 'text-amber-400' },
          ].map(m => (
            <div key={m.label} className="text-center">
              <div className={`text-lg font-extrabold ${m.color}`}>{m.num}</div>
              <div className="text-[9px] text-slate-500 uppercase">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Column Grid */}
      <div className="flex-1 grid grid-cols-[240px_1fr_200px] gap-3 min-h-0">
        {/* LEFT: Aggregator */}
        <div className="bg-[#12121a] border border-amber-500/15 rounded-xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-amber-500/15 flex items-center justify-between flex-shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5" /> Aggregator
            </span>
            <span className="bg-amber-500 text-black rounded-full px-2 py-0.5 text-[10px] font-bold">{leads.filter(l => !['crm_transferred','junk','failed'].includes(l.status)).length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            <AnimatePresence mode="popLayout">
              {leads.slice(0, 30).map(lead => (
                <motion.div key={lead.id} layout
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  onClick={() => setSelected(lead.id === selectedLeadId ? null : lead.id)}
                  className={`bg-[#1a1a26] border rounded-lg p-2.5 cursor-pointer transition-all flex items-center gap-2.5 ${
                    lead.id === selectedLeadId ? 'border-amber-500/40 bg-amber-500/8'
                    : `border-amber-500/10 hover:border-amber-500/25`
                  }`}>
                  <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-[11px] font-bold text-amber-400 flex-shrink-0">
                    {lead.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-white truncate">{lead.name}</div>
                    <div className="text-[9px] text-slate-500">{lead.phone}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      ['calling','ringing'].includes(lead.status) ? 'bg-amber-400 animate-pulse'
                      : ['connected','conversation'].includes(lead.status) ? 'bg-green-400'
                      : ['interested','whatsapp_sent','whatsapp_yes'].includes(lead.status) ? 'bg-green-500'
                      : ['not_interested','whatsapp_no'].includes(lead.status) ? 'bg-red-400'
                      : ['no_answer','call_later'].includes(lead.status) ? 'bg-orange-400'
                      : lead.status === 'crm_transferred' ? 'bg-green-600'
                      : lead.status === 'junk' ? 'bg-red-500'
                      : 'bg-slate-500'
                    }`} />
                    <span className="text-[8px] text-slate-500 text-right">{getStatusLabel(lead.status)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* CENTER: Call Stream + Chat */}
        <div className="flex flex-col gap-3 min-h-0">
          {/* Call Cards */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-1">
            <AnimatePresence mode="popLayout">
              {activeLeads.map(lead => {
                const isOnCall = ['calling','ringing','connected','conversation'].includes(lead.status)
                const isCustomerMsg = lead.chatMessages.filter(m => m.speaker === 'customer')
                const lastBotMsg = [...lead.chatMessages].reverse().find(m => m.speaker === 'bot')
                const lastCustMsg = [...lead.chatMessages].reverse().find(m => m.speaker === 'customer')

                return (
                  <motion.div key={lead.id} layout
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSelected(lead.id === selectedLeadId ? null : lead.id)}
                    className={`bg-[#12121a] border rounded-xl p-3 cursor-pointer transition-all ${
                      lead.id === selectedLeadId ? 'border-amber-500/40'
                      : isOnCall ? 'border-amber-500/20 hover:border-amber-500/35'
                      : 'border-slate-700/25 hover:border-slate-600/40'
                    }`}>
                    {/* Card top */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-semibold text-white">{lead.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        isOnCall ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : lead.status === 'interested' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : lead.status === 'whatsapp_sent' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        : ['no_answer','call_later'].includes(lead.status) ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                        : 'bg-slate-700/30 text-slate-400 border border-slate-600/20'
                      }`}>
                        {isOnCall && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-1" />}
                        {getStatusLabel(lead.status)}
                      </span>
                    </div>

                    {/* Script box */}
                    {(lastBotMsg || lastCustMsg) && (
                      <div className="bg-[#1a1a26] rounded-md px-3 py-2 text-[11px] text-slate-300 border-l-2 border-amber-500/30 leading-relaxed mb-2">
                        {lastCustMsg ? (
                          <>
                            <div className="text-[9px] uppercase font-bold text-green-400 tracking-wider mb-1">Customer</div>
                            {lastCustMsg.text}
                          </>
                        ) : lastBotMsg ? (
                          <>
                            <div className="text-[9px] uppercase font-bold text-amber-400 tracking-wider mb-1">HyperX Bot</div>
                            {lastBotMsg.text}
                          </>
                        ) : null}
                      </div>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Attempt {lead.attemptCount}/{lead.maxAttempts}</span>
                      <div className="flex gap-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${
                            i < lead.attemptCount ? 'bg-amber-400'
                            : i === lead.attemptCount && isOnCall ? 'bg-amber-400 animate-pulse'
                            : 'bg-amber-500/15'
                          }`} />
                        ))}
                      </div>
                      <span className="ml-auto flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.phone}</span>
                    </div>

                    {/* Timer bar */}
                    {isOnCall && (
                      <div className="h-0.5 bg-slate-800 rounded mt-2 overflow-hidden">
                        <motion.div className="h-full bg-amber-400 rounded"
                          animate={{ width: ['0%', '100%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {activeLeads.length === 0 && (
              <div className="text-center text-slate-600 text-xs py-16">
                <Phone className="h-10 w-10 mx-auto mb-2 text-slate-700" /> Waiting for leads...
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: CRM + Junk */}
        <div className="flex flex-col gap-3 min-h-0">
          {/* Junk Bin */}
          <div className="bg-[#12121a] border border-red-500/20 rounded-xl p-3 text-center flex-shrink-0">
            <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center justify-center gap-1.5 mb-1">
              <Trash2 className="h-3.5 w-3.5" /> Junk Bin
            </div>
            <div className="text-3xl font-extrabold text-red-400">{stats.totalJunk + stats.totalFailed}</div>
            <div className="text-[9px] text-slate-500">disqualified leads</div>
            <div className="mt-2 space-y-1 max-h-16 overflow-y-auto">
              {junkLeads.slice(0, 8).map(l => (
                <div key={l.id} className="bg-red-500/10 border border-red-500/20 rounded px-1.5 py-0.5 text-[9px] text-red-400 flex items-center gap-1">
                  <XCircle className="h-2.5 w-2.5" /> {l.name.split(' ')[0]}
                </div>
              ))}
            </div>
          </div>

          {/* Toyota CRM */}
          <div className="flex-1 bg-[#12121a] border border-green-500/25 rounded-xl flex flex-col overflow-hidden min-h-0">
            <div className="bg-green-500/8 p-3 border-b border-green-500/15 flex items-center justify-between flex-shrink-0">
              <div>
                <div className="text-[11px] font-bold text-green-400 uppercase tracking-wider flex items-center gap-1">
                  <Car className="h-3.5 w-3.5" /> Toyota CRM
                </div>
                <div className="text-[9px] text-slate-500">Qualified Leads</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-extrabold text-green-400">{crmLeads.length}</div>
                <div className="text-[9px] text-slate-500">interested</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              <AnimatePresence mode="popLayout">
                {crmLeads.map(lead => (
                  <motion.div key={lead.id} layout
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/7 border border-green-500/20 rounded-lg px-2.5 py-2">
                    <div className="text-[11px] font-semibold text-white">{lead.name}</div>
                    <div className="text-[9px] text-slate-500">{lead.phone}</div>
                    <span className="inline-block bg-green-500/15 text-green-400 rounded px-1.5 py-0.5 text-[9px] font-semibold mt-1">
                      ✓ Interested
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB: ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════

function AnalyticsPage() {
  const stats = useHyperXStore((s) => s.stats)
  const leads = useHyperXStore((s) => s.leads)
  const flow = stats.flowNodes
  const total = stats.totalLeadsReceived || 1

  const connected = leads.filter(l => ['connected','conversation','interested','not_interested','call_later','whatsapp_sent','whatsapp_yes','whatsapp_no','crm_transferred','junk'].includes(l.status)).length
  const interested = stats.totalInterested
  const junk = stats.totalJunk + stats.totalFailed
  const active = stats.totalCallsActive

  // Funnel data
  const funnelData = [
    { label: 'Total Leads', count: stats.totalLeadsReceived, pct: 100, color: 'bg-amber-400' },
    { label: 'Calls Connected', count: connected, pct: Math.round((connected/total)*100), color: 'bg-amber-500' },
    { label: 'Interested (YES)', count: interested, pct: Math.round((interested/total)*100), color: 'bg-green-500' },
    { label: 'In Toyota CRM', count: flow.crm_transferred, pct: Math.round((flow.crm_transferred/total)*100), color: 'bg-green-600' },
    { label: 'Junk / No Interest', count: junk, pct: Math.round((junk/total)*100), color: 'bg-red-500' },
  ]

  // Donut data
  const interestedPct = stats.totalLeadsReceived > 0 ? interested / stats.totalLeadsReceived : 0
  const junkPct = stats.totalLeadsReceived > 0 ? junk / stats.totalLeadsReceived : 0
  const activePct = stats.totalLeadsReceived > 0 ? active / stats.totalLeadsReceived : 0

  // Simulated hourly data
  const hourlyData = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10 + stats.totalCallsMade / 8))
  const hourlyMax = Math.max(...hourlyData, 1)
  const hours = ['9am','10am','11am','12pm','1pm','2pm','3pm','4pm']

  // Attempt success rates
  const attemptRates = [
    { label: '1st Attempt', time: '', rate: '55%', color: 'text-amber-400' },
    { label: '2nd (+2hr)', time: '', rate: '42%', color: 'text-orange-400' },
    { label: '3rd (+6hr)', time: '', rate: '31%', color: 'text-blue-400' },
    { label: '4th (+30hr)', time: '', rate: '22%', color: 'text-red-400' },
    { label: 'WA Response', time: '', rate: '28%', color: 'text-green-400' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-extrabold">Campaign Analytics</div>
          <div className="text-xs text-slate-500">Toyota Lead Qualification — HyperX Platform</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Leads', num: stats.totalLeadsReceived, color: 'text-amber-400', sub: '↑ from aggregator' },
          { label: 'Qualified (CRM)', num: stats.totalInterested, color: 'text-green-400', sub: `${stats.conversionRate.toFixed(0)}% conversion` },
          { label: 'Junk / Disqualified', num: junk, color: 'text-red-400', sub: `${stats.totalLeadsReceived > 0 ? Math.round((junk/stats.totalLeadsReceived)*100) : 0}% of total` },
          { label: 'In Progress', num: active, color: 'text-blue-400', sub: 'being worked' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-[#12121a] border border-amber-500/15 rounded-xl p-4">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{kpi.label}</div>
            <div className={`text-2xl font-extrabold ${kpi.color} mt-1`}>{kpi.num}</div>
            <div className="text-[11px] text-green-400 mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Funnel */}
        <div className="bg-[#12121a] border border-amber-500/15 rounded-xl p-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Lead Disposition Funnel</div>
          <div className="space-y-2">
            {funnelData.map(step => (
              <div key={step.label} className="flex items-center gap-3">
                <div className="text-[10px] text-slate-400 min-w-[90px]">{step.label}</div>
                <div className="flex-1 bg-[#1a1a26] rounded h-5 overflow-hidden">
                  <motion.div
                    className={`h-full rounded ${step.color} flex items-center pl-2 text-[10px] font-semibold text-black`}
                    animate={{ width: `${Math.max(step.pct, 2)}%` }}
                    transition={{ duration: 0.8 }}
                  >
                    {step.count > 0 ? step.count : ''}
                  </motion.div>
                </div>
                <div className="text-[10px] text-slate-500 min-w-[28px] text-right">{step.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut */}
        <div className="bg-[#12121a] border border-amber-500/15 rounded-xl p-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Outcome Distribution</div>
          <div className="flex items-center gap-6">
            <svg width="110" height="110" viewBox="0 0 110 110" className="flex-shrink-0">
              <circle cx="55" cy="55" r="40" fill="none" stroke="#1a1a26" strokeWidth="18" />
              <circle cx="55" cy="55" r="40" fill="none" stroke="#22c55e" strokeWidth="18"
                strokeDasharray={`${Math.round(interestedPct * 251)} ${Math.round((1-interestedPct) * 251)}`}
                strokeDashoffset="63"
                style={{ transition: 'stroke-dasharray 0.8s', transform: 'rotate(-90deg)', transformOrigin: '55px 55px' }} />
              <circle cx="55" cy="55" r="40" fill="none" stroke="#ef4444" strokeWidth="18"
                strokeDasharray={`${Math.round(junkPct * 251)} ${Math.round((1-junkPct) * 251)}`}
                strokeDashoffset={63 - Math.round(interestedPct * 251)}
                style={{ transition: 'stroke-dasharray 0.8s', transform: 'rotate(-90deg)', transformOrigin: '55px 55px' }} />
              <circle cx="55" cy="55" r="40" fill="none" stroke="#60a5fa" strokeWidth="18"
                strokeDasharray={`${Math.round(activePct * 251)} ${Math.round((1-activePct) * 251)}`}
                strokeDashoffset={63 - Math.round((interestedPct + junkPct) * 251)}
                style={{ transition: 'stroke-dasharray 0.8s', transform: 'rotate(-90deg)', transformOrigin: '55px 55px' }} />
              <text x="55" y="58" textAnchor="middle" fontSize="14" fontWeight="800" fill="#f5a623">
                {stats.totalLeadsReceived > 0 ? Math.round((interested/stats.totalLeadsReceived)*100) : 0}%
              </text>
            </svg>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px]">
                <div className="w-2 h-2 rounded-full bg-green-500" /> Interested ({interested})
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <div className="w-2 h-2 rounded-full bg-red-500" /> Junk ({junk})
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <div className="w-2 h-2 rounded-full bg-blue-400" /> In Progress ({active})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-[#12121a] border border-amber-500/15 rounded-xl p-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Call Volume by Hour</div>
        <div className="flex items-end gap-2 h-28">
          {hourlyData.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-[9px] font-semibold text-slate-400">{v}</div>
              <motion.div
                className="w-full bg-amber-400 rounded-t"
                style={{ opacity: 0.5 + i * 0.07 }}
                animate={{ height: `${Math.round((v / hourlyMax) * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
              <div className="text-[9px] text-slate-500">{hours[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Retry Attempt Success Rate */}
      <div className="bg-[#12121a] border border-amber-500/15 rounded-xl p-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Retry Attempt Success Rate</div>
        <div className="flex gap-4">
          {attemptRates.map(a => (
            <div key={a.label} className="flex-1 bg-[#1a1a26] rounded-lg p-3 text-center">
              <div className="text-[10px] text-slate-500 mb-1">{a.label}</div>
              <div className={`text-xl font-extrabold ${a.color}`}>{a.rate}</div>
              <div className="text-[9px] text-slate-500">pick rate</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function HyperXDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'platform' | 'analytics'>('platform')
  const { startSimulation, stopSimulation, isSimulating, timeJump } = useSimulation()
  const resetAll = useHyperXStore((s) => s.resetAll)
  const simTime = useHyperXStore((s) => s.simTime)
  const speed = useHyperXStore((s) => s.simulationSpeed)
  const setSpeed = useHyperXStore((s) => s.setSimulationSpeed)
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
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0ede8]">
      {/* NAV */}
      <nav className="flex items-center justify-between px-7 py-3 bg-[#12121a] border-b border-amber-500/15 sticky top-0 z-50">
        <div className="flex items-center gap-2.5 text-xl font-bold text-amber-400">
          <Bolt className="h-5 w-5" /> HyperX <span className="text-[#f0ede8] font-light ml-1">× Toyota</span>
        </div>

        <div className="flex gap-1">
          {(['overview', 'platform', 'analytics'] as const).map(tab => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-[13px] transition-all ${
                activeTab === tab ? 'bg-amber-500 text-black font-semibold'
                : 'text-[#a09e9a] hover:bg-[#1a1a26] hover:text-white'
              }`}>
              {tab === 'overview' ? 'Overview' : tab === 'platform' ? 'Live Platform' : 'Analytics'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Sim controls */}
          <div className="flex items-center gap-1 bg-[#1a1a26] border border-amber-500/15 rounded-lg px-2 py-1">
            <Clock className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] text-slate-400">{simTime.toFixed(1)}h</span>
          </div>

          {/* Time jumps */}
          {[2, 4, 24, 48].map(hrs => (
            <button key={hrs} onClick={() => timeJump(hrs)}
              className={`text-[10px] px-2 py-1 rounded-md font-semibold transition-all ${
                simTime >= hrs ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black'
                : 'bg-[#1a1a26] border border-amber-500/15 text-slate-300 hover:bg-[#22223a]'
              }`}>
              {hrs}h
            </button>
          ))}

          <div className="flex items-center gap-0.5 bg-[#1a1a26] border border-amber-500/15 rounded-lg px-1.5 py-1">
            {[1,2,4,8].map(s => (
              <button key={s} onClick={() => setSpeed(s)}
                className={`text-[10px] px-1.5 py-0.5 rounded transition-all ${
                  speed === s ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300'
                }`}>{s}x</button>
            ))}
          </div>

          {/* Live badge */}
          <div className="bg-green-500/15 text-green-400 border border-green-500/30 rounded-full px-3 py-1 text-[11px] font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> LIVE DEMO
          </div>

          {!isSimulating ? (
            <button onClick={handleStart}
              className="bg-amber-500 text-black rounded-lg px-4 py-2 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-400 transition-all">
              <Play className="h-3.5 w-3.5" /> Start Simulation
            </button>
          ) : (
            <button onClick={stopSimulation}
              className="bg-[#1a1a26] border border-amber-500/30 text-amber-400 rounded-lg px-4 py-2 text-xs font-bold flex items-center gap-1.5 hover:bg-[#22223a] transition-all">
              <Pause className="h-3.5 w-3.5" /> Pause
            </button>
          )}

          {hasStarted && (
            <button onClick={handleReset}
              className="bg-[#1a1a26] border border-slate-600/30 text-slate-400 rounded-lg px-3 py-2 text-xs flex items-center gap-1.5 hover:bg-[#22223a] transition-all">
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div className="max-w-[1400px] mx-auto">
        {activeTab === 'overview' && <OverviewPage />}
        {activeTab === 'platform' && <LivePlatformPage />}
        {activeTab === 'analytics' && <AnalyticsPage />}
      </div>
    </div>
  )
}
