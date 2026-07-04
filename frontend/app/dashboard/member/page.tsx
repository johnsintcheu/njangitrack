'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'
import { ledgerApi, fineApi, loanApi, notificationApi } from '@/lib/api'

interface Cycle {
  id: string
  cycleNumber: number
  potAmountXAF: number
  beneficiaryName?: string
  endDate?: string
  status: string
}

interface Contribution {
  memberId: string
  status: string
}

interface ActivityItem {
  id: string
  message: string
  createdAt: string
  type: string
}

export default function MemberDashboard() {
  const { user, isLoggedIn } = useAuthStore()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [cycle, setCycle] = useState<Cycle | null>(null)
  const [myStatus, setMyStatus] = useState<string>('NO RECORD')
  const [outstandingFines, setOutstandingFines] = useState(0)
  const [loanBalance, setLoanBalance] = useState(0)
  const [activity, setActivity] = useState<ActivityItem[]>([])

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
      const [cycleRes, finesRes, loansRes, notifRes] = await Promise.allSettled([
        ledgerApi.get('/cycles/active'),
        fineApi.get(`/fines/member/${user?.id || 'unknown'}`),
        loanApi.get('/loans/group/poo-fanche-group'),
        notificationApi.get(`/notifications/member/${user?.id || 'unknown'}`),
      ])

      let activeCycle: Cycle | null = null
      if (cycleRes.status === 'fulfilled') {
        activeCycle = cycleRes.value.data
        setCycle(activeCycle)
      }

      if (activeCycle) {
        try {
          const contribRes = await ledgerApi.get(`/contributions/cycle/${activeCycle.id}`)
          const mine = (contribRes.data as Contribution[]).find(
            (c) => c.memberId === user?.id
          )
          setMyStatus(mine?.status || 'NO RECORD')
        } catch {
          setMyStatus('NO RECORD')
        }
      }

      if (finesRes.status === 'fulfilled') {
        const outstanding = (finesRes.value.data as { amountXAF: number; status: string }[])
          .filter((f) => f.status === 'OUTSTANDING')
          .reduce((s, f) => s + Number(f.amountXAF), 0)
        setOutstandingFines(outstanding)
      }

      if (loansRes.status === 'fulfilled') {
        const mine = (loansRes.value.data as { borrowerId: string; status: string; outstandingBalanceXAF: number }[])
          .filter((l) => l.borrowerId === user?.id && l.status === 'ACTIVE')
        setLoanBalance(mine.reduce((s, l) => s + Number(l.outstandingBalanceXAF), 0))
      }

      if (notifRes.status === 'fulfilled') {
        setActivity(notifRes.value.data)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Member Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome back, {user?.fullName}!
          </p>
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
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border-l-4 border-blue-600">
                <p className="text-gray-500 dark:text-gray-400 text-sm">My Status</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {myStatus === 'CONFIRMED' ? 'Paid ✅' : myStatus}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border-l-4 border-red-600">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Outstanding Fines</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {outstandingFines.toLocaleString()} XAF
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border-l-4 border-orange-600">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Loan Balance</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                  {loanBalance.toLocaleString()} XAF
                </p>
              </div>
            </div>

            {/* Cycle Progress */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                Current Cycle
              </h2>
              {cycle ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Beneficiary</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {cycle.beneficiaryName || 'TBD'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Cycle</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      #{cycle.cycleNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Due Date</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {cycle.endDate ? new Date(cycle.endDate).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Status</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{cycle.status}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 text-sm">No active cycle yet.</p>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                Recent Activity
              </h2>
              {activity.length === 0 ? (
                <p className="text-gray-400 dark:text-gray-500 text-sm">No notifications yet.</p>
              ) : (
                <div className="space-y-3">
                  {activity.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                          {item.type}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.message}</p>
                      </div>
                      <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
