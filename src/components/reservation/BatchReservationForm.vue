<script setup lang="ts">
import type { Device } from '@/types/device'
import type { BatchReservationRequest } from '@/types/reservation'
import { RESERVATION_COLORS } from '@/types/reservation'
import { computed, ref } from 'vue'

const props = defineProps<{
  devices: Device[]
}>()

const emit = defineEmits<{
  submit: [data: BatchReservationRequest]
}>()

const deviceIds = ref<number[]>([])
const userName = ref('')
const selectedColor = ref<string>(RESERVATION_COLORS[0])
const title = ref('')
const description = ref('')
const startTime = ref('09:00')
const endTime = ref('10:00')
const dateRangeStart = ref('')
const dateRangeEnd = ref('')
const excludeWeekends = ref(true)

const datePreview = computed(() => {
  if (!dateRangeStart.value || !dateRangeEnd.value) return []
  const dates: string[] = []
  const start = new Date(dateRangeStart.value)
  const end = new Date(dateRangeEnd.value)
  const current = new Date(start)
  while (current <= end) {
    const day = current.getDay()
    if (!excludeWeekends.value || (day !== 0 && day !== 6)) {
      dates.push(current.toISOString().slice(0, 10))
    }
    current.setDate(current.getDate() + 1)
  }
  return dates
})

const selectedDevices = computed(() =>
  props.devices.filter((d) => deviceIds.value.includes(d.id)),
)

function handleSubmit() {
  emit('submit', {
    dates: datePreview.value,
    startTime: startTime.value,
    endTime: endTime.value,
    deviceIds: deviceIds.value,
    userName: userName.value,
    title: title.value,
    description: description.value || undefined,
    color: selectedColor.value,
  })
}
</script>

<template>
  <v-card>
    <v-card-title>
      Batch Reservation / 一括予約登録
    </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="handleSubmit">
        <v-text-field
          v-model="userName"
          label="Your Name / 予約者名"
          required
          prepend-icon="mdi-account"
        />
        <v-text-field
          v-model="title"
          label="Title / タイトル"
          required
          prepend-icon="mdi-format-title"
        />
        <v-textarea
          v-model="description"
          label="Description / 説明"
          prepend-icon="mdi-text-box"
          rows="2"
        />

        <!-- Color picker -->
        <div class="mb-4">
          <label class="v-label mb-2 d-block">Block Color / 予約色</label>
          <div class="d-flex ga-1 flex-wrap">
            <v-btn
              v-for="c in RESERVATION_COLORS"
              :key="c"
              :color="c"
              :variant="selectedColor === c ? 'flat' : 'outlined'"
              size="small"
              icon
              @click="selectedColor = c"
            >
              <v-icon v-if="selectedColor === c" size="small">mdi-check</v-icon>
            </v-btn>
          </div>
        </div>

        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="startTime"
              label="Start Time / 開始時間"
              type="time"
              required
              prepend-icon="mdi-clock-start"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="endTime"
              label="End Time / 終了時間"
              type="time"
              :min="startTime"
              required
              prepend-icon="mdi-clock-end"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="dateRangeStart"
              label="From Date / 開始日"
              type="date"
              required
              prepend-icon="mdi-calendar-start"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="dateRangeEnd"
              label="To Date / 終了日"
              type="date"
              :min="dateRangeStart"
              required
              prepend-icon="mdi-calendar-end"
            />
          </v-col>
        </v-row>
        <v-checkbox
          v-model="excludeWeekends"
          label="Exclude weekends / 土日を除く"
          density="compact"
        />
        <v-select
          v-model="deviceIds"
          label="Devices / 装置選択"
          :items="devices"
          item-title="name"
          item-value="id"
          multiple
          chips
          required
          prepend-icon="mdi-microscope"
        />
      </v-form>

      <!-- Preview -->
      <v-divider class="my-4" />
      <div class="text-subtitle-2 mb-2">
        Preview / プレビュー ({{ datePreview.length }} days x {{ selectedDevices.length }} devices = {{ datePreview.length * selectedDevices.length }} reservations)
      </div>
      <div
        v-if="datePreview.length === 0"
        class="text-body-2 text-grey"
      >
        Select a date range to see preview / 日付範囲を選択してください
      </div>
      <v-table
        v-else
        density="compact"
      >
        <thead>
          <tr>
            <th>Date</th>
            <th
              v-for="d in selectedDevices"
              :key="d.id"
            >
              {{ d.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="dt in datePreview.slice(0, 14)"
            :key="dt"
          >
            <td>{{ dt }}</td>
            <td
              v-for="d in selectedDevices"
              :key="d.id"
            >
              <v-chip
                size="x-small"
                :color="d.color"
                text-color="white"
              >
                {{ startTime }}-{{ endTime }}
              </v-chip>
            </td>
          </tr>
        </tbody>
      </v-table>
      <div
        v-if="datePreview.length > 14"
        class="text-caption text-grey mt-1"
      >
        ... and {{ datePreview.length - 14 }} more days
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        color="primary"
        :disabled="datePreview.length === 0 || deviceIds.length === 0 || !title"
        @click="handleSubmit"
      >
        Create Batch / 一括作成
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
