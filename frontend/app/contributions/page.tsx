'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'
import { ledgerApi } from '@/lib/api'

interface Contribution {
  id: string
  memberId: string
  amountXAF: number
  paymentMethod: string
  paymentDate: string
  status: string
  note?: string
}

export default function ContributionsPage() {
  const { isLoggedIn, user } = useAuthStore()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(false)
  const [cycleId, setCycleId] = useState('')
  const [formData, setFormData] = useState({
    amount: '20000',
    paymentMethod: 'MTN_MOMO',
    date: new Date().toISOString().split('T')[0],
    note: '',
  })

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    createOrGetCycle()
  }, [])

  const createOrGetCycle = async () => {
    try {
      const response = await ledgerApi.post('/cycles', {
        groupId: 'poo-fanche-group',
        cycleNumber: 1,
        potAmountXAF: 360000,
        startDate: new Date().toISOString(),
        rotationAlgorithm: 'sequential',
      })
      setCycleId(response.data.id)
      loadContributions(response.data.id)
    } catch {
      loadContributionsFallback()
    }
  }

  const loadContributions = async (id: string) => {
    try {
      const response = await ledgerApi.get(`/contributions/cycle/${id}`)
      setContributions(response.data)
    } catch {
      setContributions([])
    }
  }

  const loadContributionsFallback = async () => {
    try {
      const response = await ledgerApi.get('/contributions/cycle/poo-fanche-group')
      setContributions(response.data)
    } catch {
      setContributions([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await ledgerApi.post('/contributions', {
        cycleId: cycleId,
        memberId: user?.id || 'unknown',
        amountXAF: parseInt(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentDate: new Date(formData.date).toISOString(),
        note: formData.note,
      })

      setSubmitted(true)
      setShowForm(false)
      loadContributions(cycleId)
      setFormData({
        amount: '20000',
        paymentMethod: 'MTN_MOMO',
        date: new Date().toISOString().split('T')[0],
        note: '',
      })
    } catch {
      alert('Failed to submit contribution. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const confirmContribution = async (id: string) => {
    try {
      await ledgerApi.patch(`/contributions/${id}/confirm`, {
        treasurerId: user?.id || 'treasurer',
      })
      loadContributions(cycleId)
    } catch {
      alert('Failed to confirm contribution.')
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Contributions</h1>
            <p className="text-gray-500">
              Current Cycle — {contributions.filter(c => c.status === 'CONFIRMED').length}/{contributions.length} Confirmed
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-700 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-800 font-semibold"
          >
            + New Contribution
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-600">
            <p className="text-gray-500 text-xs">Confirmed</p>
            <p className="text-2xl font-bold text-green-700">
              {contributions.filter(c => c.status === 'CONFIRMED').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500">
            <p className="text-gray-500 text-xs">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {contributions.filter(c => c.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-600">
            <p className="text-gray-500 text-xs">Overdue</p>
            <p className="text-2xl font-bold text-red-700">
              {contributions.filter(c => c.status === 'OVERDUE').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-600">
            <p className="text-gray-500 text-xs">Total Collected</p>
            <p className="text-2xl font-bold text-blue-700">
              {contributions
                .filter(c => c.status === 'CONFIRMED')
                .reduce((sum, c) => sum + Number(c.amountXAF), 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">XAF</p>
          </div>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6 flex items-center gap-2">
            <span>✅</span>
            <div>
              <p className="font-semibold text-sm">Contribution submitted successfully!</p>
              <p className="text-xs">Status: PENDING — Treasurer will verify within 24 hours.</p>
            </div>
          </div>
        )}

        {/* New Contribution Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">Record Contribution</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">AMOUNT (XAF)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">PAYMENT METHOD</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'MTN_MOMO', label: '📱 MTN MoMo' },
                      { value: 'ORANGE_MONEY', label: '🟠 Orange Money' },
                      { value: 'CASH', label: '💵 Cash' },
                    ].map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: method.value })}
                        className={`py-3 rounded-lg text-xs font-medium border-2 transition-colors ${
                          formData.paymentMethod === method.value
                            ? 'border-green-600 bg-green-50 text-green-700'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">PAYMENT DATE</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">NOTE (OPTIONAL)</label>
                  <input
                    type="text"
                    placeholder="e.g. Transaction ref: ABC123"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : '✅ Submit Contribution'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Contributions Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">All Contributions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">MEMBER ID</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">AMOUNT</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">METHOD</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">DATE</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">STATUS</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contributions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No contributions yet. Click &quot;+ New Contribution&quot; to add one.
                    </td>
                  </tr>
                ) : (
                  contributions.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm text-gray-600">{c.memberId.slice(0, 8)}...</td>
                      <td className="p-4 text-sm font-semibold text-gray-800">
                        {Number(c.amountXAF).toLocaleString()} XAF
                      </td>
                      <td className="p-4 text-sm text-gray-600">{c.paymentMethod}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(c.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          c.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          c.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {c.status === 'PENDING' && (
                          <button
                            onClick={() => confirmContribution(c.id)}
                            className="text-xs text-green-600 hover:underline font-medium"
                          >
                            Confirm
                          </button>
                        )}
                        {c.status === 'CONFIRMED' && (
                          <span className="text-xs text-gray-400">Verified ✅</span>
                        )}
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