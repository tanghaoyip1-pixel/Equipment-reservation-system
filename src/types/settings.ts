export interface AppSettings {
  id?: number
  key: string
  value: string // JSON-encoded value
  updatedAt?: string
}

export interface ResolvedSettings {
  defaultViewMode: 'day' | 'week' | 'month'
  timeSlotDuration: number // minutes
  workingHoursStart: string // 'HH:mm'
  workingHoursEnd: string // 'HH:mm'
  allowOverlappingReservations: boolean
  appName: string
}
