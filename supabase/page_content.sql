-- ============================================================
-- Page Builder — page_content table
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS page_content (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  is_visible  BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  content     JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Public can read (so the website can load content)
CREATE POLICY "Public read page content"
  ON page_content FOR SELECT TO anon
  USING (true);

-- Admins can manage
CREATE POLICY "Admins manage page content"
  ON page_content FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Seed default content
INSERT INTO page_content (section_key, is_visible, sort_order, content) VALUES
('hero', true, 1, '{
  "badge_text": "Trusted Home Repair Specialists",
  "title": "Your Home, Expertly Repaired & Maintained",
  "subtitle": "Professional repair technicians to your door. Schedule a service online in minutes and get your home back in perfect shape.",
  "cta_primary": "Book Your Repair",
  "cta_secondary": "View Services",
  "stat1_value": "10+ Years", "stat1_label": "Experience",
  "stat2_value": "4.9 / 5",  "stat2_label": "Client Rating",
  "stat3_value": "Same-Day",  "stat3_label": "Availability"
}'),
('services', true, 2, '{
  "badge_text": "What We Fix",
  "title": "Professional Home Repair Services",
  "subtitle": "From quick fixes to complex repairs, our licensed technicians handle every job with care, precision, and a satisfaction guarantee."
}'),
('about', true, 3, '{
  "badge_text": "Why Choose Us",
  "title": "Repair Done Right, Every Time",
  "description": "We built our reputation one repair at a time. Every technician on our team is vetted, trained, and committed to doing clean, lasting work. We treat your home with the same care we''d give our own.",
  "features": "Licensed and insured repair technicians\nUpfront pricing — no hidden fees\nSame-day and next-day availability\nWork guaranteed or we make it right\nClean, respectful of your home\nDetailed estimates before work begins",
  "stat1_value": "2,400+", "stat1_label": "Homeowners Served",
  "stat2_value": "10+",    "stat2_label": "Years in Business",
  "stat3_value": "98%",    "stat3_label": "Satisfaction Rate",
  "cta_text": "Schedule Your Service"
}'),
('booking', true, 4, '{
  "title": "Book Your Repair",
  "subtitle": "Schedule your home repair service in minutes. Choose your service, pick a time, and we''ll take care of the rest."
}'),
('footer', true, 5, '{
  "tagline": "Reliable, professional home repair and maintenance services for homeowners. Trusted by thousands of families.",
  "cta_headline": "Need a repair? We''re just a booking away.",
  "cta_button": "Schedule Now"
}')
ON CONFLICT (section_key) DO NOTHING;
