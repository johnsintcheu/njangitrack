'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'
import { notificationApi } from '@/lib/api'
import type { Notification } from '@/types'

const typeMeta: Record<string, { icon: string; color: string }> = {
  CONTRIBUTION: { icon: '✅', color: 'bg-green-50 dark:bg-green-900/20' },
  REMINDER: { icon: '⏰', color: 'bg-blue-50 dark:bg-blue-900/20' },
  FINE: { icon: '⚠️', color: 'bg-red-50 dark:bg-red-900/20' },
  LOAN: { icon: '💰', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
  PAYOUT: { icon: '🎉', color: 'bg-purple-50 dark:bg-purple-900/20' },
  GENERAL: { icon: '📢', color: 'bg-gray-50 dark:bg-gray-800' },
}

export default function NotificationsPage() {
  const { isLoggedIn, user } = useAuthStore()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const isAdmin = user?.role === 'GROUP_ADMIN' || user?.role === 'SUPER_ADMIN'
      const response = isAdmin
        ? await notificationApi.get('/notifications')
        : await notificationApi.get(`/notifications/member/${user?.id || 'unknown'}`)
      setNotifications(response.data)
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const delivered = notifications.filter((n) => n.status === 'DELIVERED').length
  const failed = notifications.filter((n) => n.status === 'FAILED').length

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400">
            All alerts delivered via SMS and Push
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border-l-4 border-green-600">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Sent</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {notifications.length}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This cycle</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border-l-4 border-blue-600">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Delivered</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{delivered}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border-l-4 border-red-600">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Failed</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">{failed}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Auto-retry pending</p>
          </div>
        </div>

        {/* Notification List */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Recent Notifications
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <p className="p-8 text-center text-gray-400 dark:text-gray-500">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="p-8 text-center text-gray-400 dark:text-gray-500">
                No notifications yet. The Notification Scheduler Agent will publish reminders
                and event alerts here automatically.
              </p>
            ) : (
              notifications.map((notif) => {
                const meta = typeMeta[notif.type] || typeMeta.GENERAL
                return (
                  <div
                    key={notif.id}
                    className={`p-4 ${meta.color} flex items-start gap-4`}
                  >
                    <span className="text-2xl">{meta.icon}</span>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <div>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                            {notif.type}
                          </span>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mt-1">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              notif.status === 'DELIVERED'
                                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                                : notif.status === 'FAILED'
                                ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                                : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                            }`}
                          >
                            {notif.status}
                          </span>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {notif.channel}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
