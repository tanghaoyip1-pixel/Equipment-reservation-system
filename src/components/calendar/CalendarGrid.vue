<script setup lang="ts">
import type { Device } from '@/types/device'
import type { Reservation } from '@/types/reservation'
import { computed, ref } from 'vue'
import { DEVICE_CATEGORIES, getCategoryColor } from '@/types/device'

const props = defineProps<{
  devices: Device[]
  reservations: Reservation[]
  viewMode: 'day' | 'week' | 'month'
  currentDate: string
  selectedCategories?: string[]
}>()

const emit = defineEmits<{
  'select-slot': [
    payload: {
      deviceId: number
      date: string
      startTime: string
      endTime: string
    },
  ]
  'select-reservation': [id: number]
}>()

// ---- Resizable device column ----
const deviceColWidth = ref(220)
const isDragging = ref(false)
let dragStartX = 0
let dragStartWidth = 0

function startResize(e: MouseEvent) {
  isDragging.value = true
  dragStartX = e.clientX
  dragStartWidth = deviceColWidth.value
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopResize)
  e.preventDefault()
}

function onDrag(e: MouseEvent) {
  const delta = e.clientX - dragStartX
  deviceColWidth.value = Math.max(140, Math.min(500, dragStartWidth + delta))
}

function stopResize() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopResize)
}

// ---- Filter / group devices ----
const filteredDevices = computed(() => {
  if (!props.selectedCategories || props.selectedCategories.length === 0)
    return props.devices
  return props.devices.filter((d) =>
    props.selectedCategories!.includes(d.category),
  )
})

const deviceGroups = computed(() => {
  const groups: { category: string; title: string; devices: Device[] }[] = []
  for (const cat of DEVICE_CATEGORIES) {
    const devs = filteredDevices.value.filter((d) => d.category === (cat.value as string))
    if (devs.length > 0) groups.push({ category: cat.value, title: cat.title, devices: devs })
  }
  const knownCats: string[] = DEVICE_CATEGORIES.map((c) => c.value)
  const unknownDevs = filteredDevices.value.filter((d) => !knownCats.includes(d.category))
  if (unknownDevs.length > 0)
    groups.push({ category: 'other', title: 'Other / その他', devices: unknownDevs })
  return groups
})

// ---- Week View ----
const weekDays = computed(() => {
  const d = new Date(props.currentDate)
  const dayOfWeek = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  const days: { date: string; label: string }[] = []
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday)
    cur.setDate(monday.getDate() + i)
    days.push({
      date: cur.toISOString().slice(0, 10),
      label: cur.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' }),
    })
  }
  return days
})

// ---- Month View ----
const monthDays = computed(() => {
  const d = new Date(props.currentDate)
  const year = d.getFullYear()
  const month = d.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()
  const lastDay = new Date(year, month + 1, 0)
  const days: (string | null)[] = []
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let i = 1; i <= lastDay.getDate(); i++)
    days.push(new Date(year, month, i).toISOString().slice(0, 10))
  return days
})

// ---- Day View ----
const dayHours = computed(() => {
  const hours: string[] = []
  for (let h = 0; h <= 23; h++) hours.push(`${h}`)
  return hours
})

// ---- Reservation overlap helpers ----
/** Check if a reservation overlaps with a given calendar day (for week view) */
function overlapsDay(r: Reservation, dateStr: string): boolean {
  if (r.status === 'cancelled') return false
  const dayStart = `${dateStr}T00:00:00`
  const d = new Date(dateStr)
  d.setDate(d.getDate() + 1)
  const nextDay = d.toISOString().slice(0, 10)
  const dayEnd = `${nextDay}T00:00:00`
  return r.startTime < dayEnd && r.endTime > dayStart
}

/** Check if a reservation overlaps with a given hour slot (for day view) */
function overlapsHour(r: Reservation, dateStr: string, hour: number): boolean {
  if (r.status === 'cancelled') return false
  const slotStart = `${dateStr}T${String(hour).padStart(2, '0')}:00:00`
  const slotEnd = `${dateStr}T${String(hour + 1).padStart(2, '0')}:00:00`
  return r.startTime < slotEnd && r.endTime > slotStart
}

function getReservationsForDay(deviceId: number, dateStr: string): Reservation[] {
  return props.reservations.filter(
    (r) => r.deviceId === deviceId && overlapsDay(r, dateStr),
  )
}

function getReservationsForHour(deviceId: number, dateStr: string, hour: number): Reservation[] {
  return props.reservations.filter(
    (r) => r.deviceId === deviceId && overlapsHour(r, dateStr, hour),
  )
}

// Display label for cross-midnight reservations
function formatTimeRange(r: Reservation): string {
  const s = r.startTime.slice(11, 16)
  const e = r.endTime.slice(11, 16)
  const sDate = r.startTime.slice(5, 10)
  const eDate = r.endTime.slice(5, 10)
  if (sDate !== eDate) return `${s}→${e}`
  return `${s}-${e}`
}

function handleSlotClick(deviceId: number, dateStr: string, hour?: number) {
  const h = hour ?? new Date().getHours()
  emit('select-slot', {
    deviceId,
    date: dateStr,
    startTime: `${String(h).padStart(2, '0')}:00`,
    endTime: `${String(h + 1).padStart(2, '0')}:00`,
  })
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10)
}

// Day view: compute reservation position (% of 24h)
function timeToMinutes(time: string): number {
  // time = "2026-06-20T14:30:00"
  const h = parseInt(time.slice(11, 13))
  const m = parseInt(time.slice(14, 16))
  return h * 60 + m
}

function dayReservationStyle(r: Reservation): Record<string, string> {
  const startDate = r.startTime.slice(0, 10)
  const endDate = r.endTime.slice(0, 10)

  let start = timeToMinutes(r.startTime)
  let end = timeToMinutes(r.endTime)

  if (startDate < props.currentDate) start = 0
  if (endDate > props.currentDate) end = 24 * 60

  return {
    left: `${(start / (24 * 60)) * 100}%`,
    width: `${((end - start) / (24 * 60)) * 100}%`,
    backgroundColor: r.color || r.deviceColor || '#1867C0',
  }
}

// Get all reservations for a device on a given day (merged for day view)
function getDeviceDayReservations(deviceId: number, dateStr: string): Reservation[] {
  return props.reservations.filter(
    (r) => r.deviceId === deviceId && r.status !== 'cancelled' && overlapsDay(r, dateStr),
  )
}
</script>

<template>
  <div class="calendar-grid-container">
    <!-- Resize bar: spans full column height -->
    <div
      class="resize-bar"
      :style="{ left: deviceColWidth + 'px' }"
      @mousedown="startResize"
    />

    <!-- WEEK VIEW -->
    <div
      v-if="viewMode === 'week'"
      class="week-grid"
    >
      <div
        class="grid-table"
        :style="{ gridTemplateColumns: `${deviceColWidth}px repeat(7, 1fr)` }"
      >
        <div class="grid-header-row">
          <div class="sticky-device-col device-col-header">
            Device / 装置
          </div>
          <div
            v-for="day in weekDays"
            :key="day.date"
            class="grid-header-cell"
            :class="{ today: isToday(day.date) }"
          >
            {{ day.label }}
          </div>
        </div>
        <template
          v-for="group in deviceGroups"
          :key="group.category"
        >
          <div class="grid-data-row">
            <div
              class="sticky-device-col category-header"
              :style="{ borderLeft: `4px solid ${getCategoryColor(group.category)}` }"
            >
              {{ group.title }}
            </div>
            <div
              v-for="day in weekDays"
              :key="day.date"
              class="grid-data-cell category-header-cell"
            />
          </div>
          <div
            v-for="device in group.devices"
            :key="device.id"
            class="grid-data-row"
          >
            <div
              class="sticky-device-col device-label"
              :style="{ borderLeft: `4px solid ${getCategoryColor(device.category)}` }"
            >
              {{ device.name }}
            </div>
            <div
              v-for="day in weekDays"
              :key="day.date"
              class="grid-data-cell week-readonly"
              :class="{ today: isToday(day.date) }"
            >
              <div
                v-for="r in getReservationsForDay(device.id, day.date)"
                :key="r.id"
                class="reservation-block"
                :style="{ backgroundColor: r.color || r.deviceColor || '#1867C0' }"
                @click.stop="emit('select-reservation', r.id)"
              >
                <span class="text-truncate">{{ r.userName }}</span>
                <span class="reservation-time">{{ formatTimeRange(r) }}</span>
              </div>
            </div>
          </div>
        </template>
        <div
          v-if="filteredDevices.length === 0"
          class="text-center pa-8 text-grey"
          style="grid-column:1/-1"
        >
          No devices / 装置なし
        </div>
      </div>
    </div>

    <!-- DAY VIEW (continuous reservation blocks) -->
    <div
      v-if="viewMode === 'day'"
      class="day-grid"
    >
      <!-- Hour header row -->
      <div
        class="day-hour-header"
        :style="{ marginLeft: deviceColWidth + 'px' }"
      >
        <div
          v-for="h in dayHours"
          :key="h"
          class="day-hour-label"
        >
          {{ h }}
        </div>
      </div>

      <!-- Device rows grouped by category -->
      <template
        v-for="group in deviceGroups"
        :key="group.category"
      >
        <div
          class="day-cat-header"
          :style="{ width: deviceColWidth + 'px', borderLeft: `4px solid ${getCategoryColor(group.category)}` }"
        >
          {{ group.title }}
        </div>
        <div
          v-for="device in group.devices"
          :key="device.id"
          class="day-device-row"
        >
          <!-- Device name -->
          <div
            class="day-device-name"
            :style="{ width: deviceColWidth + 'px', borderLeft: `4px solid ${getCategoryColor(device.category)}` }"
          >
            {{ device.name }}
          </div>
          <!-- Reservation area with click grid + overlay -->
          <div class="day-reservation-area">
            <!-- Click target grid (24 columns, hours 0-23) -->
            <div class="day-click-grid">
              <div
                v-for="i in 24"
                :key="i"
                class="day-click-cell"
                @click="handleSlotClick(device.id, currentDate, i - 1)"
              />
            </div>
            <!-- Continuous reservation blocks -->
            <div
              v-for="r in getDeviceDayReservations(device.id, currentDate)"
              :key="r.id"
              class="day-reservation-block"
              :style="dayReservationStyle(r)"
              @click.stop="emit('select-reservation', r.id)"
            >
              <span class="day-reservation-label">{{ r.userName }} {{ r.title }}</span>
              <span class="day-reservation-time">{{ formatTimeRange(r) }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- MONTH VIEW -->
    <div
      v-if="viewMode === 'month'"
      class="month-grid"
    >
      <div class="month-header-row">
        <div
          v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']"
          :key="d"
          class="month-header-cell text-center font-weight-bold py-2"
        >
          {{ d }}
        </div>
      </div>
      <div class="month-grid-cols">
        <div
          v-for="(day, i) in monthDays"
          :key="i"
          class="month-cell"
          :class="{ today: day && isToday(day), empty: !day }"
        >
          <div
            v-if="day"
            class="month-cell-inner"
          >
            <div class="month-day-num text-caption">
              {{ new Date(day).getDate() }}
            </div>
            <div class="month-reservations">
              <template
                v-for="device in filteredDevices"
                :key="device.id"
              >
                <v-chip
                  v-if="getReservationsForDay(device.id, day).length > 0"
                  :color="device.color || '#1867C0'"
                  size="x-small"
                  class="ma-1"
                >
                  {{ device.name }}
                </v-chip>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-grid-container {
  position: relative;
  overflow-x: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  user-select: none;
}

/* Full-height resize bar */
.resize-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: col-resize;
  z-index: 20;
  background: transparent;
}

.resize-bar:hover {
  background: rgba(144, 202, 249, 0.3);
}

.grid-table {
  display: grid;
  min-width: 800px;
}

.grid-header-row,
.grid-data-row {
  display: contents;
}

.grid-header-cell {
  background: #f5f5f5;
  padding: 3px 2px;
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  border-right: 1px solid #e0e0e0;
  border-bottom: 2px solid #e0e0e0;
}

.grid-header-cell.today {
  background: #e3f2fd;
}

.grid-data-cell {
  padding: 1px;
  min-height: 42px;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.15s;
}

.grid-data-cell:hover {
  background: #fafafa;
}

.grid-data-cell.today {
  background: #f5f9ff;
}

.device-col-header {
  background: #f5f5f5;
  padding: 3px 6px;
  font-weight: 600;
  font-size: 12px;
  border-right: 1px solid #e0e0e0;
  border-bottom: 2px solid #e0e0e0;
}

.category-header {
  padding: 2px 6px;
  background: #fafafa;
  font-size: 12px;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

.category-header-cell {
  background: #fafafa;
  min-height: 20px;
  cursor: default;
}

.sticky-device-col {
  position: sticky;
  left: 0;
  background: #fff;
  z-index: 1;
}

.device-label {
  padding: 2px 6px;
  display: flex;
  align-items: center;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* Reservation block inline */
.reservation-block {
  padding: 1px 3px;
  border-radius: 3px;
  color: white;
  cursor: pointer;
  margin-bottom: 1px;
  overflow: hidden;
  font-size: 10px;
  line-height: 1.3;
  display: flex;
  justify-content: space-between;
}

.reservation-block:hover {
  opacity: 0.85;
}

.reservation-time {
  flex-shrink: 0;
  margin-left: 2px;
  opacity: 0.9;
}

/* === Day View: Continuous Reservation Blocks === */
.day-hour-header {
  display: flex;
  background: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 5;
}

.day-hour-label {
  flex: 1;
  text-align: center;
  padding: 3px 0;
  font-weight: 600;
  font-size: 12px;
  border-right: 1px solid #e0e0e0;
}

.day-cat-header {
  padding: 2px 8px;
  background: #fafafa;
  font-size: 12px;
  font-weight: 700;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.day-device-row {
  display: flex;
  align-items: stretch;
  min-height: 32px;
  border-bottom: 1px solid #f0f0f0;
}

.day-device-name {
  flex-shrink: 0;
  padding: 2px 6px;
  font-size: 12px;
  display: flex;
  align-items: center;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.day-reservation-area {
  flex: 1;
  position: relative;
  min-height: 32px;
}

.day-click-grid {
  display: flex;
  position: absolute;
  inset: 0;
  z-index: 1;
}

.day-click-cell {
  flex: 1;
  border-right: 1px solid #f5f5f5;
  cursor: pointer;
}

.day-click-cell:hover {
  background: rgba(0, 0, 0, 0.03);
}

.day-reservation-block {
  position: absolute;
  top: 2px;
  bottom: 2px;
  border-radius: 3px;
  cursor: pointer;
  z-index: 2;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0 6px;
  min-width: 30px;
}

.day-reservation-block:hover {
  opacity: 0.85;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.6);
}

.day-reservation-label {
  color: white;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.day-reservation-time {
  color: rgba(255, 255, 255, 0.85);
  font-size: 10px;
  flex-shrink: 0;
  margin-left: 4px;
}

/* === Week View Reservation Block === */
.reservation-block {
  padding: 1px 3px;
  border-radius: 3px;
  color: white;
  cursor: pointer;
  margin-bottom: 1px;
  overflow: hidden;
  font-size: 10px;
  line-height: 1.3;
  display: flex;
  justify-content: space-between;
}

.reservation-block:hover {
  opacity: 0.85;
}

.reservation-time {
  flex-shrink: 0;
  margin-left: 2px;
  opacity: 0.9;
}

/* Week view: read-only */
.grid-data-cell.week-readonly {
  cursor: default;
}
.grid-data-cell.week-readonly:hover {
  background: inherit;
}

/* Month Grid — single shared grid via display:contents */
.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.month-header-row,
.month-grid-cols {
  display: contents;
}

.month-header-cell {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  padding: 4px 2px;
}

.month-cell {
  min-height: 70px;
  border: 1px solid #e0e0e0;
  padding: 2px;
  overflow: hidden;
}

.month-cell.empty {
  background: #fafafa;
}

.month-cell.today {
  background: #e3f2fd;
}

.month-day-num {
  font-weight: 600;
}

.month-reservations {
  display: flex;
  flex-wrap: wrap;
}
</style>
