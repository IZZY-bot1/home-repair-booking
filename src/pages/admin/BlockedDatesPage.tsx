import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Plus, Trash2, Loader2, Ban, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { BlockedDate } from '../../lib/types'

export default function BlockedDatesPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [form, setForm] = useState({ date: '', reason: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    const { data } = await supabase
      .from('blocked_dates')
      .select('*')
      .order('blocked_date', { ascending: true })
    setBlockedDates((data || []) as BlockedDate[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!form.date) { setError('Please select a date to block.'); return }
    const exists = blockedDates.some((bd) => bd.blocked_date === form.date)
    if (exists) { setError('This date is already blocked.'); return }

    setAdding(true)
    setError('')
    const { error: err } = await supabase.from('blocked_dates').insert({
      blocked_date: form.date,
      reason: form.reason.trim() || null,
    })
    if (err) {
      setError('Failed to add blocked date.')
    } else {
      setForm({ date: '', reason: '' })
      setSuccess('Date blocked successfully.')
      setTimeout(() => setSuccess(''), 3000)
      await load()
    }
    setAdding(false)
  }

  const handleRemove = async (id: string) => {
    setRemoving(id)
    await supabase.from('blocked_dates').delete().eq('id', id)
    setBlockedDates((prev) => prev.filter((bd) => bd.id !== id))
    setRemoving(null)
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-800 text-gray-900 tracking-tight">Blocked Dates</h1>
        <p className="text-sm text-gray-500 mt-0.5">Block specific dates to prevent customer bookings</p>
      </div>

      {success && (
        <div className="mb-4 flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm font-600">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {/* Add form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h3 className="font-700 text-gray-900 mb-4">Block a Date</h3>
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="flex-shrink-0">
            <label className="block text-xs font-600 text-gray-600 mb-1.5">Date *</label>
            <input
              type="date"
              min={today}
              value={form.date}
              onChange={(e) => { setForm((f) => ({ ...f, date: e.target.value })); setError('') }}
              className="admin-input py-2"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-600 text-gray-600 mb-1.5">Reason (optional)</label>
            <input
              type="text"
              placeholder="e.g. Company holiday, Staff training…"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              className="admin-input py-2"
            />
          </div>
          <div className="flex-shrink-0 self-end">
            <button
              onClick={handleAdd}
              disabled={adding || !form.date}
              className="btn-primary text-sm py-2 px-5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {adding ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Block Date
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
      </div>

      {/* Blocked dates list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{ background: '#f8f9fb' }}>
          <h3 className="font-700 text-gray-900">Blocked Dates</h3>
          <span className="text-sm text-gray-500">{blockedDates.length} dates blocked</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-brand-500" size={24} />
          </div>
        ) : blockedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Ban size={32} className="text-gray-200 mb-3" />
            <p className="font-600 text-gray-400">No dates blocked</p>
            <p className="text-sm text-gray-400 mt-0.5">Block dates above to prevent bookings</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {blockedDates.map((bd) => {
              const isPast = bd.blocked_date < today
              return (
                <div
                  key={bd.id}
                  className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50/40 transition-colors ${isPast ? 'opacity-50' : ''}`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fee2e2' }}>
                    <Ban size={16} style={{ color: '#ef4444' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-700 text-gray-900 text-sm">
                      {format(parseISO(bd.blocked_date), 'EEEE, MMMM d, yyyy')}
                      {isPast && <span className="ml-2 text-xs text-gray-400 font-500">(past)</span>}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {bd.reason || <span className="italic">No reason provided</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(bd.id)}
                    disabled={removing === bd.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {removing === bd.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
