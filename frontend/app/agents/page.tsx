'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'
import { agentServices } from '@/lib/api'
import type { AgentStatus } from '@/types'

const EXPECTED_AGENTS = [
  { agentName: 'Payment Verification Agent', service: 'Ledger Service', schedule: 'Webhook-driven (MoMo/Orange Money)' },
  { agentName: 'Payout Readiness Agent', service: 'Ledger Service', schedule: 'Every 1 minute' },
  { agentName: 'Contribution Monitor Agent', service: 'Fine Service', schedule: 'Every 1 minute' },
  { agentName: 'Loan Interest Accrual Agent', service: 'Loan Service', schedule: 'Daily at midnight' },
  { agentName: 'Notification Scheduler Agent', service: 'Notification Service', schedule: 'Hourly' },
  { agentName: 'Notification Retry Agent', service: 'Notification Service', schedule: 'Every 30 minutes' },
]

function relativeTime(iso: string | null) {
  if (!iso) return 'never'
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  return `${Math.round(hrs / 24)} day(s) ago`
}

export default function AgentsPage() {
  const { isLoggedIn, user } = useAuthStore()
  const router = useRouter()
  const [statuses, setStatuses] = useState<AgentStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [endpointMissing, setEndpointMissing] = useState(false)

  const isAdmin = user?.role === 'GROUP_ADMIN' || user?.role === 'SUPER_ADMIN'

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    if (!isAdmin) {
      router.push('/dashboard/member')
    }
  }, [isLoggedIn, isAdmin, router])

  useEffect(() => {
    loadStatuses()
    const interval = setInterval(loadStatuses, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadStatuses = async () => {
    setLoading(true)
    const results = await Promise.allSettled(
      agentServices.map((s) => s.api.get('/agents/status'))
    )
    const collected: AgentStatus[] = []
    let anyOk = false
    results.forEach((r) => {
      if (r.status === 'fulfilled') {
        anyOk = true
        collected.push(...(r.value.data as AgentStatus[]))
      }
    })
    setEndpointMissing(!anyOk)
    setStatuses(collected)
    setLastChecked(new Date())
    setLoading(false)
  }

  const merged = EXPECTED_AGENTS.map((expected) => {
    const live = statuses.find((s) => s.agentName === expected.agentName)
    if (live) return live
    return {
      ...expected,
      lastRunAt: null,
      lastRunDurationMs: null,
      lastRunRecordsProcessed: null,
      status: 'UNKNOWN' as const,
    }
  })

  const statusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
      case 'STALE':
        return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
      case 'ERROR':
        return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
    }
  }

  if (!isAdmin) return null

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              System Health — Autonomous Agents
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Live proof that the 5 BDI agents are actually executing, not simulated
            </p>
          </div>
          <button
            onClick={loadStatuses}
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800"
          >
            ↻ Refresh Now
          </button>
        </div>

        {endpointMissing && !loading && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 rounded-xl p-4 mb-6 text-sm">
            ⚠️ None of the microservices returned <code>GET /agents/status</code> yet.
            This page is wired and ready — add the <code>AgentStatusModule</code>
            described in <code>BACKEND_TODO.md</code> to each NestJS service so every
            CronJob logs its run and this dashboard turns green automatically.
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Agent Heartbeats</h2>
            {lastChecked && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Checked {relativeTime(lastChecked.toISOString())}
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left p-4 text-xs text-gray-500 dark:text-gray-400 font-semibold">AGENT</th>
                  <th className="text-left p-4 text-xs text-gray-500 dark:text-gray-400 font-semibold">SERVICE</th>
                  <th className="text-left p-4 text-xs text-gray-500 dark:text-gray-400 font-semibold">SCHEDULE</th>
                  <th className="text-left p-4 text-xs text-gray-500 dark:text-gray-400 font-semibold">LAST RUN</th>
                  <th className="text-left p-4 text-xs text-gray-500 dark:text-gray-400 font-semibold">RECORDS PROCESSED</th>
                  <th className="text-left p-4 text-xs text-gray-500 dark:text-gray-400 font-semibold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {merged.map((agent) => (
                  <tr key={agent.agentName} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-4 text-sm font-medium text-gray-800 dark:text-gray-100">
                      <span
                        className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          agent.status === 'HEALTHY'
                            ? 'bg-green-500 animate-pulse'
                            : agent.status === 'STALE'
                            ? 'bg-yellow-500'
                            : agent.status === 'ERROR'
                            ? 'bg-red-500'
                            : 'bg-gray-400'
                        }`}
                      />
                      {agent.agentName}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{agent.service}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{agent.schedule}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                      {relativeTime(agent.lastRunAt)}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                      {agent.lastRunRecordsProcessed ?? '—'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
          This dashboard polls every 30 seconds. For your defense demo, trigger a
          contribution deadline or leave the page open — the Contribution Monitor
          and Payout Readiness agents run every minute, so you&apos;ll see
          &quot;Last Run&quot; move in real time.
        </p>
      </div>
    </div>
  )
}
