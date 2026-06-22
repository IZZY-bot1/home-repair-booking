import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, Wrench, Clock, Ban, Settings, LogOut, X, PanelLeft
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface SidebarProps {
  businessName: string
  mobileOpen: boolean
  onMobileClose: () => void
}

const NAV_ITEMS = [
  { to: '/admin/overview', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/appointments', icon: CalendarDays, label: 'Appointments' },
  { to: '/admin/services', icon: Wrench, label: 'Services' },
  { to: '/admin/business-hours', icon: Clock, label: 'Business Hours' },
  { to: '/admin/blocked-dates', icon: Ban, label: 'Blocked Dates' },
  { to: '/admin/page-builder', icon: PanelLeft, label: 'Page Builder' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ businessName, mobileOpen, onMobileClose }: SidebarProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: '#1a2744' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
              <Wrench size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-700 text-sm leading-tight truncate">{businessName}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X size={18} className="text-white/60" />
          </button>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-xs font-600 uppercase tracking-wider px-3 mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Management
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-500 transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                      : 'text-white/60 hover:text-white hover:bg-white/8'
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <a
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-500 transition-all mb-1"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)')}
        >
          <Wrench size={17} />
          View Public Site
        </a>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-500 transition-all"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#f87171'
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="relative flex flex-col w-60 h-full shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
