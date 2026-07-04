'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'
import { identityApi, fineApi } from '@/lib/api'

interface Member {
  id: string
  fullName: string
  phoneNumber: string
  quartier?: string
  role: string
  createdAt: string
}

interface Fine {
  memberId: string
  amountXAF: number
  status: string
}

export default function MembersPage() {
  const { isLoggedIn } = useAuthStore()
  const router = useRouter()
  const [showInvite, setShowInvite] = useState(false)
  const [invitePhone, setInvitePhone] = useState('')
  const [inviting, setInviting] = useState(false)
  const [invited, setInvited] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [fines, setFines] = useState<Fine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    setLoading(true)
    try {
      const [membersRes, finesRes] = await Promise.allSettled([
        identityApi.get('/users'),
        fineApi.get('/fines'),
      ])
      if (membersRes.status === 'fulfilled') setMembers(membersRes.value.data)
      if (finesRes.status === 'fulfilled') setFines(finesRes.value.data)
    } finally {
      setLoading(false)
    }
  }

  const finesFor = (memberId: string) =>
    fines
      .filter((f) => f.memberId === memberId && f.status === 'OUTSTANDING')
      .reduce((s, f) => s + Number(f.amountXAF), 0)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setInviteError('')
    try {
      await identityApi.post('/users/invite', {
        phoneNumber: invitePhone,
      })
      setInvited(true)
      setShowInvite(false)
      setInvitePhone('')
      loadMembers()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setInviteError(error.response?.data?.message || 'Failed to send invitation.')
    } finally {
      setInviting(false)
    }
  }

  const paidCount = members.length - fines.filter((f) => f.status === 'OUTSTANDING').length

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Members</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {members.length} member{members.length !== 1 ? 's' : ''} in your group
            </p>
          </div>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800"
          >
            + Invite Member
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border-l-4 border-green-600">
            <p className="text-gray-500 dark:text-gray-400 text-xs">Total Members</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{members.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border-l-4 border-blue-600">
            <p className="text-gray-500 dark:text-gray-400 text-xs">In Good Standing</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{Math.max(paidCount, 0)}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border-l-4 border-orange-600">
            <p className="text-gray-500 dark:text-gray-400 text-xs">With Outstanding Fines</p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              {new Set(fines.filter((f) => f.status === 'OUTSTANDING').map((f) => f.memberId)).size}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border-l-4 border-red-600">
            <p className="text-gray-500 dark:text-gray-400 text-xs">Treasurers</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">
              {members.filter((m) => m.role === 'TREASURER').length}
            </p>
          </div>
        </div>

        {/* Success Message */}
        {invited && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg p-4 mb-6">
            ✅ Invitation sent successfully!
          </div>
        )}

        {/* Invite Form */}
        {showInvite && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
              Invite New Member
            </h2>
            {inviteError && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-lg p-3 mb-4 text-sm">
                {inviteError}
              </div>
            )}
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  PHONE NUMBER
                </label>
                <div className="flex border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                  <span className="bg-gray-50 dark:bg-gray-800 px-3 py-3 text-gray-600 dark:text-gray-300 text-sm border-r dark:border-gray-700">
                    +237
                  </span>
                  <input
                    type="tel"
                    placeholder="6XX XXX XXX"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    className="flex-1 px-3 py-3 text-sm outline-none bg-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 bg-green-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Members Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">All Members</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left p-4 text-xs text-gray-500 dark:text-gray-400 font-semibold">NAME</th>
                  <th className="text-left p-4 text-xs text-gray-500 dark:text-gray-400 font-semibold">PHONE</th>
                  <th className="text-left p-4 text-xs text-gray-500 dark:text-gray-400 font-semibold">QUARTIER</th>
                  <th className="text-left p-4 text-xs text-gray-500 dark:text-gray-400 font-semibold">ROLE</th>
                  <th className="text-left p-4 text-xs text-gray-500 dark:text-gray-400 font-semibold">FINES</th>
                  <th className="text-left p-4 text-xs text-gray-500 dark:text-gray-400 font-semibold">JOINED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 dark:text-gray-500">
                      Loading members…
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400 dark:text-gray-500">
                      No members yet. Click &quot;+ Invite Member&quot; to add one.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                            <span className="text-green-700 dark:text-green-300 font-bold text-xs">
                              {member.fullName.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                            {member.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{member.phoneNumber}</td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{member.quartier || '—'}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            member.role === 'TREASURER'
                              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                              : member.role === 'GROUP_ADMIN' || member.role === 'SUPER_ADMIN'
                              ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-red-600 dark:text-red-400">
                        {finesFor(member.id).toLocaleString()} XAF
                      </td>
                      <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
