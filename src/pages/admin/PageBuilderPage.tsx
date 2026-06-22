import { useEffect, useState } from 'react'
import {
  Save, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff,
  ChevronUp, ChevronDown, Layout, Star, Info, Calendar, FileText
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { PageContent } from '../../lib/types'

const SECTION_META: Record<string, { label: string; icon: typeof Layout; fields: Field[] }> = {
  hero: {
    label: 'Hero Section',
    icon: Star,
    fields: [
      { key: 'badge_text', label: 'Badge Text', type: 'text', placeholder: 'Trusted Home Repair Specialists' },
      { key: 'title', label: 'Main Headline', type: 'text', placeholder: 'Your Home, Expertly Repaired & Maintained' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Professional repair technicians to your door...' },
      { key: 'cta_primary', label: 'Primary Button Text', type: 'text', placeholder: 'Book Your Repair' },
      { key: 'cta_secondary', label: 'Secondary Button Text', type: 'text', placeholder: 'View Services' },
      { key: 'stat1_value', label: 'Stat 1 Value', type: 'text', placeholder: '10+ Years' },
      { key: 'stat1_label', label: 'Stat 1 Label', type: 'text', placeholder: 'Experience' },
      { key: 'stat2_value', label: 'Stat 2 Value', type: 'text', placeholder: '4.9 / 5' },
      { key: 'stat2_label', label: 'Stat 2 Label', type: 'text', placeholder: 'Client Rating' },
      { key: 'stat3_value', label: 'Stat 3 Value', type: 'text', placeholder: 'Same-Day' },
      { key: 'stat3_label', label: 'Stat 3 Label', type: 'text', placeholder: 'Availability' },
    ],
  },
  services: {
    label: 'Services Section',
    icon: Layout,
    fields: [
      { key: 'badge_text', label: 'Badge Text', type: 'text', placeholder: 'What We Fix' },
      { key: 'title', label: 'Section Title', type: 'text', placeholder: 'Professional Home Repair Services' },
      { key: 'subtitle', label: 'Section Subtitle', type: 'textarea', placeholder: 'From quick fixes to complex repairs...' },
    ],
  },
  about: {
    label: 'About Section',
    icon: Info,
    fields: [
      { key: 'badge_text', label: 'Badge Text', type: 'text', placeholder: 'Why Choose Us' },
      { key: 'title', label: 'Section Title', type: 'text', placeholder: 'Repair Done Right, Every Time' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'We built our reputation...' },
      { key: 'features', label: 'Feature List (one per line)', type: 'textarea', placeholder: 'Licensed technicians\nUpfront pricing...' },
      { key: 'stat1_value', label: 'Stat 1 Value', type: 'text', placeholder: '2,400+' },
      { key: 'stat1_label', label: 'Stat 1 Label', type: 'text', placeholder: 'Homeowners Served' },
      { key: 'stat2_value', label: 'Stat 2 Value', type: 'text', placeholder: '10+' },
      { key: 'stat2_label', label: 'Stat 2 Label', type: 'text', placeholder: 'Years in Business' },
      { key: 'stat3_value', label: 'Stat 3 Value', type: 'text', placeholder: '98%' },
      { key: 'stat3_label', label: 'Stat 3 Label', type: 'text', placeholder: 'Satisfaction Rate' },
      { key: 'cta_text', label: 'CTA Button Text', type: 'text', placeholder: 'Schedule Your Service' },
    ],
  },
  booking: {
    label: 'Booking Section',
    icon: Calendar,
    fields: [
      { key: 'title', label: 'Section Title', type: 'text', placeholder: 'Book Your Repair' },
      { key: 'subtitle', label: 'Section Subtitle', type: 'textarea', placeholder: 'Schedule your home repair service in minutes...' },
    ],
  },
  footer: {
    label: 'Footer',
    icon: FileText,
    fields: [
      { key: 'tagline', label: 'Tagline / Description', type: 'textarea', placeholder: 'Reliable, professional home repair...' },
      { key: 'cta_headline', label: 'CTA Strip Headline', type: 'text', placeholder: 'Need a repair? We\'re just a booking away.' },
      { key: 'cta_button', label: 'CTA Strip Button Text', type: 'text', placeholder: 'Schedule Now' },
    ],
  },
}

interface Field {
  key: string
  label: string
  type: 'text' | 'textarea'
  placeholder: string
}

export default function PageBuilderPage() {
  const [sections, setSections] = useState<PageContent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKey, setSelectedKey] = useState<string>('hero')
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('page_content')
        .select('*')
        .order('sort_order')
      if (data) {
        setSections(data as PageContent[])
        const d: Record<string, Record<string, string>> = {}
        data.forEach((s: PageContent) => { d[s.section_key] = { ...s.content } })
        setDrafts(d)
      }
      setLoading(false)
    }
    load()
  }, [])

  const selectedSection = sections.find(s => s.section_key === selectedKey)
  const meta = SECTION_META[selectedKey]

  const updateField = (key: string, value: string) => {
    setDrafts(prev => ({
      ...prev,
      [selectedKey]: { ...prev[selectedKey], [key]: value },
    }))
    setSaved(false)
    setError('')
  }

  const toggleVisibility = async (sectionKey: string) => {
    const section = sections.find(s => s.section_key === sectionKey)
    if (!section) return
    const newVal = !section.is_visible
    setSections(prev => prev.map(s => s.section_key === sectionKey ? { ...s, is_visible: newVal } : s))
    await supabase.from('page_content').update({ is_visible: newVal, updated_at: new Date().toISOString() }).eq('section_key', sectionKey)
  }

  const moveSection = async (sectionKey: string, dir: 'up' | 'down') => {
    const sorted = [...sections].sort((a, b) => a.sort_order - b.sort_order)
    const idx = sorted.findIndex(s => s.section_key === sectionKey)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const a = sorted[idx]
    const b = sorted[swapIdx]
    const newSections = sections.map(s => {
      if (s.section_key === a.section_key) return { ...s, sort_order: b.sort_order }
      if (s.section_key === b.section_key) return { ...s, sort_order: a.sort_order }
      return s
    })
    setSections(newSections)

    await Promise.all([
      supabase.from('page_content').update({ sort_order: b.sort_order }).eq('section_key', a.section_key),
      supabase.from('page_content').update({ sort_order: a.sort_order }).eq('section_key', b.section_key),
    ])
  }

  const handleSave = async () => {
    if (!selectedSection) return
    setSaving(true)
    setError('')
    setSaved(false)

    const { error: err } = await supabase
      .from('page_content')
      .update({ content: drafts[selectedKey], updated_at: new Date().toISOString() })
      .eq('section_key', selectedKey)

    if (err) {
      setError('Failed to save. Please try again.')
    } else {
      setSaved(true)
      setSections(prev => prev.map(s => s.section_key === selectedKey ? { ...s, content: drafts[selectedKey] } : s))
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-brand-500" size={28} />
      </div>
    )
  }

  const sorted = [...sections].sort((a, b) => a.sort_order - b.sort_order)
  const draft = drafts[selectedKey] || {}

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-800 text-gray-900 tracking-tight">Page Builder</h1>
          <p className="text-sm text-gray-500 mt-0.5">Edit your website content, toggle sections on/off, and reorder them</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-sm py-2 px-4 flex items-center gap-2"
          >
            <Eye size={15} />
            Preview Site
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Section
          </button>
        </div>
      </div>

      {saved && (
        <div className="mb-5 flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm font-600">
          <CheckCircle2 size={16} /> Section saved — changes are live on your website.
        </div>
      )}
      {error && (
        <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm font-600">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="flex gap-6">
        {/* Left: Section list */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-700 uppercase tracking-wider text-gray-400">Sections</p>
            </div>
            <ul className="divide-y divide-gray-50">
              {sorted.map((section, idx) => {
                const m = SECTION_META[section.section_key]
                if (!m) return null
                const Icon = m.icon
                const isSelected = section.section_key === selectedKey
                return (
                  <li key={section.section_key}>
                    <div
                      className={`px-3 py-3 cursor-pointer transition-colors ${isSelected ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
                      onClick={() => setSelectedKey(section.section_key)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={14} className={isSelected ? 'text-brand-500' : 'text-gray-400'} />
                        <span className={`text-sm font-600 flex-1 ${isSelected ? 'text-brand-600' : 'text-gray-700'}`}>
                          {m.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleVisibility(section.section_key) }}
                          title={section.is_visible ? 'Hide section' : 'Show section'}
                          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors ${
                            section.is_visible
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {section.is_visible ? <Eye size={11} /> : <EyeOff size={11} />}
                          {section.is_visible ? 'Visible' : 'Hidden'}
                        </button>
                        <div className="flex gap-0.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); moveSection(section.section_key, 'up') }}
                            disabled={idx === 0}
                            className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                          >
                            <ChevronUp size={13} className="text-gray-500" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); moveSection(section.section_key, 'down') }}
                            disabled={idx === sorted.length - 1}
                            className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                          >
                            <ChevronDown size={13} className="text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs text-blue-700 font-600 mb-1">How it works</p>
            <p className="text-xs text-blue-600 leading-relaxed">
              Edit text, toggle visibility, or reorder sections. Click <strong>Save Section</strong> to publish changes live.
            </p>
          </div>
        </div>

        {/* Right: Editor + Preview */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Editor */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  {meta && <meta.icon size={18} className="text-brand-500" />}
                </div>
                <div>
                  <h3 className="font-700 text-gray-900 leading-tight">{meta?.label}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Edit the content for this section</p>
                </div>
              </div>

              <div className="space-y-4">
                {meta?.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-600 text-gray-700 mb-1.5">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="admin-input resize-none"
                        rows={field.key === 'features' ? 6 : 3}
                        placeholder={field.placeholder}
                        value={draft[field.key] || ''}
                        onChange={(e) => updateField(field.key, e.target.value)}
                      />
                    ) : (
                      <input
                        type="text"
                        className="admin-input"
                        placeholder={field.placeholder}
                        value={draft[field.key] || ''}
                        onChange={(e) => updateField(field.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary w-full justify-center mt-6 py-3"
              >
                {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save Section</>}
              </button>
            </div>

            {/* Live Preview */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Eye size={16} className="text-gray-400" />
                <h3 className="font-700 text-gray-700 text-sm">Live Preview</h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-auto">Updates as you type</span>
              </div>

              <SectionPreview sectionKey={selectedKey} draft={draft} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionPreview({ sectionKey, draft }: { sectionKey: string; draft: Record<string, string> }) {
  if (sectionKey === 'hero') {
    return (
      <div className="rounded-xl overflow-hidden" style={{ background: '#1a2744' }}>
        <div className="p-6">
          <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            <span className="text-white/80 text-xs">{draft.badge_text || 'Badge text'}</span>
          </div>
          <h2 className="text-xl font-800 text-white mb-3 leading-tight">
            {draft.title || 'Your headline here'}
          </h2>
          <p className="text-white/60 text-sm mb-4 leading-relaxed">
            {draft.subtitle || 'Your subtitle here'}
          </p>
          <div className="flex gap-2 mb-5">
            <span className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-lg font-600">
              {draft.cta_primary || 'Primary Button'}
            </span>
            <span className="border border-white/30 text-white text-xs px-3 py-1.5 rounded-lg">
              {draft.cta_secondary || 'Secondary Button'}
            </span>
          </div>
          <div className="flex gap-4">
            {[
              [draft.stat1_value || '—', draft.stat1_label || 'Stat 1'],
              [draft.stat2_value || '—', draft.stat2_label || 'Stat 2'],
              [draft.stat3_value || '—', draft.stat3_label || 'Stat 3'],
            ].map(([val, lbl]) => (
              <div key={lbl} className="text-center">
                <div className="text-white font-700 text-sm">{val}</div>
                <div className="text-white/40 text-xs">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (sectionKey === 'services') {
    return (
      <div className="rounded-xl bg-white border border-gray-100 p-6 text-center">
        <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-500 rounded-full px-3 py-1 mb-3 text-xs font-600">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
          {draft.badge_text || 'Badge'}
        </div>
        <h2 className="text-lg font-800 text-navy-800 mb-2">{draft.title || 'Section Title'}</h2>
        <p className="text-gray-500 text-sm leading-relaxed">{draft.subtitle || 'Section subtitle'}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {['Service 1', 'Service 2', 'Service 3'].map(s => (
            <div key={s} className="bg-gray-50 rounded-lg p-2 text-xs text-gray-400 border border-gray-100">{s}</div>
          ))}
        </div>
      </div>
    )
  }

  if (sectionKey === 'about') {
    const features = (draft.features || '').split('\n').filter(Boolean).slice(0, 4)
    return (
      <div className="rounded-xl p-5" style={{ background: '#f5f0eb' }}>
        <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-500 rounded-full px-3 py-1 mb-3 text-xs font-600">
          {draft.badge_text || 'Badge'}
        </div>
        <h2 className="text-base font-800 text-navy-800 mb-2">{draft.title || 'Section Title'}</h2>
        <p className="text-gray-600 text-xs mb-3 leading-relaxed">{draft.description || 'Description'}</p>
        <ul className="space-y-1.5 mb-3">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
              <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-[8px]">✓</span>
              </span>
              {f}
            </li>
          ))}
          {!features.length && <li className="text-xs text-gray-400 italic">Feature list (one per line)</li>}
        </ul>
        <div className="flex gap-3">
          {[
            [draft.stat1_value || '—', draft.stat1_label || 'Stat 1'],
            [draft.stat2_value || '—', draft.stat2_label || 'Stat 2'],
            [draft.stat3_value || '—', draft.stat3_label || 'Stat 3'],
          ].map(([val, lbl]) => (
            <div key={lbl} className="text-center">
              <div className="font-800 text-navy-800 text-sm">{val}</div>
              <div className="text-gray-400 text-xs">{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (sectionKey === 'booking') {
    return (
      <div className="rounded-xl bg-white border border-gray-100 p-6 text-center">
        <h2 className="text-lg font-800 text-navy-800 mb-2">{draft.title || 'Booking Title'}</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-4">{draft.subtitle || 'Booking subtitle'}</p>
        <div className="flex justify-center gap-2">
          {['Step 1', 'Step 2', 'Step 3', 'Step 4'].map(s => (
            <div key={s} className="bg-gray-100 rounded-lg px-3 py-1.5 text-xs text-gray-500">{s}</div>
          ))}
        </div>
      </div>
    )
  }

  if (sectionKey === 'footer') {
    return (
      <div className="rounded-xl overflow-hidden">
        <div className="bg-orange-500 px-4 py-3 flex items-center justify-between">
          <p className="text-white font-700 text-xs">{draft.cta_headline || 'CTA headline'}</p>
          <span className="border border-white/60 text-white text-xs px-2 py-1 rounded">
            {draft.cta_button || 'Button'}
          </span>
        </div>
        <div className="p-4" style={{ background: '#0f1829' }}>
          <p className="text-white/50 text-xs leading-relaxed">{draft.tagline || 'Footer tagline'}</p>
        </div>
      </div>
    )
  }

  return <div className="text-gray-400 text-sm text-center py-8">Select a section to preview</div>
}
