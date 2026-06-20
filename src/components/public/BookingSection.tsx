import { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft, ChevronRight, Clock, DollarSign, CalendarDays,
  User, Mail, Phone, FileText, CheckCircle2, Loader2, AlertCircle
} from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, addMonths, subMonths, isSameDay, isBefore, startOfDay
} from 'date-fns'
import { supabase } from '../../lib/supabase'
import { generateTimeSlots } from '../../utils/availability'
import type { Service, BusinessHours, BlockedDate, BusinessSettings, TimeSlot } from '../../lib/types'

type Step = 1 | 2 | 3 | 4

interface BookingData {
  service: Service | null
  date: Date | null
  slot: TimeSlot | null
  full_name: string
  email: string
  phone: string
  notes: string
}

interface Props {
  initialService?: Service | null
  services: Service[]
  settings: BusinessSettings | null
  businessHours: BusinessHours[]
  blockedDates: BlockedDate[]
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function BookingSection({
  initialService,
  services,
  settings,
  businessHours,
  blockedDates,
}: Props) {
  const [step, setStep] = useState<Step>(1)
  const [booking, setBooking] = useState<BookingData>({
    service: null,
    date: null,
    slot: null,
    full_name: '',
    email: '',
    phone: '',
    notes: '',
  })
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Pre-select service if provided
  useEffect(() => {
    if (initialService) {
      setBooking((b) => ({ ...b, service: initialService }))
      setStep(2)
    }
  }, [initialService])

  const isDateBlocked = useCallback(
    (date: Date) => blockedDates.some((bd) => bd.blocked_date === format(date, 'yyyy-MM-dd')),
    [blockedDates]
  )

  const isDateOpen = useCallback(
    (date: Date) => {
      const weekday = getDay(date)
      const bh = businessHours.find((h) => h.weekday === weekday)
      return bh?.is_open ?? false
    },
    [businessHours]
  )

  const isDateDisabled = useCallback(
    (date: Date) => {
      const today = startOfDay(new Date())
      if (isBefore(date, today)) return true
      if (isDateBlocked(date)) return true
      if (!isDateOpen(date)) return true
      return false
    },
    [isDateBlocked, isDateOpen]
  )

  const loadSlots = useCallback(
    async (date: Date) => {
      if (!booking.service || !settings) return
      setLoadingSlots(true)
      setAvailableSlots([])
      try {
        const dateStr = format(date, 'yyyy-MM-dd')
        const { data } = await supabase.rpc('get_appointment_slots_for_date', { p_date: dateStr })
        const booked = (data || []) as { start_time: string; end_time: string }[]
        const weekday = getDay(date)
        const bh = businessHours.find((h) => h.weekday === weekday)
        const slots = generateTimeSlots(
          date,
          bh,
          booked,
          booking.service.duration_minutes,
          settings.slot_interval_minutes || 30,
          settings.booking_notice_hours || 24
        )
        setAvailableSlots(slots)
      } finally {
        setLoadingSlots(false)
      }
    },
    [booking.service, settings, businessHours]
  )

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return
    setBooking((b) => ({ ...b, date, slot: null }))
    loadSlots(date)
  }

  const validateStep3 = () => {
    const errors: Record<string, string> = {}
    if (!booking.full_name.trim()) errors.full_name = 'Full name is required'
    if (!booking.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email)) errors.email = 'Enter a valid email'
    if (!booking.phone.trim()) errors.phone = 'Phone number is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateStep3()) return
    if (!booking.service || !booking.date || !booking.slot) return

    setSubmitting(true)
    setSubmitError('')

    try {
      const { error } = await supabase.from('appointments').insert({
        full_name: booking.full_name.trim(),
        email: booking.email.trim(),
        phone: booking.phone.trim(),
        service_id: booking.service.id,
        appointment_date: format(booking.date, 'yyyy-MM-dd'),
        start_time: format(booking.slot.start, 'HH:mm:ss'),
        end_time: format(booking.slot.end, 'HH:mm:ss'),
        status: 'pending',
        notes: booking.notes.trim() || null,
      })

      if (error) throw error
      setStep(4)
    } catch {
      setSubmitError('Unable to submit your booking. Please try again or call us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetBooking = () => {
    setBooking({ service: null, date: null, slot: null, full_name: '', email: '', phone: '', notes: '' })
    setStep(1)
    setAvailableSlots([])
    setSubmitError('')
    setFormErrors({})
  }

  // Calendar helpers
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(calendarMonth),
    end: endOfMonth(calendarMonth),
  })
  const firstDayOffset = getDay(startOfMonth(calendarMonth))
  const prevMonthPad = Array.from({ length: firstDayOffset })

  const steps = [
    { n: 1, label: 'Service' },
    { n: 2, label: 'Date & Time' },
    { n: 3, label: 'Your Details' },
    { n: 4, label: 'Confirmed' },
  ]

  return (
    <section id="booking" className="section-padding" style={{ background: '#faf9f7' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {step !== 4 && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-500 rounded-full px-4 py-1.5 text-sm font-600 mb-4">
              <CalendarDays size={14} />
              Online Booking
            </div>
            <h2 className="text-4xl sm:text-5xl font-800 text-navy-800 tracking-tight mb-3">
              Book Your{' '}
              <span className="text-gradient-brand">Home Repair</span>
            </h2>
            <p className="text-base" style={{ color: '#8a7f76' }}>
              Choose your service, pick a time, and we'll take care of the rest.
            </p>
          </div>
        )}

        {/* Step indicator */}
        {step !== 4 && (
          <div className="flex items-center justify-center mb-10">
            {steps.slice(0, 3).map(({ n, label }, idx) => (
              <div key={n} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-700 transition-all ${
                      step === n
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                        : step > n
                        ? 'bg-navy-800 text-white'
                        : 'bg-warm-200 text-warm-300'
                    }`}
                    style={{ color: step <= n && step !== n ? '#c0b8b0' : undefined }}
                  >
                    {step > n ? <CheckCircle2 size={16} /> : n}
                  </div>
                  <span
                    className={`hidden sm:block text-sm font-500 ${
                      step === n ? 'text-navy-800' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-2 rounded-full transition-colors ${step > n ? 'bg-navy-800' : 'bg-warm-200'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* === STEP 1: Select Service === */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-700 text-navy-800 mb-5">Select a Service</h3>
            {services.length === 0 ? (
              <p className="text-center py-10" style={{ color: '#8a7f76' }}>No services available at this time.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((svc) => (
                  <button
                    key={svc.id}
                    className={`step-card text-left ${booking.service?.id === svc.id ? 'selected' : ''}`}
                    onClick={() => {
                      setBooking((b) => ({ ...b, service: svc, date: null, slot: null }))
                      setStep(2)
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-700 text-navy-800 text-sm leading-snug">{svc.name}</h4>
                      <span className="font-700 text-brand-500 text-sm flex-shrink-0">${svc.price.toFixed(0)}</span>
                    </div>
                    <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: '#8a7f76' }}>
                      {svc.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs font-500" style={{ color: '#a09890' }}>
                      <Clock size={12} />
                      {svc.duration_minutes >= 60
                        ? `${Math.floor(svc.duration_minutes / 60)}h${svc.duration_minutes % 60 ? ` ${svc.duration_minutes % 60}m` : ''}`
                        : `${svc.duration_minutes}m`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === STEP 2: Date & Time === */}
        {step === 2 && (
          <div className="animate-fade-in">
            {/* Selected service summary */}
            {booking.service && (
              <div className="flex items-center gap-3 bg-white border border-warm-200 rounded-xl p-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-700 text-navy-800 text-sm">{booking.service.name}</p>
                  <p className="text-xs" style={{ color: '#8a7f76' }}>
                    {booking.service.duration_minutes >= 60
                      ? `${Math.floor(booking.service.duration_minutes / 60)}h${booking.service.duration_minutes % 60 ? ` ${booking.service.duration_minutes % 60}m` : ''}`
                      : `${booking.service.duration_minutes}m`}{' '}
                    · ${booking.service.price.toFixed(0)}
                  </p>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-brand-500 hover:text-brand-600 font-600">
                  Change
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar */}
              <div className="bg-white border border-warm-200 rounded-2xl p-5">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                    className="w-8 h-8 rounded-lg hover:bg-warm-100 flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-700 text-navy-800 text-sm">
                    {format(calendarMonth, 'MMMM yyyy')}
                  </span>
                  <button
                    onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                    className="w-8 h-8 rounded-lg hover:bg-warm-100 flex items-center justify-center transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Day headers */}
                <div className="calendar-grid mb-1">
                  {WEEKDAYS.map((d) => (
                    <div key={d} className="text-center text-xs font-600 py-1" style={{ color: '#a09890' }}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="calendar-grid">
                  {prevMonthPad.map((_, i) => (
                    <div key={`pad-${i}`} />
                  ))}
                  {daysInMonth.map((day) => {
                    const disabled = isDateDisabled(day)
                    const selected = booking.date && isSameDay(day, booking.date)
                    const today = isSameDay(day, new Date())
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => handleDateSelect(day)}
                        disabled={disabled}
                        className={`calendar-day ${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''} ${today && !selected ? 'today' : ''}`}
                      >
                        {format(day, 'd')}
                      </button>
                    )
                  })}
                </div>

                <p className="text-xs mt-3" style={{ color: '#b0a89e' }}>
                  Gray dates are unavailable. Select an open date to see time slots.
                </p>
              </div>

              {/* Time slots */}
              <div className="bg-white border border-warm-200 rounded-2xl p-5">
                <h4 className="font-700 text-navy-800 text-sm mb-4">
                  {booking.date
                    ? `Available Times — ${format(booking.date, 'EEE, MMM d')}`
                    : 'Select a date first'}
                </h4>

                {loadingSlots && (
                  <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <Loader2 className="animate-spin text-brand-500" size={24} />
                    <p className="text-sm" style={{ color: '#8a7f76' }}>Checking availability…</p>
                  </div>
                )}

                {!loadingSlots && !booking.date && (
                  <div className="flex flex-col items-center justify-center h-40" style={{ color: '#c0b8b0' }}>
                    <CalendarDays size={32} className="mb-3 opacity-40" />
                    <p className="text-sm">Pick a date on the calendar</p>
                  </div>
                )}

                {!loadingSlots && booking.date && availableSlots.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40" style={{ color: '#c0b8b0' }}>
                    <Clock size={32} className="mb-3 opacity-40" />
                    <p className="text-sm text-center">No slots available on this date.<br />Please select another day.</p>
                  </div>
                )}

                {!loadingSlots && availableSlots.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                    {availableSlots.map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => setBooking((b) => ({ ...b, slot }))}
                        className={`slot-btn ${booking.slot && isSameDay(slot.start, booking.slot.start) && slot.label === booking.slot.label ? 'selected' : ''}`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6">
              <button onClick={() => setStep(1)} className="btn-outline flex items-center gap-2">
                <ChevronLeft size={16} />
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!booking.date || !booking.slot}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                Continue
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* === STEP 3: Customer Details === */}
        {step === 3 && (
          <div className="animate-fade-in">
            {/* Booking summary */}
            {booking.service && booking.date && booking.slot && (
              <div className="bg-white border border-warm-200 rounded-2xl p-5 mb-6">
                <h4 className="font-700 text-navy-800 text-sm mb-3">Appointment Summary</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                      <Clock size={14} className="text-brand-500" />
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: '#8a7f76' }}>Service</p>
                      <p className="text-sm font-600 text-navy-800">{booking.service.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                      <CalendarDays size={14} className="text-brand-500" />
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: '#8a7f76' }}>Date</p>
                      <p className="text-sm font-600 text-navy-800">{format(booking.date, 'EEE, MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                      <DollarSign size={14} className="text-brand-500" />
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: '#8a7f76' }}>Time &amp; Price</p>
                      <p className="text-sm font-600 text-navy-800">
                        {booking.slot.label} · ${booking.service.price.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="bg-white border border-warm-200 rounded-2xl p-6">
              <h3 className="font-700 text-navy-800 mb-5">Your Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="sm:col-span-2">
                  <label className="form-label">
                    <User size={13} className="inline mr-1.5 text-brand-500" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John Smith"
                    value={booking.full_name}
                    onChange={(e) => {
                      setBooking((b) => ({ ...b, full_name: e.target.value }))
                      if (formErrors.full_name) setFormErrors((e) => ({ ...e, full_name: '' }))
                    }}
                  />
                  {formErrors.full_name && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />{formErrors.full_name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="form-label">
                    <Mail size={13} className="inline mr-1.5 text-brand-500" />
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="john@example.com"
                    value={booking.email}
                    onChange={(e) => {
                      setBooking((b) => ({ ...b, email: e.target.value }))
                      if (formErrors.email) setFormErrors((err) => ({ ...err, email: '' }))
                    }}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />{formErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="form-label">
                    <Phone size={13} className="inline mr-1.5 text-brand-500" />
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="(555) 123-4567"
                    value={booking.phone}
                    onChange={(e) => {
                      setBooking((b) => ({ ...b, phone: e.target.value }))
                      if (formErrors.phone) setFormErrors((err) => ({ ...err, phone: '' }))
                    }}
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />{formErrors.phone}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="form-label">
                    <FileText size={13} className="inline mr-1.5 text-brand-500" />
                    Notes (optional)
                  </label>
                  <textarea
                    className="form-input resize-none"
                    rows={3}
                    placeholder="Describe the issue, access instructions, or any special requests…"
                    value={booking.notes}
                    onChange={(e) => setBooking((b) => ({ ...b, notes: e.target.value }))}
                  />
                </div>
              </div>

              {submitError && (
                <div className="mt-4 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6">
              <button onClick={() => setStep(2)} className="btn-outline flex items-center gap-2">
                <ChevronLeft size={16} />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary min-w-[180px]"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* === STEP 4: Success === */}
        {step === 4 && (
          <div className="animate-fade-in text-center py-8">
            {/* Success icon */}
            <div className="relative inline-flex mb-8">
              <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center">
                <span className="text-white text-xs font-700">✓</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-800 text-navy-800 tracking-tight mb-3">
              Booking Confirmed!
            </h2>
            <p className="text-base mb-10" style={{ color: '#8a7f76' }}>
              Your home repair appointment has been submitted successfully. We'll follow up to confirm all details.
            </p>

            {/* Summary card */}
            {booking.service && booking.date && booking.slot && (
              <div className="bg-white border-2 border-warm-200 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
                <h4 className="font-700 text-navy-800 mb-4 text-sm uppercase tracking-wider">
                  Appointment Details
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'Service', value: booking.service.name },
                    { label: 'Date', value: format(booking.date, 'EEEE, MMMM d, yyyy') },
                    { label: 'Time', value: booking.slot.label },
                    { label: 'Name', value: booking.full_name },
                    { label: 'Email', value: booking.email },
                    { label: 'Phone', value: booking.phone },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4 text-sm">
                      <span className="font-500" style={{ color: '#8a7f76' }}>{label}</span>
                      <span className="font-600 text-navy-800 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={resetBooking} className="btn-primary">
              Book Another Service
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
