import { ArrowRight, ShieldCheck, Clock, Star, ChevronDown } from 'lucide-react'
import { IMAGES } from '../../lib/images'
import type { BusinessSettings } from '../../lib/types'

interface HeroProps {
  settings: BusinessSettings | null
  onBookClick: () => void
}

export default function Hero({ settings, onBookClick }: HeroProps) {
  const businessName = settings?.business_name || 'FixRight Home Repair'

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={IMAGES.hero.main}
          alt="Professional home repair technician working in a clean modern home"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            const el = e.currentTarget
            el.style.display = 'none'
            const parent = el.parentElement
            if (parent) {
              parent.style.background = 'linear-gradient(135deg, #080f1e 0%, #1a2744 50%, #25457a 100%)'
            }
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 hero-gradient" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#faf9f7] to-transparent" />
      </div>

      {/* Floating accent shapes */}
      <div className="absolute top-1/4 right-[8%] w-72 h-72 rounded-full bg-brand-500/10 blur-3xl pointer-events-none hidden lg:block" />
      <div className="absolute bottom-1/3 right-[20%] w-48 h-48 rounded-full bg-navy-400/15 blur-2xl pointer-events-none hidden lg:block" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="max-w-2xl xl:max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/12 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-white/90 text-sm font-500 tracking-wide">
              Trusted Home Repair Specialists
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-800 text-white leading-[1.05] tracking-tight mb-6 animate-slide-up">
            Your Home,{' '}
            <span className="text-gradient-brand">Expertly</span>
            <br />
            Repaired &amp; Maintained
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-white/75 leading-relaxed mb-10 max-w-xl animate-slide-up-delay">
            {businessName} brings professional repair technicians to your door. Schedule a service online in minutes and get your home back in perfect shape.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-16 animate-slide-up-delay">
            <button onClick={onBookClick} className="btn-primary text-base px-7 py-3.5">
              Book Your Repair
              <ArrowRight size={18} />
            </button>
            <a href="#services" className="btn-secondary text-base px-7 py-3.5">
              View Services
            </a>
          </div>

          {/* Trust stats */}
          <div className="flex flex-wrap gap-6 sm:gap-10">
            {[
              { icon: ShieldCheck, value: '10+ Years', label: 'Experience' },
              { icon: Star, value: '4.9 / 5', label: 'Client Rating' },
              { icon: Clock, value: 'Same-Day', label: 'Availability' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/12 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-brand-400" />
                </div>
                <div>
                  <div className="text-white font-700 text-sm leading-tight">{value}</div>
                  <div className="text-white/55 text-xs">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="relative z-10 flex justify-center pb-8">
        <a
          href="#services"
          className="flex flex-col items-center gap-1 text-white/40 hover:text-white/70 transition-colors"
        >
          <span className="text-xs tracking-widest uppercase">Explore</span>
          <ChevronDown size={18} className="animate-bounce" />
        </a>
      </div>
    </section>
  )
}
