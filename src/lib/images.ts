// Centralized image URLs — easy to swap by editing this file only
export const IMAGES = {
  hero: {
    main: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1920&q=85',
    secondary: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
    tools: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=80',
  },
  about: {
    main: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80',
    technician: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80',
  },
  services: {
    general: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
    plumbing: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80',
    electrical: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
    drywall: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80',
    furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    consultation: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
  },
  trust: {
    team: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
  },
}

export function getServiceImage(serviceName: string): string {
  const name = serviceName.toLowerCase()
  if (name.includes('plumb')) return IMAGES.services.plumbing
  if (name.includes('electric')) return IMAGES.services.electrical
  if (name.includes('drywall') || name.includes('paint')) return IMAGES.services.drywall
  if (name.includes('furniture') || name.includes('assembl')) return IMAGES.services.furniture
  if (name.includes('consult') || name.includes('inspect')) return IMAGES.services.consultation
  return IMAGES.services.general
}
