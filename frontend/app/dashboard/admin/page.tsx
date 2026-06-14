'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'

export default function AdminDashboard() {
  const { isLoggedIn } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-500">
              {"PO'O FANCHE"} Group — May 2026
            </p>
          </div>
          <button className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
            + New Contribution
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-600">
            <p className="text-gray-500 text-sm">Total Pot</p>
            <p className="text-2xl font-bold text-green-700">360,000 XAF</p>
            <p className="text-xs text-gray-400 mt-1">Cycle Progress: 67%</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-600">
            <p className="text-gray-500 text-sm">Contributions</p>
            <p className="text-2xl font-bold text-blue-700">12/18</p>
            <p className="text-xs text-orange-500 mt-1">6 pending today</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-600">
            <p className="text-gray-500 text-sm">Social Fund</p>
            <p className="text-2xl font-bold text-purple-700">85,500 XAF</p>
            <p className="text-xs text-gray-400 mt-1">Available for loans</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-600">
            <p className="text-gray-500 text-sm">Outstanding Fines</p>
            <p className="text-2xl font-bold text-red-700">4,500 XAF</p>
            <p className="text-xs text-red-400 mt-1">3 members pending</p>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Members</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-xs text-gray-500">NAME</th>
                  <th className="text-left p-4 text-xs text-gray-500">ROLE</th>
                  <th className="text-left p-4 text-xs text-gray-500">STATUS</th>
                  <th className="text-left p-4 text-xs text-gray-500">FINES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { name: 'Jean-Paul Kamga', role: 'TREASURER', status: 'Paid', fine: '0 XAF' },
                  { name: 'Marie-Claire Tagne', role: 'MEMBER', status: 'Pending', fine: '1,500 XAF' },
                  { name: 'Samuel Efoua', role: 'MEMBER', status: 'Paid', fine: '0 XAF' },
                  { name: 'Aline Mbarga', role: 'MEMBER', status: 'Overdue', fine: '500 XAF' },
                ].map((member, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-medium text-gray-800">
                      {member.name}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {member.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={
                        member.status === 'Paid' ? 'text-green-600' :
                        member.status === 'Pending' ? 'text-orange-600' :
                        'text-red-600'
                      }>
                        {member.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{member.fine}</td>
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