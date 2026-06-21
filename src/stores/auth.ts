import { ref } from 'vue'
import { post } from '@/services/api/api-requests'
import type { User } from '@/types/user'

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true'

export const userIsLoading = ref(true)
export const isAuthenticated = ref(false)
export const currentUser = ref<User | null>(null)

// Mock data for dev mode
const mockUser: User = {
  id: 1,
  username: 'admin',
  displayName: 'Admin (Dev)',
  email: 'admin@ono-lab.local',
  role: 'admin',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export function useAuth() {
  const LOCAL_STORAGE_TOKEN_KEY = 'auth_token'
  const LOCAL_STORAGE_REFRESH_KEY = 'refresh_token'
  const LOCAL_STORAGE_USER_KEY = 'auth_user'
  const isInitialized = ref(false)
  const token = ref<string | null>(null)
  const refreshTokenValue = ref<string | null>(null)

  const init = async () => {
    const savedToken = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
    const savedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY)
    if (savedToken && savedUser) {
      token.value = savedToken
      refreshTokenValue.value = localStorage.getItem(LOCAL_STORAGE_REFRESH_KEY)
      try {
        currentUser.value = JSON.parse(savedUser)
        isAuthenticated.value = true
      } catch {
        clearAuth()
      }
    }

    // Dev mode: auto-login if not authenticated
    if (DEV_MODE && !isAuthenticated.value) {
      devLogin()
    }

    isInitialized.value = true
    userIsLoading.value = false
  }

  const devLogin = () => {
    token.value = 'dev-mock-token'
    refreshTokenValue.value = 'dev-mock-refresh-token'
    currentUser.value = mockUser
    isAuthenticated.value = true
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, 'dev-mock-token')
    localStorage.setItem(LOCAL_STORAGE_REFRESH_KEY, 'dev-mock-refresh-token')
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockUser))
  }

  const login = async (username: string, password: string) => {
    if (DEV_MODE) {
      devLogin()
      return
    }
    const response = await post('/auth/login', { username, password })
    const data = response.data.content || response.data
    token.value = data.access_token
    refreshTokenValue.value = data.refresh_token
    currentUser.value = data.user
    isAuthenticated.value = true
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, data.access_token)
    if (data.refresh_token) {
      localStorage.setItem(LOCAL_STORAGE_REFRESH_KEY, data.refresh_token)
    }
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(data.user))
  }

  const logout = async () => {
    if (!DEV_MODE) {
      try {
        if (refreshTokenValue.value) {
          await post('/auth/logout', {
            refresh_token: refreshTokenValue.value,
          })
        }
      } catch {
        // Ignore logout errors
      }
    }
    clearAuth()
    window.location.href = '/logged-out'
  }

  const clearAuth = () => {
    isAuthenticated.value = false
    token.value = null
    refreshTokenValue.value = null
    currentUser.value = null
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
    localStorage.removeItem(LOCAL_STORAGE_REFRESH_KEY)
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY)
  }

  const getToken = (): string | null => {
    return token.value || localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
  }

  const renewToken = async () => {
    if (DEV_MODE) return { succ: true, msg: 'Dev mode' }
    if (!refreshTokenValue.value) {
      return { succ: false, msg: 'No refresh token available' }
    }
    try {
      const response = await post('/auth/refresh', {
        refresh_token: refreshTokenValue.value,
      })
      const data = response.data.content || response.data
      token.value = data.access_token
      if (data.refresh_token) {
        refreshTokenValue.value = data.refresh_token
        localStorage.setItem(LOCAL_STORAGE_REFRESH_KEY, data.refresh_token)
      }
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, data.access_token)
      return { succ: true, msg: 'Token successfully updated.' }
    } catch {
      clearAuth()
      return { succ: false, msg: "Token wasn't successfully updated." }
    }
  }

  const hasRole = (role: string): boolean => {
    return currentUser.value?.role === role
  }

  return {
    init,
    isInitialized,
    isAuthenticated,
    currentUser,
    token,
    refreshTokenValue,
    login,
    logout,
    getToken,
    renewToken,
    hasRole,
    isLoading: userIsLoading,
  }
}

export const auth = useAuth()
