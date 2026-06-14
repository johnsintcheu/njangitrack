'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Landmark,
  AlertTriangle,
  Settings,
  LogOut,
  Bell
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'

const memberLinks = [
  { href: '/dashboard/member', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contributions', label: 'Contributions', icon: CreditCard },
  { href: '/loans', label: 'Loans', icon: Landmark },
  { href: '/fines', label: 'Fines', icon: AlertTriangle },
]

const adminLinks = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/admin/members', label: 'Members', icon: Users },
  { href: '/contributions', label: 'Contributions', icon: CreditCard },
  { href: '/loans', label: 'Loans', icon: Landmark },
  { href: '/fines', label: 'Fines', icon: AlertTriangle },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const links = user?.role === 'GROUP_ADMIN' ||
    user?.role === 'SUPER_ADMIN' ? adminLinks : memberLinks

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="w-64 bg-green-800 min-h-screen flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-green-700">
        <h1 className="text-white text-xl font-bold">NjangiTrack</h1>
        <p className="text-green-300 text-xs mt-1">Community Prosperity</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-green-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user?.fullName?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">
              {user?.fullName || 'User'}
            </p>
            <p className="text-green-300 text-xs">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-green-600 text-white'
                      : 'text-green-200 hover:bg-green-700 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-green-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-green-200 hover:bg-green-700 hover:text-white transition-colors w-full text-sm"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}