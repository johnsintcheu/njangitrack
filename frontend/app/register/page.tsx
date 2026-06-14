'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { identityApi } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<'EN' | 'FR'>('EN')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    quartier: '',
    language: 'EN',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await identityApi.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        quartier: formData.quartier,
        language: language,
      })

      setSuccess('Account created successfully! Redirecting to login...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-gray-800">NjangiTrack</span>
          </div>
          <button
            onClick={() => setLanguage(language === 'EN' ? 'FR' : 'EN')}
            className="text-sm text-gray-600 border border-gray-300 rounded-full px-3 py-1"
          >
            🌐 {language === 'EN' ? 'FR/EN' : 'EN/FR'}
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {language === 'EN' ? 'Create Account' : 'Créer un compte'}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {language === 'EN'
            ? 'Join your local Njangi community'
            : 'Rejoignez votre communauté Njangi'}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg p-3 mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              FULL NAME / NOM COMPLET
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              EMAIL
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              PHONE NUMBER / TÉLÉPHONE
            </label>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:border-green-500">
              <span className="bg-gray-50 px-3 py-3 text-gray-600 text-sm border-r border-gray-300">
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
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              QUARTIER / NEIGHBORHOOD
            </label>
            <input
              type="text"
              placeholder="Bonamoussadi, Makepe..."
              value={formData.quartier}
              onChange={(e) =>
                setFormData({ ...formData, quartier: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              PASSWORD / MOT DE PASSE
            </label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors disabled:opacity-50"
          >
            {loading
              ? 'Creating...'
              : language === 'EN'
              ? "Sign Up / S'inscrire"
              : "S'inscrire"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {language === 'EN'
            ? 'Already have an account?'
            : 'Vous avez déjà un compte?'}{' '}
          <Link
            href="/login"
            className="text-green-600 font-semibold hover:underline"
          >
            {language === 'EN' ? 'Login' : 'Connexion'}
          </Link>
        </p>
      </div>
    </div>
  )
}