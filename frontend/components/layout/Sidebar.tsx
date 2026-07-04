'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Landmark,
  AlertTriangle,
  Settings,
  LogOut,
  Bell,
  FileText,
  Activity,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { useTheme } from '@/lib/theme'

const memberLinks = [
  { href: '/dashboard/member', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contributions', label: 'Contributions', icon: CreditCard },
  { href: '/loans', label: 'Loans', icon: Landmark },
  { href: '/fines', label: 'Fines', icon: AlertTriangle },
  { href: '/notifications', label: 'Notifications', icon: Bell },
]

const adminLinks = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/admin/members', label: 'Members', icon: Users },
  { href: '/contributions', label: 'Contributions', icon: CreditCard },
  { href: '/loans', label: 'Loans', icon: Landmark },
  { href: '/fines', label: 'Fines', icon: AlertTriangle },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/agents', label: 'System Health', icon: Activity },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  const links =
    user?.role === 'GROUP_ADMIN' || user?.role === 'SUPER_ADMIN'
      ? adminLinks
      : memberLinks

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="w-64 bg-green-800 dark:bg-gray-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-green-700 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold">NjangiTrack</h1>
          <p className="text-green-300 dark:text-gray-400 text-xs mt-1">
            Community Prosperity
          </p>
        </div>
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="text-green-200 dark:text-gray-300 hover:text-white p-2 rounded-lg hover:bg-green-700 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-green-700 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user?.fullName?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">
              {user?.fullName || 'User'}
            </p>
            <p className="text-green-300 dark:text-gray-400 text-xs">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-green-600 dark:bg-gray-700 text-white'
                      : 'text-green-200 dark:text-gray-300 hover:bg-green-700 dark:hover:bg-gray-800 hover:text-white'
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
      <div className="p-4 border-t border-green-700 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-green-200 dark:text-gray-300 hover:bg-green-700 dark:hover:bg-gray-800 hover:text-white transition-colors w-full text-sm"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen">
        <SidebarContent />
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-green-800 dark:bg-gray-900 text-white px-4 py-3">
        <span className="font-bold">NjangiTrack</span>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-lg hover:bg-green-700 dark:hover:bg-gray-800"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 max-w-[85vw] shadow-xl">
            <div className="flex justify-end p-2 bg-green-800 dark:bg-gray-900">
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="text-white p-2 rounded-lg hover:bg-green-700 dark:hover:bg-gray-800"
              >
                <X size={22} />
              </button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  )
}
