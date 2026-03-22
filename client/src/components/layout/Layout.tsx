import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  BookOpen,
  DollarSign,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/journal', label: 'Journal', icon: BookOpen },
  { to: '/expenses', label: 'Expenses', icon: DollarSign },
  { to: '/reports', label: 'Reports', icon: BarChart2 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gw-border">
        <h1 className="font-display text-xl text-gw-parchment">Groundwork</h1>
        <p className="text-gw-amber font-mono text-xs mt-1">
          {user?.propertyName || 'My Property'}
        </p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all ${
                isActive
                  ? 'text-gw-amber border-l-2 border-gw-amber bg-gw-amber/8 pl-[10px]'
                  : 'text-gw-muted hover:text-gw-parchment'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gw-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gw-parchment text-sm font-medium">
              {user?.fullName}
            </p>
            <p className="text-gw-muted text-xs font-mono">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gw-muted hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gw-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 bg-gw-black border-r border-gw-border flex-col fixed h-full z-10">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-60 bg-gw-black border-r border-gw-border">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-60 min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gw-border bg-gw-black">
          <button onClick={() => setMobileOpen(true)}>
            <Menu size={20} className="text-gw-parchment" />
          </button>
          <h1 className="font-display text-lg text-gw-parchment">Groundwork</h1>
          <div className="w-5" />
        </div>

        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}