'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'
import { reportsApi } from '@/lib/api'
import type { SessionReport } from '@/types'

export default function ReportsPage() {
  const { isLoggedIn, user } = useAuthStore()
  const router = useRouter()

  const [reports, setReports] = useState<SessionReport[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [selected, setSelected] = useState<SessionReport | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    meetingDate: new Date().toISOString().split('T')[0],
    summary: '',
    contributionsTotalXAF: '',
    finesTotalXAF: '',
    socialFundBalanceXAF: '',
    beneficiaryName: '',
    attendeesCount: '',
    decisions: '',
  })

  const isAdmin = user?.role === 'GROUP_ADMIN' || user?.role === 'SUPER_ADMIN'

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    if (!isAdmin) {
      router.push('/dashboard/member')
    }
  }, [isLoggedIn, isAdmin, router])

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
      const response = await reportsApi.get('/reports')
      setReports(response.data)
    } catch {
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () =>
    setFormData({
      title: '',
      meetingDate: new Date().toISOString().split('T')[0],
      summary: '',
      contributionsTotalXAF: '',
      finesTotalXAF: '',
      socialFundBalanceXAF: '',
      beneficiaryName: '',
      attendeesCount: '',
      decisions: '',
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await reportsApi.post('/reports', {
        groupId: 'poo-fanche-group',
        title: formData.title,
        meetingDate: new Date(formData.meetingDate).toISOString(),
        authorId: user?.id,
        authorName: user?.fullName,
        summary: formData.summary,
        contributionsTotalXAF: parseInt(formData.contributionsTotalXAF) || 0,
        finesTotalXAF: parseInt(formData.finesTotalXAF) || 0,
        socialFundBalanceXAF: parseInt(formData.socialFundBalanceXAF) || 0,
        beneficiaryName: formData.beneficiaryName,
        attendeesCount: parseInt(formData.attendeesCount) || 0,
        decisions: formData.decisions,
      })
      setSaved(true)
      setShowForm(false)
      resetForm()
      loadReports()
      setTimeout(() => setSaved(false), 4000)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(
        error.response?.data?.message ||
          'Could not save the report. The Reports endpoint may not be deployed yet on the Ledger service — see BACKEND_TODO.md.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (!isAdmin) return null

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Session Reports
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Write and save meeting / cycle summary reports for {"PO'O FANCHE"}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800"
          >
            + New Report
          </button>
        </div>

        {saved && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg p-4 mb-6">
            ✅ Report saved successfully!
          </div>
        )}

        {/* New Report Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
              Write Session Report
            </h2>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-lg p-3 mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    REPORT TITLE
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cycle 12 General Assembly"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500 bg-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    MEETING DATE
                  </label>
                  <input
                    type="date"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500 bg-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  SUMMARY
                </label>
                <textarea
                  placeholder="What happened at this session..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500 bg-transparent"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    CONTRIBUTIONS (XAF)
                  </label>
                  <input
                    type="number"
                    value={formData.contributionsTotalXAF}
                    onChange={(e) =>
                      setFormData({ ...formData, contributionsTotalXAF: e.target.value })
                    }
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-3 text-sm outline-none focus:border-green-500 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    FINES (XAF)
                  </label>
                  <input
                    type="number"
                    value={formData.finesTotalXAF}
                    onChange={(e) => setFormData({ ...formData, finesTotalXAF: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-3 text-sm outline-none focus:border-green-500 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    SOCIAL FUND (XAF)
                  </label>
                  <input
                    type="number"
                    value={formData.socialFundBalanceXAF}
                    onChange={(e) =>
                      setFormData({ ...formData, socialFundBalanceXAF: e.target.value })
                    }
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-3 text-sm outline-none focus:border-green-500 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    ATTENDEES
                  </label>
                  <input
                    type="number"
                    value={formData.attendeesCount}
                    onChange={(e) => setFormData({ ...formData, attendeesCount: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-3 text-sm outline-none focus:border-green-500 bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  CURRENT BENEFICIARY
                </label>
                <input
                  type="text"
                  value={formData.beneficiaryName}
                  onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500 bg-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  DECISIONS / RESOLUTIONS
                </label>
                <textarea
                  placeholder="Votes, waivers, rule changes decided at this session..."
                  value={formData.decisions}
                  onChange={(e) => setFormData({ ...formData, decisions: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500 bg-transparent"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : '💾 Save Report'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Report Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {selected.title}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(selected.meetingDate).toLocaleDateString()} · by {selected.authorName}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap mb-4">
                {selected.summary}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Contributions</p>
                  <p className="font-bold text-green-700 dark:text-green-400">
                    {Number(selected.contributionsTotalXAF).toLocaleString()} XAF
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fines</p>
                  <p className="font-bold text-red-700 dark:text-red-400">
                    {Number(selected.finesTotalXAF).toLocaleString()} XAF
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Social Fund</p>
                  <p className="font-bold text-purple-700 dark:text-purple-400">
                    {Number(selected.socialFundBalanceXAF).toLocaleString()} XAF
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Attendees</p>
                  <p className="font-bold text-gray-800 dark:text-gray-100">
                    {selected.attendeesCount}
                  </p>
                </div>
              </div>
              {selected.decisions && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    DECISIONS
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                    {selected.decisions}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports List */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Saved Reports
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <p className="p-8 text-center text-gray-400 dark:text-gray-500">Loading…</p>
            ) : reports.length === 0 ? (
              <p className="p-8 text-center text-gray-400 dark:text-gray-500">
                No reports saved yet. Click &quot;+ New Report&quot; after your next meeting.
              </p>
            ) : (
              reports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                      {r.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(r.meetingDate).toLocaleDateString()} · by {r.authorName}
                    </p>
                  </div>
                  <span className="text-xs text-green-700 dark:text-green-400 font-medium">
                    {Number(r.contributionsTotalXAF).toLocaleString()} XAF collected
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
