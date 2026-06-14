'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'
import { fineApi } from '@/lib/api'

interface Fine {
  id: string
  memberId: string
  cycleId: string
  amountXAF: number
  reason: string
  status: string
  triggeredAt: string
  disputeReason?: string
}

export default function FinesPage() {
  const { isLoggedIn, user } = useAuthStore()
  const router = useRouter()
  const [showDispute, setShowDispute] = useState(false)
  const [selectedFine, setSelectedFine] = useState<string | null>(null)
  const [disputeReason, setDisputeReason] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [fines, setFines] = useState<Fine[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    loadFines()
  }, [])

  const loadFines = async () => {
    try {
      const response = await fineApi.get(`/fines/member/${user?.id || 'unknown'}`)
      setFines(response.data)
    } catch {
      setFines([])
    }
  }

  const handleDispute = (fineId: string) => {
    setSelectedFine(fineId)
    setShowDispute(true)
  }

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await fineApi.patch(`/fines/${selectedFine}/dispute`, {
        disputeReason,
      })
      setSubmitted(true)
      setShowDispute(false)
      setDisputeReason('')
      loadFines()
    } catch {
      alert('Failed to submit dispute. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const totalOutstanding = fines
    .filter(f => f.status === 'OUTSTANDING')
    .reduce((sum, f) => sum + Number(f.amountXAF), 0)

  const totalCollected = fines
    .filter(f => f.status === 'PAID')
    .reduce((sum, f) => sum + Number(f.amountXAF), 0)

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Fines & Compliance</h1>
          <p className="text-gray-500">Automated fine enforcement for the group</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-600">
            <p className="text-gray-500 text-sm">Total Outstanding</p>
            <p className="text-2xl font-bold text-red-700">
              {totalOutstanding.toLocaleString()} XAF
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {fines.filter(f => f.status === 'OUTSTANDING').length} fines
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-600">
            <p className="text-gray-500 text-sm">Collected</p>
            <p className="text-2xl font-bold text-green-700">
              {totalCollected.toLocaleString()} XAF
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-600">
            <p className="text-gray-500 text-sm">Total Fines</p>
            <p className="text-2xl font-bold text-blue-700">{fines.length}</p>
          </div>
        </div>

        {/* Fine Rules Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-yellow-800 font-semibold text-sm mb-2">
            ⚡ Automated Fine Rules
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-yellow-700">
            <p>• Late contribution: <strong>500 XAF</strong></p>
            <p>• Unexcused absence: <strong>1,000 XAF</strong></p>
            <p>• Fines auto-triggered by agent at deadline</p>
            <p>• Dispute within <strong>48 hours</strong></p>
          </div>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6">
            ✅ Dispute submitted! Admin will review within 24 hours.
          </div>
        )}

        {/* Dispute Form */}
        {showDispute && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Submit Dispute</h2>
            <div className="bg-red-50 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm font-medium">
                Disputing Fine #{selectedFine?.slice(0, 8)}...
              </p>
            </div>
            <form onSubmit={handleSubmitDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  REASON FOR DISPUTE
                </label>
                <textarea
                  placeholder="Describe why you believe this fine is incorrect..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  An admin will review your request within 24 hours.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Dispute'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDispute(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Fines Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">All Fines</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">MEMBER ID</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">AMOUNT</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">REASON</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">DATE</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">STATUS</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No fines yet. The Contribution Monitor Agent will auto-trigger fines at deadlines.
                    </td>
                  </tr>
                ) : (
                  fines.map((fine) => (
                    <tr key={fine.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm text-gray-600">{fine.memberId.slice(0, 8)}...</td>
                      <td className="p-4 text-sm font-bold text-red-600">
                        {Number(fine.amountXAF).toLocaleString()} XAF
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          fine.reason === 'LATE'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {fine.reason}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(fine.triggeredAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          fine.status === 'OUTSTANDING' ? 'bg-red-100 text-red-700' :
                          fine.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          fine.status === 'DISPUTED' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {fine.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {fine.status === 'OUTSTANDING' && (
                          <button
                            onClick={() => handleDispute(fine.id)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Dispute
                          </button>
                        )}
                        {fine.status === 'DISPUTED' && (
                          <span className="text-xs text-gray-400">Under review</span>
                        )}
                        {fine.status === 'WAIVED' && (
                          <span className="text-xs text-green-600">Waived ✅</span>
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