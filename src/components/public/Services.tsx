import { useState } from 'react'
import { Clock, DollarSign, ArrowRight, Loader2 } from 'lucide-react'
import { getServiceImage } from '../../lib/images'
import type { Service } from '../../lib/types'

interface ServicesProps {
  services: Service[]
  loading: boolean
  onBook: (service: Service) => void
}

export default function Services({ services, loading, onBook }: ServicesProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <section id="services" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-500 rounded-full px-4 py-1.5 text-sm font-600 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block" />
            What We Fix
          </div>
          <h2 className="text-4xl sm:text-5xl font-800 text-navy-800 tracking-tight mb-4">
            Professional Home Repair{' '}
            <span className="text-gradient-brand">Services</span>
          </h2>
          <p className="text-warm-300 text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#8a7f76' }}>
            From quick fixes to complex repairs, our licensed technicians handle every job with care, precision, and a satisfaction guarantee.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-brand-500" size={32} />
            <p className="text-sm" style={{ color: '#8a7f76' }}>Loading services…</p>
          </div>
        )}

        {/* Service cards */}
        {!loading && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="group bg-white rounded-2xl border border-warm-200 overflow-hidden card-hover"
                style={{ borderColor: hoveredId === service.id ? '#e8621a' : undefined }}
                onMouseEnter={() => setHoveredId(service.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Service image */}
                <div className="relative h-44 overflow-hidden bg-warm-100">
                  <img
                    src={getServiceImage(service.name)}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      const el = e.currentTarget
                      el.style.display = 'none'
                      const parent = el.parentElement
                      if (parent) {
                        parent.style.background = 'linear-gradient(135deg, #1a2744 0%, #25457a 100%)'
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent" />
                  {/* Price badge */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
                    <span className="font-700 text-navy-800 text-sm">
                      ${service.price.toFixed(0)}
                    </span>
                    <span className="text-xs text-gray-500 ml-0.5">+</span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5">
                  {/* Top accent line */}
                  <div className="w-8 h-0.5 bg-brand-500 mb-4 rounded-full transition-all duration-300 group-hover:w-12" />

                  <h3 className="font-700 text-navy-800 text-lg mb-2 leading-tight">
                    {service.name}
                  </h3>
                  <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: '#8a7f76' }}>
                    {service.description}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-500" style={{ color: '#8a7f76' }}>
                        <Clock size={13} />
                        {service.duration_minutes < 60
                          ? `${service.duration_minutes}m`
                          : `${service.duration_minutes / 60}h${service.duration_minutes % 60 ? ` ${service.duration_minutes % 60}m` : ''}`}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-500" style={{ color: '#8a7f76' }}>
                        <DollarSign size={13} />
                        Starting at ${service.price.toFixed(0)}
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => onBook(service)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 border-warm-200 text-navy-800 font-600 text-sm transition-all duration-200 group-hover:border-brand-500 group-hover:bg-brand-50 group-hover:text-brand-600"
                  >
                    <span>Book This Service</span>
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && services.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-warm-100 flex items-center justify-center mx-auto mb-4">
              <Clock size={28} style={{ color: '#d8cdc1' }} />
            </div>
            <p className="font-600 text-navy-800 mb-1">Services Coming Soon</p>
            <p className="text-sm" style={{ color: '#8a7f76' }}>
              Our service menu is being updated. Check back shortly.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
