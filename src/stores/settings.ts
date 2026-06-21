import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { get, put } from '@/services/api/api-requests'
import type { AppSettings, ResolvedSettings } from '@/types/settings'
import { useAdmin } from '@/stores/admin'

const { getPassword } = useAdmin()

function adminHeaders(): Record<string, string> {
  const pw = getPassword()
  return pw ? { 'X-Admin-Password': pw } : {}
}

export const useSettingsStore = defineStore('settings', () => {
  const settingsMap = ref<Record<string, string>>({})
  const isLoading = ref(false)

  // Default values
  const defaults: ResolvedSettings = {
    defaultViewMode: 'week',
    timeSlotDuration: 30,
    workingHoursStart: '08:00',
    workingHoursEnd: '20:00',
    allowOverlappingReservations: false,
    appName: 'Ono Lab - Equipment Reservation',
  }

  async function fetchSettings(): Promise<void> {
    isLoading.value = true
    try {
      const response = await get('/settings')
      const items = response.data.items || response.data || []
      const map: Record<string, string> = {}
      if (Array.isArray(items)) {
        items.forEach((s: AppSettings) => {
          map[s.key] = s.value
        })
      }
      settingsMap.value = map
    } finally {
      isLoading.value = false
    }
  }

  async function updateSettings(
    data: Record<string, unknown>,
  ): Promise<void> {
    const response = await put('/settings', data, adminHeaders())
    const items = response.data.items || [response.data]
    if (Array.isArray(items)) {
      items.forEach((s: AppSettings) => {
        settingsMap.value[s.key] = s.value
      })
    } else {
      Object.entries(data).forEach(([key, value]) => {
        settingsMap.value[key] = String(value)
      })
    }
  }

  function getSetting<T = string>(key: string, defaultValue?: T): T {
    const raw = settingsMap.value[key]
    if (raw === undefined) return defaultValue as T
    try {
      return JSON.parse(raw) as T
    } catch {
      return raw as T
    }
  }

  const defaultViewMode = computed(
    () =>
      getSetting<string>('default_view_mode', defaults.defaultViewMode) as
        | 'day'
        | 'week'
        | 'month',
  )
  const timeSlotDuration = computed(() =>
    getSetting<number>('time_slot_duration', defaults.timeSlotDuration),
  )
  const workingHoursStart = computed(() =>
    getSetting<string>('working_hours_start', defaults.workingHoursStart),
  )
  const workingHoursEnd = computed(() =>
    getSetting<string>('working_hours_end', defaults.workingHoursEnd),
  )
  const allowOverlappingReservations = computed(() =>
    getSetting<boolean>(
      'allow_overlapping',
      defaults.allowOverlappingReservations,
    ),
  )
  const appName = computed(() =>
    getSetting<string>('app_name', defaults.appName),
  )

  return {
    settingsMap,
    isLoading,
    fetchSettings,
    updateSettings,
    getSetting,
    defaultViewMode,
    timeSlotDuration,
    workingHoursStart,
    workingHoursEnd,
    allowOverlappingReservations,
    appName,
  }
})
