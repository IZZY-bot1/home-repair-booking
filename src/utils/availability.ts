import { addMinutes, set, isAfter, isBefore, format } from 'date-fns'
import type { BusinessHours, TimeSlot } from '../lib/types'

export function generateTimeSlots(
  date: Date,
  businessHour: BusinessHours | undefined,
  bookedSlots: { start_time: string; end_time: string }[],
  serviceDurationMinutes: number,
  slotIntervalMinutes: number,
  bookingNoticeHours: number
): TimeSlot[] {
  if (!businessHour || !businessHour.is_open) return []

  const now = new Date()
  const minBookingTime = new Date(now.getTime() + bookingNoticeHours * 60 * 60 * 1000)

  const [startH, startM] = businessHour.start_time.split(':').map(Number)
  const [endH, endM] = businessHour.end_time.split(':').map(Number)

  const dayStart = set(new Date(date), { hours: startH, minutes: startM, seconds: 0, milliseconds: 0 })
  const dayEnd = set(new Date(date), { hours: endH, minutes: endM, seconds: 0, milliseconds: 0 })

  const slots: TimeSlot[] = []
  let current = new Date(dayStart)

  while (true) {
    const slotEnd = addMinutes(current, serviceDurationMinutes)
    if (isAfter(slotEnd, dayEnd) || slotEnd.getTime() === dayEnd.getTime()) {
      // allow exact end time
      if (isAfter(slotEnd, dayEnd)) break
    }

    if (isAfter(slotEnd, dayEnd)) break

    // Skip slots too soon
    if (!isAfter(current, minBookingTime)) {
      current = addMinutes(current, slotIntervalMinutes)
      continue
    }

    // Check for overlaps with existing bookings
    const hasOverlap = bookedSlots.some((booked) => {
      const [bSH, bSM] = booked.start_time.split(':').map(Number)
      const [bEH, bEM] = booked.end_time.split(':').map(Number)
      const bookedStart = set(new Date(date), { hours: bSH, minutes: bSM, seconds: 0, milliseconds: 0 })
      const bookedEnd = set(new Date(date), { hours: bEH, minutes: bEM, seconds: 0, milliseconds: 0 })
      // Overlap: new_start < existing_end AND new_end > existing_start
      return isBefore(current, bookedEnd) && isAfter(slotEnd, bookedStart)
    })

    if (!hasOverlap) {
      slots.push({
        start: new Date(current),
        end: new Date(slotEnd),
        label: format(current, 'h:mm a'),
      })
    }

    current = addMinutes(current, slotIntervalMinutes)
  }

  return slots
}
