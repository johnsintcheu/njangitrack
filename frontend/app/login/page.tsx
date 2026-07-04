'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { identityApi } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [language, setLanguage] = useState<'EN' | 'FR'>('EN')
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await identityApi.post('/auth/login', {
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      })

      const { token, user } = response.data

      setUser(
        {
          id: user.id,
          fullName: user.fullName,
          email: user.email || '',
          phoneNumber: user.phoneNumber,
          role: user.role,
          language: 'EN',
          kycStatus: 'PENDING',
          createdAt: new Date().toISOString(),
        },
        token,
      )

      localStorage.setItem('njangi_token', token)

      if (user.role === 'GROUP_ADMIN' || user.role === 'SUPER_ADMIN') {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard/member')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Invalid phone number or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-md p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-100">NjangiTrack</span>
          </div>
          <button
            onClick={() => setLanguage(language === 'EN' ? 'FR' : 'EN')}
            className="text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-full px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            🌐 {language === 'EN' ? 'FR/EN' : 'EN/FR'}
          </button>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {language === 'EN' ? 'Welcome Back' : 'Bon Retour'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {language === 'EN'
              ? 'Manage your community savings with confidence.'
              : 'Gérez vos tontines en toute confiance.'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 tracking-wider">
              PHONE NUMBER / TÉLÉPHONE
            </label>
            <div className="flex border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden focus-within:border-green-500">
              <span className="bg-gray-50 dark:bg-gray-800 px-3 py-3 text-gray-600 dark:text-gray-300 text-sm border-r border-gray-300 dark:border-gray-700">
                +237
              </span>
              <input
                type="tel"
                placeholder="6XX XXX XXX"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="flex-1 px-3 py-3 text-sm outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 tracking-wider">
              PASSWORD / MOT DE PASSE
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : language === 'EN' ? 'Login →' : 'Connexion →'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          {language === 'EN' ? 'New to NjangiTrack?' : 'Nouveau sur NjangiTrack?'}{' '}
          <Link href="/register" className="text-green-600 font-semibold hover:underline">
            {language === 'EN' ? 'Create Account' : 'Créer un compte'}
          </Link>
        </p>
      </div>
    </div>
  )
}