'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'

export default function NotificationsPage() {
  const { isLoggedIn } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  const notifications = [
    {
      id: '1',
      type: 'CONTRIBUTION',
      message: 'Your contribution of 20,000 XAF has been confirmed',
      date: 'May 15, 2026 - 10:30 AM',
      channel: 'SMS + Push',
      status: 'DELIVERED',
      icon: '✅',
      color: 'bg-green-50',
    },
    {
      id: '2',
      type: 'REMINDER',
      message: 'Contribution deadline in 3 days — May 25, 2026',
      date: 'May 22, 2026 - 9:00 AM',
      channel: 'SMS + Push',
      status: 'DELIVERED',
      icon: '⏰',
      color: 'bg-blue-50',
    },
    {
      id: '3',
      type: 'FINE',
      message: 'Fine of 500 XAF applied for late contribution',
      date: 'May 15, 2026 - 6:01 PM',
      channel: 'SMS + Push',
      status: 'DELIVERED',
      icon: '⚠️',
      color: 'bg-red-50',
    },
    {
      id: '4',
      type: 'LOAN',
      message: 'Loan request of 50,000 XAF has been approved',
      date: 'April 30, 2026 - 2:15 PM',
      channel: 'SMS + Push',
      status: 'DELIVERED',
      icon: '💰',
      color: 'bg-yellow-50',
    },
    {
      id: '5',
      type: 'PAYOUT',
      message: 'Pot of 360,000 XAF disbursed to Jean Brondel',
      date: 'April 28, 2026 - 4:00 PM',
      channel: 'SMS + Push',
      status: 'DELIVERED',
      icon: '🎉',
      color: 'bg-purple-50',
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-500">
            All alerts delivered via SMS and Push
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-600">
            <p className="text-gray-500 text-sm">Total Sent</p>
            <p className="text-2xl font-bold text-green-700">24</p>
            <p className="text-xs text-gray-400 mt-1">This cycle</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-600">
            <p className="text-gray-500 text-sm">Delivered</p>
            <p className="text-2xl font-bold text-blue-700">23</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-600">
            <p className="text-gray-500 text-sm">Failed</p>
            <p className="text-2xl font-bold text-red-700">1</p>
            <p className="text-xs text-gray-400 mt-1">Auto-retry pending</p>
          </div>
        </div>

        {/* Notification List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">
              Recent Notifications
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 ${notif.color} flex items-start gap-4`}
              >
                <span className="text-2xl">{notif.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        {notif.type}
                      </span>
                      <p className="text-sm font-medium text-gray-800 mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notif.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        {notif.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {notif.channel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}