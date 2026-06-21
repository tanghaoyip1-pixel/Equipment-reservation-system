export const RESERVATION_COLORS = [
  '#E53935', '#43A047', '#1E88E5', '#FB8C00',
  '#8E24AA', '#00ACC1', '#6D4C41',
]

export interface Reservation {
  id: number
  deviceId: number
  deviceName: string
  deviceColor: string
  color?: string       // user-selected reservation block color
  userId?: number
  userName: string
  title: string
  description: string
  startTime: string
  endTime: string
  status: 'confirmed' | 'cancelled'
  batchId: string | null
  createdAt: string
  updatedAt: string
}

export interface ReservationRequest {
  deviceId: number
  userName: string
  title: string
  description?: string
  color?: string        // user-selected reservation block color
  startTime: string
  endTime: string
}

export interface BatchReservationRequest {
  dates: string[]
  startTime: string
  endTime: string
  deviceIds: number[]
  userName: string
  title: string
  description?: string
  color?: string
}

export interface ConflictCheckResult {
  hasConflict: boolean
  conflicts: Reservation[]
}
