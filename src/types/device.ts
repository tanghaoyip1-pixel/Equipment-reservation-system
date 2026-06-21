export interface Device {
  id: number
  category: string
  name: string
  description: string
  location: string
  color: string
  status: 'active' | 'maintenance' | 'retired'
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface DeviceRequest {
  category: string
  name: string
  description?: string
  location?: string
  color?: string
  status?: 'active' | 'maintenance' | 'retired'
}

// Category definitions with display names and colors
export const DEVICE_CATEGORIES = [
  { value: 'furnace',       title: 'Furnace / 電気炉',                   color: '#E53935' },
  { value: 'laser_system',  title: 'Laser System / レーザーシステム',     color: '#8E24AA' },
  { value: 'laser',         title: 'Laser / レーザー',                   color: '#00ACC1' },
  { value: 'measurement',   title: 'Measurement System / 測定装置',       color: '#43A047' },
  { value: 'others',        title: 'Others / その他',                    color: '#546E7A' },
] as const

export function getCategoryColor(category: string): string {
  const cat = DEVICE_CATEGORIES.find((c) => c.value === category)
  return cat?.color ?? '#546E7A'
}

export type DeviceCategory = (typeof DEVICE_CATEGORIES)[number]['value']

export function getCategoryTitle(category: string): string {
  const cat = DEVICE_CATEGORIES.find((c) => c.value === category)
  return cat?.title ?? category
}
