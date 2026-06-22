import { useEffect, useState, useRef } from 'react'
import Navbar from '../components/public/Navbar'
import Hero from '../components/public/Hero'
import Services from '../components/public/Services'
import About from '../components/public/About'
import BookingSection from '../components/public/BookingSection'
import Footer from '../components/public/Footer'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Service, BusinessSettings, BusinessHours, BlockedDate, PageContent } from '../lib/types'

function SetupBanner() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: '#1a2744', color: 'white',
      padding: '12px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
      fontSize: '14px', fontWeight: 500,
    }}>
      <span style={{ color: '#e8621a', fontWeight: 700 }}>⚙ Setup Required:</span>
      Open <code style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '4px' }}>.env.local</code>
      and replace the placeholders with your Supabase URL and anon key, then restart the dev server.
    </div>
  )
}

export default function Home() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [pageContent, setPageContent] = useState<Record<string, PageContent>>({})
  const [servicesLoading, setServicesLoading] = useState(true)
  const [preselectedService, setPreselectedService] = useState<Service | null>(null)

  const bookingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setServicesLoading(false)
      return
    }
    const loadAll = async () => {
      try {
        const [settingsRes, servicesRes, hoursRes, blockedRes, contentRes] = await Promise.all([
          supabase.from('business_settings').select('*').limit(1).maybeSingle(),
          supabase.from('services').select('*').eq('is_active', true).order('created_at'),
          supabase.from('business_hours').select('*').order('weekday'),
          supabase.from('blocked_dates').select('*').order('blocked_date'),
          supabase.from('page_content').select('*').order('sort_order'),
        ])
        setSettings(settingsRes.data as BusinessSettings | null)
        setServices((servicesRes.data || []) as Service[])
        setBusinessHours((hoursRes.data || []) as BusinessHours[])
        setBlockedDates((blockedRes.data || []) as BlockedDate[])
        const contentMap: Record<string, PageContent> = {}
        ;(contentRes.data || []).forEach((row: PageContent) => { contentMap[row.section_key] = row })
        setPageContent(contentMap)
      } finally {
        setServicesLoading(false)
      }
    }
    loadAll()
  }, [])

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleBookService = (service: Service) => {
    setPreselectedService(service)
    setTimeout(() => scrollToBooking(), 50)
  }

  const isVisible = (key: string) => !pageContent[key] || pageContent[key].is_visible !== false
  const content = (key: string) => pageContent[key]?.content || {}

  const orderedSections = ['hero', 'services', 'about', 'booking', 'footer']
    .filter(isVisible)
    .sort((a, b) => {
      const aOrder = pageContent[a]?.sort_order ?? 99
      const bOrder = pageContent[b]?.sort_order ?? 99
      return aOrder - bOrder
    })

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', paddingTop: isSupabaseConfigured ? 0 : '48px' }}>
      {!isSupabaseConfigured && <SetupBanner />}
      <Navbar settings={settings} onBookClick={scrollToBooking} />
      {orderedSections.map((key) => {
        if (key === 'hero') return <Hero key="hero" settings={settings} content={content('hero')} onBookClick={scrollToBooking} />
        if (key === 'services') return <Services key="services" services={services} loading={servicesLoading} content={content('services')} onBook={handleBookService} />
        if (key === 'about') return <About key="about" content={content('about')} />
        if (key === 'booking') return (
          <div key="booking" ref={bookingRef}>
            <BookingSection
              initialService={preselectedService}
              services={services}
              settings={settings}
              businessHours={businessHours}
              blockedDates={blockedDates}
              content={content('booking')}
            />
          </div>
        )
        return null
      })}
      <Footer settings={settings} content={content('footer')} />
    </div>
  )
}
