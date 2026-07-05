'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'
import { identityApi, ledgerApi, fineApi, loanApi } from '@/lib/api'
import { Plus, X } from 'lucide-react'

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

  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [groupForm, setGroupForm] = useState({
    name: '',
    contributionAmount: '',
    frequency: 'MONTHLY',
    startDate: '',
  })

  useEffect(() => {
    if (!isLoggedIn) router.push('/login')
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

      if (membersRes.status === 'fulfilled') setMembers(membersRes.value.data)

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

      if (finesRes.status === 'fulfilled') setFines(finesRes.value.data)

      if (loansRes.status === 'fulfilled') {
        const active = (loansRes.value.data as { status: string; outstandingBalanceXAF: number }[])
          .filter((l) => l.status === 'ACTIVE')
        setLoanBalance(active.reduce((s, l) => s + Number(l.outstandingBalanceXAF), 0))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async () => {
    setCreateError('')
    setCreateSuccess('')
    if (!groupForm.name || !groupForm.contributionAmount || !groupForm.startDate) {
      setCreateError('Please fill in all fields.')
      return
    }
    setCreating(true)
    try {
      await identityApi.post('/groups', {
        name: groupForm.name,
        contributionAmount: Number(groupForm.contributionAmount),
        frequency: groupForm.frequency,
        startDate: groupForm.startDate,
      })
      setCreateSuccess('Group created successfully!')
      setGroupForm({ name: '', contributionAmount: '', frequency: 'MONTHLY', startDate: '' })
      setTimeout(() => {
        setShowModal(false)
        setCreateSuccess('')
        loadDashboard()
      }, 2000)
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || 'Failed to create group. Please try again.')
    } finally {
      setCreating(false)
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

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.fullName || 'Admin'}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Create Group
          </button>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center text-gray-400 shadow-sm">
            Loading dashboard...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border-l-4 border-green-600">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Pot</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {(cycle?.potAmountXAF ?? 0).toLocaleString()} XAF
                </p>
                <p className="text-xs text-gray-400 mt-1">Cycle Progress: {progressPct}%</p>
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
                <p className="text-gray-500 dark:text-gray-400 text-sm">Loans Outstanding</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                  {loanBalance.toLocaleString()} XAF
                </p>
                <p className="text-xs text-gray-400 mt-1">Active loan balance</p>
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
                        <td colSpan={3} className="p-8 text-center text-gray-400">
                          No members found yet. Invite members from the Members page.
                        </td>
                      </tr>
                    ) : (
                      members.map((member) => {
                        const status = memberStatus[member.id] || 'NO RECORD'
                        return (
                          <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="p-4 text-sm font-medium text-gray-800 dark:text-gray-100">{member.fullName}</td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                                {member.role}
                              </span>
                            </td>
                            <td className="p-4 text-sm">
                              <span className={
                                status === 'CONFIRMED' ? 'text-green-600' :
                                status === 'PENDING' ? 'text-orange-600' :
                                status === 'OVERDUE' ? 'text-red-600' : 'text-gray-400'
                              }>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Create New Group</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="e.g. PO'O FANCHE"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contribution Amount (XAF)</label>
                <input
                  type="number"
                  value={groupForm.contributionAmount}
                  onChange={(e) => setGroupForm({ ...groupForm, contributionAmount: e.target.value })}
                  placeholder="e.g. 50000"
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                <select
                  value={groupForm.frequency}
                  onChange={(e) => setGroupForm({ ...groupForm, frequency: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Bi-weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={groupForm.startDate}
                  onChange={(e) => setGroupForm({ ...groupForm, startDate: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {createError && (
                <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{createError}</p>
              )}
              {createSuccess && (
                <p className="text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">{createSuccess}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={creating}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
