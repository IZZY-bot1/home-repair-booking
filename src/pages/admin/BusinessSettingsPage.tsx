import { useEffect, useState } from 'react'
import { Save, Loader2, CheckCircle2, AlertCircle, Building2, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { BusinessSettings } from '../../lib/types'

type FormState = Omit<BusinessSettings, 'id' | 'created_at'>

const DEFAULTS: FormState = {
  business_name: '',
  business_email: '',
  business_phone: '',
  business_address: '',
  slot_interval_minutes: 30,
  booking_notice_hours: 24,
}

export default function BusinessSettingsPage() {
  const [form, setForm] = useState<FormState>(DEFAULTS)
  const [settingsId, setSettingsId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('business_settings').select('*').limit(1).maybeSingle()
      if (data) {
        setSettingsId(data.id)
        setForm({
          business_name: data.business_name || '',
          business_email: data.business_email || '',
          business_phone: data.business_phone || '',
          business_address: data.business_address || '',
          slot_interval_minutes: data.slot_interval_minutes || 30,
          booking_notice_hours: data.booking_notice_hours || 24,
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!form.business_name.trim()) { setError('Company name is required.'); return }
    setSaving(true)
    setError('')
    setSaved(false)

    const payload = {
      business_name: form.business_name.trim(),
      business_email: form.business_email.trim(),
      business_phone: form.business_phone.trim(),
      business_address: form.business_address.trim(),
      slot_interval_minutes: Number(form.slot_interval_minutes),
      booking_notice_hours: Number(form.booking_notice_hours),
    }

    let err
    if (settingsId) {
      ;({ error: err } = await supabase.from('business_settings').update(payload).eq('id', settingsId))
    } else {
      const res = await supabase.from('business_settings').insert(payload).select('id').single()
      err = res.error
      if (res.data) setSettingsId(res.data.id)
    }

    if (err) {
      setError('Failed to save settings. Please try again.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    }
    setSaving(false)
  }

  const update = (field: keyof FormState, value: string | number) => {
    setForm((f) => ({ ...f, [field]: value }))
    setError('')
    setSaved(false)
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
          <h1 className="text-2xl font-800 text-gray-900 tracking-tight">Business Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your business information and booking preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save Settings
        </button>
      </div>

      {saved && (
        <div className="mb-5 flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm font-600">
          <CheckCircle2 size={16} />
          Settings saved successfully. Changes will appear on the public website.
        </div>
      )}
      {error && (
        <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm font-600">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center flex-shrink-0">
              <Building2 size={18} style={{ color: '#1a2744' }} />
            </div>
            <div>
              <h3 className="font-700 text-gray-900 leading-tight">Business Information</h3>
              <p className="text-xs text-gray-400 mt-0.5">Your company name, contact details, and address</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-600 text-gray-700 mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                className="admin-input"
                placeholder="FixRight Home Repair"
                value={form.business_name}
                onChange={(e) => update('business_name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-600 text-gray-700 mb-1.5">Company Email</label>
              <input
                type="email"
                className="admin-input"
                placeholder="hello@yourcompany.com"
                value={form.business_email}
                onChange={(e) => update('business_email', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-600 text-gray-700 mb-1.5">Company Phone</label>
              <input
                type="tel"
                className="admin-input"
                placeholder="(555) 247-8900"
                value={form.business_phone}
                onChange={(e) => update('business_phone', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-600 text-gray-700 mb-1.5">Company Address</label>
              <textarea
                className="admin-input resize-none"
                rows={2}
                placeholder="123 Main Street, Suite 100, City, State 12345"
                value={form.business_address}
                onChange={(e) => update('business_address', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Booking Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
              <Calendar size={18} className="text-brand-500" />
            </div>
            <div>
              <h3 className="font-700 text-gray-900 leading-tight">Booking Preferences</h3>
              <p className="text-xs text-gray-400 mt-0.5">Slot intervals and advance booking rules</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-600 text-gray-700 mb-1">
                Slot Interval (minutes)
              </label>
              <p className="text-xs text-gray-400 mb-2">
                How often booking time slots are generated. E.g. 30 = slots every 30 minutes.
              </p>
              <select
                className="admin-select"
                value={form.slot_interval_minutes}
                onChange={(e) => update('slot_interval_minutes', Number(e.target.value))}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes (1 hour)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-600 text-gray-700 mb-1">
                Advance Booking Notice (hours)
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Minimum hours in advance customers must book. E.g. 24 = no same-day bookings.
              </p>
              <select
                className="admin-select"
                value={form.booking_notice_hours}
                onChange={(e) => update('booking_notice_hours', Number(e.target.value))}
              >
                <option value={2}>2 hours</option>
                <option value={4}>4 hours</option>
                <option value={8}>8 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours (1 day)</option>
                <option value={48}>48 hours (2 days)</option>
              </select>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-xl" style={{ background: '#f8f9fb', border: '1px solid #e9eaec' }}>
              <p className="text-xs font-700 text-gray-700 mb-2 uppercase tracking-wider">Booking Rules Preview</p>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                  Slots every <strong className="mx-1">{form.slot_interval_minutes} min</strong>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                  Min <strong className="mx-1">{form.booking_notice_hours}h</strong> advance notice required
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary py-3 px-8 flex items-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : 'Save All Settings'}
        </button>
      </div>
    </div>
  )
}
