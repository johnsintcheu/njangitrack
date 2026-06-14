'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'

export default function MemberDashboard() {
  const { user, isLoggedIn } = useAuthStore()
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Member Dashboard
          </h1>
          <p className="text-gray-500">
            Welcome back, {user?.fullName}!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-600">
            <p className="text-gray-500 text-sm">Total Pot</p>
            <p className="text-2xl font-bold text-green-700">360,000 XAF</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-600">
            <p className="text-gray-500 text-sm">My Status</p>
            <p className="text-2xl font-bold text-blue-700">Paid ✅</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-600">
            <p className="text-gray-500 text-sm">Outstanding Fines</p>
            <p className="text-2xl font-bold text-red-700">0 XAF</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-orange-600">
            <p className="text-gray-500 text-sm">Loan Balance</p>
            <p className="text-2xl font-bold text-orange-700">0 XAF</p>
          </div>
        </div>

        {/* Cycle Progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Current Cycle
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full"
                style={{ width: '67%' }}
              ></div>
            </div>
            <span className="text-green-700 font-bold">67%</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Beneficiary</p>
              <p className="font-semibold text-gray-800">Jean Brondel</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Cycle</p>
              <p className="font-semibold text-gray-800">12 of 18</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Due Date</p>
              <p className="font-semibold text-gray-800">May 25, 2026</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Days Left</p>
              <p className="font-semibold text-red-600">3 days</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
              <span>✅</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">Payment Confirmed</p>
                <p className="text-xs text-gray-500">20,000 XAF confirmed</p>
              </div>
              <span className="ml-auto text-xs text-gray-400">May 15</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
              <span>📢</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">Meeting Reminder</p>
                <p className="text-xs text-gray-500">General assembly at Akwa</p>
              </div>
              <span className="ml-auto text-xs text-gray-400">May 12</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg">
              <span>💰</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">Social Fund</p>
                <p className="text-xs text-gray-500">1,500 XAF recorded</p>
              </div>
              <span className="ml-auto text-xs text-gray-400">May 10</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}