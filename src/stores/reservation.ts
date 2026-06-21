import { defineStore } from 'pinia'
import { ref } from 'vue'
import { get, post, put, del } from '@/services/api/api-requests'
import type {
  Reservation,
  ReservationRequest,
  BatchReservationRequest,
  ConflictCheckResult,
} from '@/types/reservation'

export const useReservationStore = defineStore('reservation', () => {
  const reservations = ref<Reservation[]>([])
  const selectedReservation = ref<Reservation | null>(null)
  const isLoading = ref(false)

  async function fetchByRange(
    from: string,
    to: string,
    deviceId?: number,
  ): Promise<Reservation[]> {
    isLoading.value = true
    try {
      let url = `/reservations?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      if (deviceId) {
        url += `&deviceId=${deviceId}`
      }
      const response = await get(url)
      reservations.value = response.data.items || response.data || []
      return reservations.value
    } finally {
      isLoading.value = false
    }
  }

  async function fetchReservation(id: number): Promise<Reservation> {
    const response = await get(`/reservations/${id}`)
    const reservation = response.data.content || response.data
    selectedReservation.value = reservation
    return reservation
  }

  async function createReservation(
    data: ReservationRequest,
  ): Promise<Reservation> {
    const response = await post('/reservations', data)
    const reservation = response.data.content || response.data
    reservations.value.push(reservation)
    return reservation
  }

  async function updateReservation(
    id: number,
    data: ReservationRequest,
  ): Promise<Reservation> {
    const response = await put(`/reservations/${id}`, data)
    const reservation = response.data.content || response.data
    const index = reservations.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      reservations.value[index] = reservation
    }
    selectedReservation.value = reservation
    return reservation
  }

  async function deleteReservation(id: number): Promise<void> {
    await del(`/reservations/${id}`)
    reservations.value = reservations.value.filter((r) => r.id !== id)
    if (selectedReservation.value?.id === id) {
      selectedReservation.value = null
    }
  }

  async function createBatchReservations(
    data: BatchReservationRequest,
  ): Promise<{ created: Reservation[]; skipped: any[] }> {
    const response = await post('/reservations/batch', data)
    const newReservations = response.data.items || []
    const skipped = response.data.skipped || []
    reservations.value.push(...newReservations)
    return { created: newReservations, skipped }
  }

  async function checkConflicts(
    deviceId: number,
    startTime: string,
    endTime: string,
    excludeId?: number,
  ): Promise<ConflictCheckResult> {
    let url = `/reservations/check-conflicts?device_id=${deviceId}&start_time=${encodeURIComponent(startTime)}&end_time=${encodeURIComponent(endTime)}`
    if (excludeId) {
      url += `&exclude_id=${excludeId}`
    }
    const response = await get(url)
    return response.data.content || response.data
  }

  return {
    reservations,
    selectedReservation,
    isLoading,
    fetchByRange,
    fetchReservation,
    createReservation,
    updateReservation,
    deleteReservation,
    createBatchReservations,
    checkConflicts,
  }
})
