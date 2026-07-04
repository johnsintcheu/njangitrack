'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'
import { identityApi, ledgerApi, fineApi, loanApi } from '@/lib/api'

interface Cycle {
  id: string
  cycleNumber: number
  potAmountXAF: number
  confirmationPercentage?: number
  status: string
}

interface Contribution {
  id: string
  memberId: string
  amountXAF: number
  status: string
}

interface Fine {
  id: string
  amountXAF: number
  status: string
}

interface Member {
  id: string
  fullName: string
  role: string
}

export default function AdminDashboard() {
  const { isLoggedIn, user } = useAuthStore()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [cycle, setCycle] = useState<Cycle | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [fines, setFines] = useState<Fine[]>([])
  const [loanBalance, setLoanBalance] = useState(0)
  const [members, setMembers] = useState<Member[]>([])
  const [memberStatus, setMemberStatus] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const [membersRes, cyclesRes, finesRes, loansRes] = await Promise.allSettled([
        identityApi.get('/users'),
        ledgerApi.get('/cycles/active'),
        fineApi.get('/fines'),
        loanApi.get('/loans/group/poo-fanche-group'),
      ])

      if (membersRes.status === 'fulfilled') {
        setMembers(membersRes.value.data)
      }

      let activeCycle: Cycle | null = null
      if (cyclesRes.status === 'fulfilled') {
        activeCycle = cyclesRes.value.data
        setCycle(activeCycle)
      }

      if (activeCycle) {
        try {
          const contribRes = await ledgerApi.get(`/contributions/cycle/${activeCycle.id}`)
          setContributions(contribRes.data)
          const statusMap: Record<string, string> = {}
          for (const c of contribRes.data as Contribution[]) {
            statusMap[c.memberId] = c.status
          }
          setMemberStatus(statusMap)
        } catch {
          setContributions([])
        }
      }

      if (finesRes.status === 'fulfilled') {
        setFines(finesRes.value.data)
      }

      if (loansRes.status === 'fulfilled') {
        const active = (loansRes.value.data as { status: string; outstandingBalanceXAF: number }[])
          .filter((l) => l.status === 'ACTIVE')
        setLoanBalance(active.reduce((s, l) => s + Number(l.outstandingBalanceXAF), 0))
      }
    } finally {
      setLoading(false)
    }
  }

  const confirmedCount = contributions.filter((c) => c.status === 'CONFIRMED').length
  const totalOutstandingFines = fines
    .filter((f) => f.status === 'OUTSTANDING')
    .reduce((s, f) => s + Number(f.amountXAF), 0)
  const progressPct = cycle
    ? Math.round((confirmedCount / Math.max(members.length, 1)) * 100)
    : 0

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Welcome back, {user?.fullName || 'Admin'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 shadow-sm">
            Loading dashboard…
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border-l-4 border-green-600">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Pot</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {(cycle?.potAmountXAF ?? 0).toLocaleString()} XAF
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Cycle Progress: {progressPct}%
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border-l-4 border-blue-600">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Contributions</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {confirmedCount}/{members.length || contributions.length}
                </p>
                <p className="text-xs text-orange-500 mt-1">
                  {contributions.filter((c) => c.status === 'PENDING').length} pending
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border-l-4 border-purple-600">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Social Fund / Loans Outstanding</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                  {loanBalance.toLocaleString()} XAF
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Active loan balance</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border-l-4 border-red-600">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Outstanding Fines</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {totalOutstandingFines.toLocaleString()} XAF
                </p>
                <p className="text-xs text-red-400 mt-1">
                  {fines.filter((f) => f.status === 'OUTSTANDING').length} outstanding
                </p>
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Members</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left p-4 text-xs text-gray-500 dark:text-gray-400">NAME</th>
                      <th className="text-left p-4 text-xs text-gray-500 dark:text-gray-400">ROLE</th>
                      <th className="text-left p-4 text-xs text-gray-500 dark:text-gray-400">CYCLE STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-gray-400 dark:text-gray-500">
                          No members found yet. Invite members from the Members page.
                        </td>
                      </tr>
                    ) : (
                      members.map((member) => {
                        const status = memberStatus[member.id] || 'NO RECORD'
                        return (
                          <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="p-4 text-sm font-medium text-gray-800 dark:text-gray-100">
                              {member.fullName}
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                                {member.role}
                              </span>
                            </td>
                            <td className="p-4 text-sm">
                              <span
                                className={
                                  status === 'CONFIRMED'
                                    ? 'text-green-600 dark:text-green-400'
                                    : status === 'PENDING'
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : status === 'OVERDUE'
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-gray-400 dark:text-gray-500'
                                }
                              >
                                {status}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
