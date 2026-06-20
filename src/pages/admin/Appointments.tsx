import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Loader2, ChevronDown, Search, CalendarDays, Phone, Mail, FileText, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { AppointmentWithService } from '../../lib/types'

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'] as const
type AppointmentStatus = typeof STATUS_OPTIONS[number]

export default function Appointments() {
  const [appointments, setAppointments] = useState<AppointmentWithService[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('appointments')
      .select('*, services(name)')
      .order('appointment_date', { ascending: false })
    setAppointments((data || []) as AppointmentWithService[])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    setUpdating(id)
    setOpenDropdown(null)
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (!error) {
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a))
    }
    setUpdating(null)
  }

  const filtered = appointments.filter((a) => {
    if (filter !== 'all' && a.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        a.full_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone.includes(q) ||
        (a.services?.name || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const STATUS_COUNTS = {
    all: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  }

  const statusColor = (s: string) => {
    if (s === 'pending') return { bg: '#fef3c7', text: '#92400e' }
    if (s === 'confirmed') return { bg: '#dbeafe', text: '#1e40af' }
    if (s === 'completed') return { bg: '#d1fae5', text: '#065f46' }
    return { bg: '#fee2e2', text: '#991b1b' }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-800 text-gray-900 tracking-tight">Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">{appointments.length} total appointments</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-600 text-gray-700 hover:bg-gray-50 transition-colors">
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-600 transition-all border ${
              filter === s
                ? 'bg-navy-800 text-white border-navy-800 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-navy-800 hover:text-navy-800'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}{' '}
            <span className={`text-xs ml-1 ${filter === s ? 'text-white/70' : 'text-gray-400'}`}>
              ({STATUS_COUNTS[s]})
            </span>
          </button>
        ))}

        {/* Search */}
        <div className="ml-auto flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 min-w-[200px]">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search appointments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm outline-none bg-transparent flex-1 placeholder-gray-400 text-gray-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-500" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <CalendarDays size={36} className="text-gray-200 mb-3" />
            <p className="font-600 text-gray-400">No appointments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#f8f9fb' }}>
                  {['Customer', 'Service', 'Date & Time', 'Contact', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-700 text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((appt) => {
                  const sc = statusColor(appt.status)
                  return (
                    <tr key={appt.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="font-700 text-gray-900 text-sm">{appt.full_name}</p>
                        {appt.notes && (
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <FileText size={11} />
                            Has notes
                          </p>
                        )}
                      </td>

                      {/* Service */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-500 text-gray-700">{appt.services?.name || '—'}</p>
                      </td>

                      {/* Date & Time */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <CalendarDays size={13} className="text-gray-400" />
                          {format(parseISO(appt.appointment_date), 'MMM d, yyyy')}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {appt.start_time.substring(0, 5)} – {appt.end_time.substring(0, 5)}
                        </p>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                          <Phone size={11} />
                          {appt.phone}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Mail size={11} />
                          <span className="truncate max-w-[160px]">{appt.email}</span>
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-700"
                          style={{ background: sc.bg, color: sc.text }}
                        >
                          {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                        </span>
                      </td>

                      {/* Status action */}
                      <td className="px-5 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === appt.id ? null : appt.id)}
                            disabled={updating === appt.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-600 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            {updating === appt.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <>
                                Update Status
                                <ChevronDown size={12} />
                              </>
                            )}
                          </button>

                          {openDropdown === appt.id && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                              {STATUS_OPTIONS.map((s) => {
                                const c = statusColor(s)
                                return (
                                  <button
                                    key={s}
                                    onClick={() => updateStatus(appt.id, s)}
                                    className="w-full px-3 py-2 text-xs font-600 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    style={{ color: s === appt.status ? '#9ca3af' : c.text }}
                                  >
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.text }} />
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                    {s === appt.status && ' ✓'}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Close dropdown on outside click */}
      {openDropdown && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
      )}
    </div>
  )
}
