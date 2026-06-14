'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import Sidebar from '@/components/layout/Sidebar'
import { loanApi } from '@/lib/api'

interface Loan {
  id: string
  borrowerId: string
  groupId: string
  principalXAF: number
  monthlyInterestRate: number
  outstandingBalanceXAF: number
  status: string
  disbursedAt: string
}

export default function LoansPage() {
  const { isLoggedIn, user } = useAuthStore()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    reason: '',
    repaymentPeriod: '3',
  })

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    loadLoans()
  }, [])

  const loadLoans = async () => {
    try {
      const response = await loanApi.get('/loans/group/poo-fanche-group')
      setLoans(response.data)
    } catch {
      setLoans([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await loanApi.post('/loans', {
        borrowerId: user?.id || 'unknown',
        groupId: 'poo-fanche-group',
        principalXAF: parseInt(formData.amount),
        monthlyInterestRate: 8,
      })

      setSubmitted(true)
      setShowForm(false)
      loadLoans()
      setFormData({ amount: '', reason: '', repaymentPeriod: '3' })
    } catch {
      alert('Failed to submit loan request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const totalOutstanding = loans
    .filter(l => l.status === 'ACTIVE')
    .reduce((sum, l) => sum + Number(l.outstandingBalanceXAF), 0)

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Social Fund & Loans</h1>
            <p className="text-gray-500">Interest Rate: 8% per month</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800"
          >
            + Request Loan
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-600">
            <p className="text-gray-500 text-sm">Active Loans</p>
            <p className="text-2xl font-bold text-green-700">
              {loans.filter(l => l.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-600">
            <p className="text-gray-500 text-sm">Repaid Loans</p>
            <p className="text-2xl font-bold text-blue-700">
              {loans.filter(l => l.status === 'REPAID').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-orange-600">
            <p className="text-gray-500 text-sm">Total Outstanding</p>
            <p className="text-2xl font-bold text-orange-700">
              {totalOutstanding.toLocaleString()} XAF
            </p>
          </div>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6">
            ✅ Loan request submitted! Group Admin will review within 48 hours.
          </div>
        )}

        {/* Loan Request Form */}
        {showForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Request Emergency Loan</h2>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="text-blue-700 text-sm font-medium">Community Voting Required</p>
              <p className="text-blue-600 text-xs mt-1">
                Emergency loans require 2/3 majority vote. Interest rate: 8% per month.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  LOAN AMOUNT (XAF)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
                  required
                />
                {formData.amount && (
                  <p className="text-xs text-gray-500 mt-1">
                    Total repayment (3 months):{' '}
                    <span className="font-bold text-green-700">
                      {(parseFloat(formData.amount) * 1.08 * 3).toLocaleString()} XAF
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  REPAYMENT PERIOD
                </label>
                <select
                  value={formData.repaymentPeriod}
                  onChange={(e) => setFormData({ ...formData, repaymentPeriod: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
                >
                  <option value="1">1 month</option>
                  <option value="2">2 months</option>
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  REASON FOR LOAN
                </label>
                <div className="flex gap-2 mb-2">
                  {['Medical', 'Education', 'Funeral', 'Business'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, reason: r })}
                      className={`px-3 py-1 rounded-full text-xs border ${
                        formData.reason === r
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 text-gray-600'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Describe your emergency..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loans Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">All Loans</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">BORROWER ID</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">PRINCIPAL</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">INTEREST</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">OUTSTANDING</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">DISBURSED</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-semibold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No loans yet. Click &quot;+ Request Loan&quot; to request one.
                    </td>
                  </tr>
                ) : (
                  loans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      <td className="p-4 text-sm text-gray-600">{loan.borrowerId.slice(0, 8)}...</td>
                      <td className="p-4 text-sm text-gray-600">
                        {Number(loan.principalXAF).toLocaleString()} XAF
                      </td>
                      <td className="p-4 text-sm text-gray-600">{loan.monthlyInterestRate}%/month</td>
                      <td className="p-4 text-sm font-medium text-orange-600">
                        {Number(loan.outstandingBalanceXAF).toLocaleString()} XAF
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(loan.disbursedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          loan.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                          loan.status === 'REPAID' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {loan.status}
                        </span>
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