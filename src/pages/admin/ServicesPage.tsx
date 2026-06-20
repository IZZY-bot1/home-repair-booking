import { useEffect, useState } from 'react'
import {
  Plus, Pencil, Loader2, X, DollarSign, Clock, CheckCircle2,
  XCircle, Save, AlertCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Service } from '../../lib/types'

interface ServiceForm {
  name: string
  description: string
  duration_minutes: string
  price: string
  is_active: boolean
}

const EMPTY_FORM: ServiceForm = {
  name: '',
  description: '',
  duration_minutes: '60',
  price: '',
  is_active: true,
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('services').select('*').order('created_at', { ascending: true })
    setServices((data || []) as Service[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setSaveError('')
    setShowModal(true)
  }

  const openEdit = (svc: Service) => {
    setEditingId(svc.id)
    setForm({
      name: svc.name,
      description: svc.description || '',
      duration_minutes: String(svc.duration_minutes),
      price: String(svc.price),
      is_active: svc.is_active,
    })
    setSaveError('')
    setShowModal(true)
  }

  const validateForm = () => {
    if (!form.name.trim()) return 'Service name is required'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) return 'Enter a valid price'
    if (!form.duration_minutes || isNaN(Number(form.duration_minutes)) || Number(form.duration_minutes) < 1) return 'Enter a valid duration in minutes'
    return null
  }

  const handleSave = async () => {
    const err = validateForm()
    if (err) { setSaveError(err); return }
    setSaving(true)
    setSaveError('')

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      duration_minutes: Number(form.duration_minutes),
      price: Number(form.price),
      is_active: form.is_active,
    }

    let error
    if (editingId) {
      ;({ error } = await supabase.from('services').update(payload).eq('id', editingId))
    } else {
      ;({ error } = await supabase.from('services').insert(payload))
    }

    if (error) {
      setSaveError('Failed to save service. Please try again.')
    } else {
      setShowModal(false)
      await load()
    }
    setSaving(false)
  }

  const toggleActive = async (svc: Service) => {
    setToggling(svc.id)
    await supabase.from('services').update({ is_active: !svc.is_active }).eq('id', svc.id)
    setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, is_active: !s.is_active } : s))
    setToggling(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-800 text-gray-900 tracking-tight">Services</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your offered repair services</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {/* Services table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-500" size={28} />
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <Plus size={24} className="text-gray-300" />
            </div>
            <p className="font-600 text-gray-400">No services yet</p>
            <button onClick={openAdd} className="mt-3 text-sm text-brand-500 font-600 hover:text-brand-600">
              Add your first service
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#f8f9fb' }}>
                  {['Service', 'Description', 'Duration', 'Price', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-700 text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {services.map((svc) => (
                  <tr key={svc.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-700 text-gray-900 text-sm">{svc.name}</p>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-sm text-gray-500 line-clamp-2">{svc.description || '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Clock size={13} className="text-gray-400" />
                        {svc.duration_minutes >= 60
                          ? `${Math.floor(svc.duration_minutes / 60)}h${svc.duration_minutes % 60 ? ` ${svc.duration_minutes % 60}m` : ''}`
                          : `${svc.duration_minutes}m`}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-sm font-700 text-gray-900">
                        <DollarSign size={13} />
                        {Number(svc.price).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${svc.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {svc.is_active ? (
                          <><CheckCircle2 size={11} /> Active</>
                        ) : (
                          <><XCircle size={11} /> Inactive</>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(svc)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-600 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => toggleActive(svc)}
                          disabled={toggling === svc.id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-600 transition-colors ${
                            svc.is_active
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-green-200 text-green-700 hover:bg-green-50'
                          }`}
                        >
                          {toggling === svc.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : svc.is_active ? (
                            <><XCircle size={12} /> Deactivate</>
                          ) : (
                            <><CheckCircle2 size={12} /> Activate</>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="font-800 text-gray-900">{editingId ? 'Edit Service' : 'Add New Service'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-600 text-gray-700 mb-1.5">Service Name *</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Plumbing Repair"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-600 text-gray-700 mb-1.5">Description</label>
                <textarea
                  className="admin-input resize-none"
                  rows={3}
                  placeholder="Describe what this service includes…"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-600 text-gray-700 mb-1.5">Duration (minutes) *</label>
                  <input
                    type="number"
                    className="admin-input"
                    placeholder="60"
                    min={1}
                    value={form.duration_minutes}
                    onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-600 text-gray-700 mb-1.5">Starting Price ($) *</label>
                  <input
                    type="number"
                    className="admin-input"
                    placeholder="75.00"
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    form.is_active ? 'bg-brand-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.is_active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div>
                  <p className="text-sm font-600 text-gray-800">
                    {form.is_active ? 'Active — visible on booking page' : 'Inactive — hidden from customers'}
                  </p>
                </div>
              </div>

              {saveError && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle size={15} />
                  {saveError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="btn-outline py-2 px-5 text-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2 px-6">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {editingId ? 'Save Changes' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
