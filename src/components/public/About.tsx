import { CheckCircle2, Users, Award, ThumbsUp } from 'lucide-react'
import { IMAGES } from '../../lib/images'

interface AboutProps {
  content: Record<string, string>
}

export default function About({ content }: AboutProps) {
  const badge = content.badge_text || 'Why Choose Us'
  const title = content.title || 'Repair Done Right, Every Time'
  const description = content.description || "We built our reputation one repair at a time. Every technician on our team is vetted, trained, and committed to doing clean, lasting work. We treat your home with the same care we'd give our own."
  const features = (content.features || 'Licensed and insured repair technicians\nUpfront pricing — no hidden fees\nSame-day and next-day availability\nWork guaranteed or we make it right\nClean, respectful of your home\nDetailed estimates before work begins').split('\n').filter(Boolean)
  const ctaText = content.cta_text || 'Schedule Your Service'

  const stats = [
    { icon: Users, value: content.stat1_value || '2,400+', label: content.stat1_label || 'Homeowners Served' },
    { icon: Award, value: content.stat2_value || '10+', label: content.stat2_label || 'Years in Business' },
    { icon: ThumbsUp, value: content.stat3_value || '98%', label: content.stat3_label || 'Satisfaction Rate' },
  ]

  return (
    <section id="about" className="section-padding" style={{ background: '#f5f0eb' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-[4/3]">
                <img
                  src={IMAGES.about.main}
                  alt="Professional home repair technician carefully inspecting work"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const el = e.currentTarget
                    el.style.display = 'none'
                    const parent = el.parentElement
                    if (parent) {
                      parent.style.background = 'linear-gradient(135deg, #1a2744, #25457a)'
                      parent.style.minHeight = '300px'
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-navy-900/25 to-transparent" />
              </div>
            </div>

            <div className="absolute -bottom-6 -right-4 lg:-right-8 bg-white rounded-2xl shadow-xl p-5 border border-warm-200">
              <div className="flex gap-6">
                {stats.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="text-center">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-1.5">
                      <Icon size={16} className="text-brand-500" />
                    </div>
                    <div className="font-800 text-navy-800 text-lg leading-none">{value}</div>
                    <div className="text-xs mt-0.5 whitespace-nowrap" style={{ color: '#8a7f76' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -top-4 -left-4 w-24 h-24 rounded-2xl border-2 border-brand-500/20 -z-10" />
            <div className="absolute -bottom-2 -left-6 w-16 h-16 rounded-full bg-gold-100 -z-10" />
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-500 rounded-full px-4 py-1.5 text-sm font-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block" />
              {badge}
            </div>

            <h2 className="text-4xl sm:text-5xl font-800 text-navy-800 tracking-tight leading-[1.1] mb-5">
              {title}
            </h2>

            <p className="text-base leading-relaxed mb-8" style={{ color: '#6b6460' }}>
              {description}
            </p>

            <ul className="space-y-3 mb-10">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-brand-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-500 text-navy-700">{feature}</span>
                </li>
              ))}
            </ul>

            <a href="#booking" className="btn-primary inline-flex">
              {ctaText}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
