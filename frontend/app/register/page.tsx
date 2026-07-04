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
    role: 'MEMBER' as 'MEMBER' | 'TREASURER' | 'GROUP_ADMIN',
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
        role: formData.role,
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-md p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-100">NjangiTrack</span>
          </div>
          <button
            onClick={() => setLanguage(language === 'EN' ? 'FR' : 'EN')}
            className="text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-full px-3 py-1"
          >
            🌐 {language === 'EN' ? 'FR/EN' : 'EN/FR'}
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {language === 'EN' ? 'Create Account' : 'Créer un compte'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
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
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              FULL NAME / NOM COMPLET
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              EMAIL
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
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
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              QUARTIER / NEIGHBORHOOD
            </label>
            <input
              type="text"
              placeholder="Bonamoussadi, Makepe..."
              value={formData.quartier}
              onChange={(e) =>
                setFormData({ ...formData, quartier: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              {language === 'EN' ? 'I AM JOINING AS / ROLE' : 'JE REJOINS EN TANT QUE'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  value: 'MEMBER' as const,
                  label: language === 'EN' ? 'Member' : 'Membre',
                  hint: language === 'EN' ? 'Contribute & vote' : 'Cotiser & voter',
                },
                {
                  value: 'TREASURER' as const,
                  label: language === 'EN' ? 'Treasurer' : 'Trésorier(ère)',
                  hint: language === 'EN' ? 'Verify payments' : 'Vérifier les paiements',
                },
                {
                  value: 'GROUP_ADMIN' as const,
                  label: language === 'EN' ? 'Group Admin' : 'Admin de groupe',
                  hint: language === 'EN' ? 'Create & manage group' : 'Créer & gérer le groupe',
                },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r.value })}
                  className={`text-left px-3 py-3 rounded-lg text-xs border-2 transition-colors ${
                    formData.role === r.value
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <span className="block font-semibold">{r.label}</span>
                  <span className="block text-[11px] opacity-75">{r.hint}</span>
                </button>
              ))}
            </div>
            {formData.role === 'GROUP_ADMIN' && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                {language === 'EN'
                  ? "You'll be able to create your Njangi group right after signing in."
                  : 'Vous pourrez créer votre groupe Njangi juste après connexion.'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              PASSWORD / MOT DE PASSE
            </label>
            <input
              type="password"
              placeholder="Min. 8 characters"
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
            {loading
              ? 'Creating...'
              : language === 'EN'
              ? "Sign Up / S'inscrire"
              : "S'inscrire"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
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