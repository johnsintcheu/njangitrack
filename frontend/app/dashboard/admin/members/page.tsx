'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'

export default function MembersPage() {
  const { isLoggedIn } = useAuthStore()
  const router = useRouter()
  const [showInvite, setShowInvite] = useState(false)
  const [invitePhone, setInvitePhone] = useState('')
  const [invited, setInvited] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  const members = [
    {
      id: '1',
      name: 'Jean-Paul Kamga',
      phone: '+237 670 000 000',
      quartier: 'Bonamoussadi',
      role: 'TREASURER',
      status: 'Paid',
      fines: '0 XAF',
      loans: '150,000 XAF',
      joinDate: 'Jan 2024',
    },
    {
      id: '2',
      name: 'Marie-Claire Tagne',
      phone: '+237 680 000 000',
      quartier: 'Makepe',
      role: 'MEMBER',
      status: 'Pending',
      fines: '1,500 XAF',
      loans: '0 XAF',
      joinDate: 'Jan 2024',
    },
    {
      id: '3',
      name: 'Samuel Efoua',
      phone: '+237 677 000 000',
      quartier: 'Logpom',
      role: 'MEMBER',
      status: 'Paid',
      fines: '0 XAF',
      loans: '0 XAF',
      joinDate: 'Jan 2024',
    },
    {
      id: '4',
      name: 'Aline Mbarga',
      phone: '+237 699 000 000',
      quartier: 'Bonamoussadi',
      role: 'MEMBER',
      status: 'Overdue',
      fines: '500 XAF',
      loans: '0 XAF',
      joinDate: 'Feb 2024',
    },
    {
      id: '5',
      name: 'Pierre Nkeng',
      phone: '+237 655 000 000',
      quartier: 'Makepe',
      role: 'MEMBER',
      status: 'Paid',
      fines: '0 XAF',
      loans: '0 XAF',
      joinDate: 'Jan 2024',
    },
  ]

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    setInvited(true)
    setShowInvite(false)
    setInvitePhone('')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Members</h1>
            <p className="text-gray-500">
              {"PO'O FANCHE"} — 5 of 18 members shown
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
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-600">
            <p className="text-gray-500 text-xs">Total Members</p>
            <p className="text-2xl font-bold text-green-700">18</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-600">
            <p className="text-gray-500 text-xs">Paid This Cycle</p>
            <p className="text-2xl font-bold text-blue-700">12</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-600">
            <p className="text-gray-500 text-xs">Pending</p>
            <p className="text-2xl font-bold text-orange-700">4</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-600">
            <p className="text-gray-500 text-xs">Overdue</p>
            <p className="text-2xl font-bold text-red-700">2</p>
          </div>
        </div>

        {/* Success Message */}
        {invited && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6">
            ✅ Invitation sent successfully!
          </div>
        )}

        {/* Invite Form */}
        {showInvite && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Invite New Member
            </h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  PHONE NUMBER
                </label>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <span className="bg-gray-50 px-3 py-3 text-gray-600 text-sm border-r">
                    +237
                  </span>
                  <input
                    type="tel"
                    placeholder="6XX XXX XXX"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    className="flex-1 px-3 py-3 text-sm outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-700 text-white py-3 rounded-lg font-semibold"
                >
                  Send Invitation
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Members Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">All Members</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">NAME</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">PHONE</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">QUARTIER</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">ROLE</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">STATUS</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">FINES</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">LOANS</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">JOINED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-700 font-bold text-xs">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-800 text-sm">
                          {member.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{member.phone}</td>
                    <td className="p-4 text-sm text-gray-600">{member.quartier}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === 'TREASURER'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-medium ${
                        member.status === 'Paid'
                          ? 'text-green-600'
                          : member.status === 'Pending'
                          ? 'text-orange-600'
                          : 'text-red-600'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-red-600">{member.fines}</td>
                    <td className="p-4 text-sm text-orange-600">{member.loans}</td>
                    <td className="p-4 text-sm text-gray-500">{member.joinDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}