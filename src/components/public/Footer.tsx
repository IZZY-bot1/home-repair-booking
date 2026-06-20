import { Wrench, Phone, Mail, MapPin, Globe, MessageCircle, Share2 } from 'lucide-react'
import type { BusinessSettings } from '../../lib/types'

interface FooterProps {
  settings: BusinessSettings | null
}

export default function Footer({ settings }: FooterProps) {
  const businessName = settings?.business_name || 'FixRight Home Repair'
  const email = settings?.business_email || ''
  const phone = settings?.business_phone || ''
  const address = settings?.business_address || ''
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: '#0f1829' }}>
      {/* Top CTA strip */}
      <div style={{ background: '#e8621a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white font-700 text-lg tracking-tight">
            Need a repair? We're just a booking away.
          </p>
          <a href="#booking" className="btn-secondary text-sm shrink-0 py-2.5 px-6">
            Schedule Now
          </a>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
                <Wrench size={18} className="text-white" />
              </div>
              <span className="text-white font-700 text-lg">{businessName}</span>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#7a8ba6' }}>
              Reliable, professional home repair and maintenance services for homeowners. Trusted by thousands of families.
            </p>
            <div className="flex items-center gap-3">
              {[Globe, MessageCircle, Share2].map((Icon, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(232,98,26,0.3)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                >
                  <Icon size={16} style={{ color: '#7a8ba6' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-700 text-sm mb-5 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              {['Services', 'About Us', 'Book a Repair', 'Admin Login'].map((item) => (
                <li key={item}>
                  <a
                    href={item === 'Admin Login' ? '/#/admin' : `#${item.toLowerCase().replace(/ /g, '-')}`}
                    className="text-sm transition-colors"
                    style={{ color: '#7a8ba6' }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#e8621a')}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#7a8ba6')}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-700 text-sm mb-5 uppercase tracking-wider">Contact</h4>
            <div className="space-y-3">
              {phone && (
                <a href={`tel:${phone}`} className="flex items-start gap-2.5 group">
                  <Phone size={15} className="text-brand-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm group-hover:text-white transition-colors" style={{ color: '#7a8ba6' }}>
                    {phone}
                  </span>
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="flex items-start gap-2.5 group">
                  <Mail size={15} className="text-brand-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm group-hover:text-white transition-colors" style={{ color: '#7a8ba6' }}>
                    {email}
                  </span>
                </a>
              )}
              {address && (
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-brand-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm" style={{ color: '#7a8ba6' }}>{address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: '#4a5a73' }}>
            © {year} {businessName}. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: '#4a5a73' }}>
            Licensed · Insured · Trusted
          </p>
        </div>
      </div>
    </footer>
  )
}
