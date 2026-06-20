import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader2, AlertCircle, Wrench, Eye, EyeOff } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import AdminLayout from '../components/admin/AdminLayout'
import Overview from './admin/Overview'
import Appointments from './admin/Appointments'
import ServicesPage from './admin/ServicesPage'
import BusinessHoursPage from './admin/BusinessHoursPage'
import BlockedDatesPage from './admin/BlockedDatesPage'
import BusinessSettingsPage from './admin/BusinessSettingsPage'

type AuthState = 'loading' | 'unauthenticated' | 'unauthorized' | 'authorized'

export default function AdminDashboard() {
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [businessName, setBusinessName] = useState('Home Repair Pro')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const checkAdminAccess = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (data) {
        // Load business name
        const { data: settingsData } = await supabase
          .from('business_settings')
          .select('business_name')
          .limit(1)
          .maybeSingle()
        if (settingsData?.business_name) setBusinessName(settingsData.business_name)
        setAuthState('authorized')
      } else {
        setAuthState('unauthorized')
      }
    } catch {
      setAuthState('unauthorized')
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthState('unauthenticated')
      return
    }

    let mounted = true

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        if (session?.user) {
          await checkAdminAccess(session.user.id)
        } else {
          setAuthState('unauthenticated')
        }
      } catch {
        if (mounted) setAuthState('unauthenticated')
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      if (event === 'SIGNED_IN' && session?.user) {
        setAuthState('loading')
        await checkAdminAccess(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setAuthState('unauthenticated')
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Session still valid, ensure we're still authorized
        if (authState === 'authorized') {
          // Already authorized, no need to recheck
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter your email and password.')
      return
    }
    setLoginLoading(true)
    setLoginError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    })

    if (error) {
      setLoginError(error.message === 'Invalid login credentials'
        ? 'Invalid email or password. Please try again.'
        : error.message)
      setLoginLoading(false)
    }
    // On success, onAuthStateChange fires → checkAdminAccess → updates state
  }

  // Loading state
  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#f8f9fb' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-navy-800 flex items-center justify-center">
            <Wrench size={22} className="text-brand-500" />
          </div>
          <Loader2 className="animate-spin text-brand-500" size={24} />
          <p className="text-sm text-gray-500">Verifying access…</p>
        </div>
      </div>
    )
  }

  // Unauthorized
  if (authState === 'unauthorized') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#f8f9fb' }}>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={26} className="text-red-500" />
          </div>
          <h2 className="text-xl font-800 text-gray-900 mb-2">Not Authorized</h2>
          <p className="text-sm text-gray-500 mb-6">
            You are signed in, but you are not authorized as an admin. Contact the business owner to request access.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="btn-outline w-full justify-center"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  // Login form
  if (authState === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#f8f9fb' }}>
        {!isSupabaseConfigured && (
          <div style={{
            background: '#1a2744', color: 'white', padding: '12px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            fontSize: '14px', fontWeight: 500, flexShrink: 0,
          }}>
            <span style={{ color: '#e8621a', fontWeight: 700 }}>⚙ Setup Required:</span>
            Add your Supabase credentials to{' '}
            <code style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '4px' }}>.env.local</code>
            and restart the dev server.
          </div>
        )}
      <div className="flex flex-1" style={{ background: '#f8f9fb' }}>
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10" style={{ background: '#1a2744' }}>
          <div>
            <div className="flex items-center gap-2.5 mb-14">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
                <Wrench size={17} className="text-white" />
              </div>
              <span className="text-white font-700 text-base">{businessName}</span>
            </div>
            <h1 className="text-3xl font-800 text-white leading-tight mb-4">
              Admin Dashboard
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Manage your appointments, services, business hours, and settings from one organized place.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Appointments', desc: 'View & manage' },
              { label: 'Services', desc: 'Add & edit' },
              { label: 'Business Hours', desc: 'Set availability' },
              { label: 'Settings', desc: 'Configure' },
            ].map(({ label, desc }) => (
              <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <p className="text-white font-600 text-xs">{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Login form */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-xl bg-navy-800 flex items-center justify-center">
                <Wrench size={17} className="text-brand-500" />
              </div>
              <span className="text-navy-800 font-700 text-base">{businessName}</span>
            </div>

            <h2 className="text-2xl font-800 text-gray-900 mb-1 tracking-tight">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-8">Sign in to access your admin dashboard</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-600 text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  className="admin-input"
                  placeholder="admin@yourcompany.com"
                  value={loginEmail}
                  onChange={(e) => { setLoginEmail(e.target.value); setLoginError('') }}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-600 text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="admin-input pr-10"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); setLoginError('') }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="btn-primary w-full justify-center py-3 mt-2"
              >
                {loginLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
            </form>

            <p className="text-xs text-center text-gray-400 mt-8">
              Admin access only. Not a customer?{' '}
              <a href="/" className="text-brand-500 hover:text-brand-600 font-600">
                Book a repair →
              </a>
            </p>
          </div>
        </div>
      </div>
      </div>
    )
  }

  // Authorized — show dashboard
  return (
    <Routes>
      <Route element={<AdminLayout businessName={businessName} />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="business-hours" element={<BusinessHoursPage />} />
        <Route path="blocked-dates" element={<BlockedDatesPage />} />
        <Route path="settings" element={<BusinessSettingsPage />} />
      </Route>
    </Routes>
  )
}
