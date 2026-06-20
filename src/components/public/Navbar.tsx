import { useState, useEffect } from 'react'
import { Wrench, Menu, X, Phone } from 'lucide-react'
import type { BusinessSettings } from '../../lib/types'

interface NavbarProps {
  settings: BusinessSettings | null
  onBookClick: () => void
}

export default function Navbar({ settings, onBookClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const businessName = settings?.business_name || 'FixRight Home Repair'
  const phone = settings?.business_phone || ''

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
    { label: 'Booking', href: '#booking' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-nav shadow-[0_2px_24px_rgba(26,39,68,0.1)] border-b border-warm-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              scrolled ? 'bg-navy-800' : 'bg-white/15 backdrop-blur-sm'
            }`}>
              <Wrench size={18} className="text-brand-500" />
            </div>
            <span className={`font-bold text-lg tracking-tight transition-colors ${
              scrolled ? 'text-navy-800' : 'text-white'
            }`}>
              {businessName}
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm font-500 transition-colors ${
                  scrolled
                    ? 'text-navy-700 hover:text-brand-500'
                    : 'text-white/85 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-4">
            {phone && (
              <a
                href={`tel:${phone}`}
                className={`flex items-center gap-1.5 text-sm font-500 transition-colors ${
                  scrolled ? 'text-navy-700 hover:text-brand-500' : 'text-white/85 hover:text-white'
                }`}
              >
                <Phone size={14} />
                {phone}
              </a>
            )}
            <button onClick={onBookClick} className="btn-primary text-sm py-2.5 px-5">
              Book a Repair
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              scrolled ? 'text-navy-800 hover:bg-warm-100' : 'text-white hover:bg-white/10'
            }`}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden glass-nav border-t border-warm-100">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-navy-800 font-500 py-2.5 px-3 rounded-lg hover:bg-warm-100 transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-2 text-navy-700 py-2.5 px-3 text-sm font-500"
              >
                <Phone size={14} />
                {phone}
              </a>
            )}
            <button
              onClick={() => { onBookClick(); setMobileOpen(false) }}
              className="btn-primary mt-2 text-sm"
            >
              Book a Repair
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
