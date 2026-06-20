import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import Sidebar from './Sidebar'

interface AdminLayoutProps {
  businessName: string
}

export default function AdminLayout({ businessName }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8f9fb' }}>
      <Sidebar
        businessName={businessName}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b"
          style={{ borderColor: '#e9eaec' }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          <div className="hidden lg:block">
            <p className="text-sm font-600 text-gray-900">{businessName}</p>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center">
              <span className="text-white text-xs font-700">A</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
