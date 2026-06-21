<script setup lang="ts">
import { useDeviceStore } from '@/stores/device'
import { useReservationStore } from '@/stores/reservation'
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import type { ReservationRequest } from '@/types/reservation'
import type { Reservation } from '@/types/reservation'

const router = useRouter()
const deviceStore = useDeviceStore()
const reservationStore = useReservationStore()

const viewMode = ref<'day' | 'week' | 'month'>('day')
const selectedCategories = ref<string[]>([])
const currentDate = ref(new Date().toISOString().slice(0, 10))
const reservationFormOpen = ref(false)
const editReservation = ref<Reservation | null>(null)
const slotDefaults = ref({ deviceId: 0, date: '', startTime: '09:00', endTime: '10:00' })

const { reservations } = storeToRefs(reservationStore)
const { devices } = storeToRefs(deviceStore)

// ---- Date helpers (all local-time, no UTC) ----
function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
function startOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return d.toISOString().slice(0, 10)
}
function endOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? 0 : 7 - day))
  return d.toISOString().slice(0, 10)
}
function endOfMonth(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setMonth(d.getMonth() + 1, 0)
  return d.toISOString().slice(0, 10)
}

function getRangeFrom(): string {
  if (viewMode.value === 'day') return `${currentDate.value}T00:00:00`
  return `${startOfWeek(currentDate.value)}T00:00:00`
}
function getRangeTo(): string {
  if (viewMode.value === 'day') return `${currentDate.value}T23:59:59`
  if (viewMode.value === 'week') return `${endOfWeek(currentDate.value)}T23:59:59`
  return `${endOfMonth(currentDate.value)}T23:59:59`
}

async function loadData() {
  await deviceStore.fetchAllDevices()
  await reservationStore.fetchByRange(getRangeFrom(), getRangeTo())
}

watch([viewMode, currentDate], loadData, { immediate: true })

// ---- Handlers ----
function handleSelectSlot(payload: { deviceId: number; date: string; startTime: string; endTime: string }) {
  slotDefaults.value = { ...payload }
  editReservation.value = null
  reservationFormOpen.value = true
}

function handleSelectReservation(id: number) {
  const r = reservations.value.find((x: Reservation) => x.id === id)
  if (r) {
    editReservation.value = r
    reservationFormOpen.value = true
  }
}

async function handleSaveReservation(data: ReservationRequest) {
  if (editReservation.value?.id) {
    await reservationStore.updateReservation(editReservation.value.id, data)
  } else {
    await reservationStore.createReservation(data)
  }
  reservationFormOpen.value = false
  await loadData()
}

async function handleDeleteReservation(id: number) {
  await reservationStore.deleteReservation(id)
  reservationFormOpen.value = false
  await loadData()
}
</script>

<template>
  <div>
    <CalendarToolbar
      :devices="devices"
      :view-mode="viewMode"
      :current-date="currentDate"
      @update:view-mode="viewMode = $event"
      @update:current-date="currentDate = $event"
      @update:selected-categories="selectedCategories = $event"
      @batch="router.push('/reservations/batch')"
    />

    <v-progress-linear
      v-if="deviceStore.isLoading || reservationStore.isLoading"
      indeterminate
      color="primary"
      class="mb-2"
    />

    <CalendarGrid
      :devices="devices"
      :reservations="reservations"
      :view-mode="viewMode"
      :current-date="currentDate"
      :selected-categories="selectedCategories"
      @select-slot="handleSelectSlot"
      @select-reservation="handleSelectReservation"
    />

    <ReservationForm
      v-model:is-open="reservationFormOpen"
      :devices="devices"
      :reservation="editReservation"
      :default-date="slotDefaults.date"
      :default-start="slotDefaults.startTime"
      :default-end="slotDefaults.endTime"
      :default-device-id="slotDefaults.deviceId"
      @save="handleSaveReservation"
      @delete="handleDeleteReservation"
      @cancel="reservationFormOpen = false"
    />
  </div>
</template>
