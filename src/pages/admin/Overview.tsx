import { useEffect, useState } from 'react'
import { CalendarDays, Clock, CheckCircle2, XCircle, Wrench, TrendingUp, Loader2 } from 'lucide-react'
import { format, isToday, parseISO, isFuture } from 'date-fns'
import { supabase } from '../../lib/supabase'
import type { AppointmentWithService, Service } from '../../lib/types'

interface Stats {
  pending: number
  confirmed: number
  completed: number
  cancelled: number
  totalServices: number
  todayCount: number
}

export default function Overview() {
  const [stats, setStats] = useState<Stats>({ pending: 0, confirmed: 0, completed: 0, cancelled: 0, totalServices: 0, todayCount: 0 })
  const [upcoming, setUpcoming] = useState<AppointmentWithService[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [apptRes, svcRes] = await Promise.all([
        supabase.from('appointments').select('*, services(name)').order('appointment_date', { ascending: false }),
        supabase.from('services').select('id').eq('is_active', true),
      ])

      const appts = (apptRes.data || []) as AppointmentWithService[]
      const services = (svcRes.data || []) as Service[]

      const today = appts.filter((a) => isToday(parseISO(a.appointment_date)))
      const up = appts
        .filter((a) => isFuture(parseISO(a.appointment_date)) && a.status !== 'cancelled')
        .slice(0, 6)

      setStats({
        pending: appts.filter((a) => a.status === 'pending').length,
        confirmed: appts.filter((a) => a.status === 'confirmed').length,
        completed: appts.filter((a) => a.status === 'completed').length,
        cancelled: appts.filter((a) => a.status === 'cancelled').length,
        totalServices: services.length,
        todayCount: today.length,
      })
      setUpcoming(up)
      setLoading(false)
    }
    load()
  }, [])

  const METRIC_CARDS = [
    { label: 'Pending', value: stats.pending, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Confirmed', value: stats.confirmed, icon: CalendarDays, color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: '#10b981', bg: '#d1fae5' },
    { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: '#ef4444', bg: '#fee2e2' },
    { label: "Today's Appointments", value: stats.todayCount, icon: TrendingUp, color: '#e8621a', bg: '#fff4ee' },
    { label: 'Active Services', value: stats.totalServices, icon: Wrench, color: '#8b5cf6', bg: '#ede9fe' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-brand-500" size={28} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-800 text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {METRIC_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-600 text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-3xl font-800 text-gray-900">{value}</p>
              </div>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}
              >
                <Icon size={20} style={{ color }} />
              </div>
            </div>
            <div className="h-1 rounded-full" style={{ background: bg }}>
              <div className="h-full rounded-full" style={{ background: color, width: '60%' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming appointments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-700 text-gray-900">Upcoming Appointments</h2>
          <a href="/admin/appointments" className="text-sm text-brand-500 font-600 hover:text-brand-600 transition-colors">
            View all →
          </a>
        </div>

        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14">
            <CalendarDays size={36} className="text-gray-200 mb-3" />
            <p className="font-600 text-gray-400">No upcoming appointments</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {upcoming.map((appt) => (
              <div key={appt.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/60 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center flex-shrink-0">
                  <CalendarDays size={16} style={{ color: '#1a2744' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-700 text-gray-900 text-sm truncate">{appt.full_name}</p>
                    <span className={`badge ${
                      appt.status === 'pending' ? 'badge-pending' :
                      appt.status === 'confirmed' ? 'badge-confirmed' :
                      appt.status === 'completed' ? 'badge-completed' : 'badge-cancelled'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {appt.services?.name} · {format(parseISO(appt.appointment_date), 'MMM d, yyyy')} at {appt.start_time.substring(0, 5)}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-400">{appt.phone}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
