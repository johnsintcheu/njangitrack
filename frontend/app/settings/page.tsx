'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'

export default function SettingsPage() {
  const { user, isLoggedIn } = useAuthStore()
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    groupName: "PO'O FANCHE",
    contributionAmount: '20000',
    socialFundAmount: '1500',
    lateFine: '500',
    absenceFine: '1000',
    maxMembers: '18',
    interestRate: '8',
    language: 'EN',
    notifications: true,
    smsAlerts: true,
  })

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-500">
            Configure your Njangi group settings
          </p>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6">
            ✅ Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">

          {/* Group Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Group Configuration
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  GROUP NAME
                </label>
                <input
                  type="text"
                  value={settings.groupName}
                  onChange={(e) =>
                    setSettings({ ...settings, groupName: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  MAX MEMBERS
                </label>
                <input
                  type="number"
                  value={settings.maxMembers}
                  onChange={(e) =>
                    setSettings({ ...settings, maxMembers: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  CONTRIBUTION AMOUNT (XAF)
                </label>
                <input
                  type="number"
                  value={settings.contributionAmount}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contributionAmount: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  SOCIAL FUND AMOUNT (XAF)
                </label>
                <input
                  type="number"
                  value={settings.socialFundAmount}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      socialFundAmount: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Fine Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Fine Rules
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  LATE FINE (XAF)
                </label>
                <input
                  type="number"
                  value={settings.lateFine}
                  onChange={(e) =>
                    setSettings({ ...settings, lateFine: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Applied automatically at deadline
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  ABSENCE FINE (XAF)
                </label>
                <input
                  type="number"
                  value={settings.absenceFine}
                  onChange={(e) =>
                    setSettings({ ...settings, absenceFine: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Applied for unexcused absence
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  LOAN INTEREST RATE (%/month)
                </label>
                <input
                  type="number"
                  value={settings.interestRate}
                  onChange={(e) =>
                    setSettings({ ...settings, interestRate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  LANGUAGE
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({ ...settings, language: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
                >
                  <option value="EN">English</option>
                  <option value="FR">Français</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    Push Notifications
                  </p>
                  <p className="text-xs text-gray-500">
                    Receive in-app alerts
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      notifications: !settings.notifications,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.notifications ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    SMS Alerts
                  </p>
                  <p className="text-xs text-gray-500">
                    Receive SMS via Africa{`'`}s Talking
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      smsAlerts: !settings.smsAlerts,
                    })
                  }
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.smsAlerts ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                      settings.smsAlerts ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              My Profile
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  FULL NAME
                </label>
                <input
                  type="text"
                  defaultValue={user?.fullName}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  EMAIL
                </label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
                />
              </div>
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
                    defaultValue={user?.phoneNumber}
                    className="flex-1 px-3 py-3 text-sm outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  ROLE
                </label>
                <input
                  type="text"
                  defaultValue={user?.role}
                  disabled
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800"
          >
            Save Settings
          </button>

        </form>
      </div>
    </div>
  )
}