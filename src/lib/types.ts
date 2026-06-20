export interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  created_at: string;
}

export interface AppointmentWithService extends Appointment {
  services: { name: string } | null;
}

export interface BusinessHours {
  id: string;
  weekday: number;
  is_open: boolean;
  start_time: string;
  end_time: string;
}

export interface BlockedDate {
  id: string;
  blocked_date: string;
  reason: string | null;
  created_at: string;
}

export interface BusinessSettings {
  id: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  slot_interval_minutes: number;
  booking_notice_hours: number;
  created_at: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  label: string;
}

export interface BookingDetails {
  service: Service;
  date: Date;
  slot: TimeSlot;
  full_name: string;
  email: string;
  phone: string;
  notes: string;
}
