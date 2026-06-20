import { useEffect, useState } from 'react'
import { Loader2, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { BusinessHours } from '../../lib/types'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function BusinessHoursPage() {
  const [hours, setHours] = useState<BusinessHours[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('business_hours').select('*').order('weekday')
      if (data && data.length > 0) {
        setHours(data as BusinessHours[])
      } else {
        // Default hours if none exist
        setHours(
          DAYS.map((_, i) => ({
            id: `tmp-${i}`,
            weekday: i,
            is_open: i >= 1 && i <= 5,
            start_time: i === 6 ? '09:00:00' : '08:00:00',
            end_time: i === 6 ? '16:00:00' : '18:00:00',
          }))
        )
      }
      setLoading(false)
    }
    load()
  }, [])

  const updateHour = (weekday: number, field: keyof BusinessHours, value: boolean | string) => {
    setHours((prev) => prev.map((h) => h.weekday === weekday ? { ...h, [field]: value } : h))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)

    for (const h of hours) {
      const payload = {
        weekday: h.weekday,
        is_open: h.is_open,
        start_time: h.start_time,
        end_time: h.end_time,
      }

      if (h.id.startsWith('tmp-')) {
        const { error } = await supabase.from('business_hours').insert(payload)
        if (error) { setError('Failed to save. Please try again.'); setSaving(false); return }
      } else {
        const { error } = await supabase.from('business_hours').update(payload).eq('id', h.id)
        if (error) { setError('Failed to save. Please try again.'); setSaving(false); return }
      }
    }

    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-brand-500" size={28} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-800 text-gray-900 tracking-tight">Business Hours</h1>
          <p className="text-sm text-gray-500 mt-0.5">Set your operating hours for each day</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save Hours
        </button>
      </div>

      {saved && (
        <div className="mb-5 flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm font-600">
          <CheckCircle2 size={16} />
          Business hours saved successfully.
        </div>
      )}
      {error && (
        <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm font-600">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100" style={{ background: '#f8f9fb' }}>
          <div className="grid grid-cols-4 gap-4 text-xs font-700 text-gray-500 uppercase tracking-wider">
            <div>Day</div>
            <div>Open / Closed</div>
            <div>Opening Time</div>
            <div>Closing Time</div>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {hours.map((h) => (
            <div key={h.weekday} className="px-6 py-4 hover:bg-gray-50/40 transition-colors">
              <div className="grid grid-cols-4 gap-4 items-center">
                {/* Day name */}
                <div>
                  <span className="font-700 text-gray-900 text-sm">{DAYS[h.weekday]}</span>
                  <span className="ml-2 text-xs text-gray-400">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][h.weekday]}
                  </span>
                </div>

                {/* Toggle */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => updateHour(h.weekday, 'is_open', !h.is_open)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      h.is_open ? 'bg-brand-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        h.is_open ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-600 ${h.is_open ? 'text-green-700' : 'text-gray-400'}`}>
                    {h.is_open ? 'Open' : 'Closed'}
                  </span>
                </div>

                {/* Start time */}
                <div>
                  <input
                    type="time"
                    className="admin-input py-2 text-sm"
                    value={h.start_time.substring(0, 5)}
                    disabled={!h.is_open}
                    onChange={(e) => updateHour(h.weekday, 'start_time', e.target.value + ':00')}
                    style={{ opacity: h.is_open ? 1 : 0.4, cursor: h.is_open ? 'text' : 'not-allowed' }}
                  />
                </div>

                {/* End time */}
                <div>
                  <input
                    type="time"
                    className="admin-input py-2 text-sm"
                    value={h.end_time.substring(0, 5)}
                    disabled={!h.is_open}
                    onChange={(e) => updateHour(h.weekday, 'end_time', e.target.value + ':00')}
                    style={{ opacity: h.is_open ? 1 : 0.4, cursor: h.is_open ? 'text' : 'not-allowed' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Changes to business hours will affect available appointment slots for future bookings.
      </p>
    </div>
  )
}
