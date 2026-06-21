export interface User {
  id: number
  username: string
  displayName: string
  email: string
  role: 'admin' | 'user'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserRequest {
  username: string
  displayName: string
  email?: string
  password?: string // only when creating or changing password
  role?: 'admin' | 'user'
}
