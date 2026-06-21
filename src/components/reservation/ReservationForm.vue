<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Reservation, ReservationRequest } from '@/types/reservation'
import { RESERVATION_COLORS } from '@/types/reservation'
import type { Device } from '@/types/device'
import { DEVICE_CATEGORIES, getCategoryTitle } from '@/types/device'

const props = defineProps<{
  devices: Device[]
  reservation?: Reservation | null
  defaultDate?: string
  defaultStart?: string
  defaultEnd?: string
  defaultDeviceId?: number
}>()

const emit = defineEmits<{
  save: [data: ReservationRequest]
  cancel: []
  delete: [id: number]
}>()

const isOpen = defineModel<boolean>('isOpen', { default: false })

const selectedCategory = ref('')
const deviceId = ref<number>(0)
const userName = ref('')
const selectedColor = ref<string>(RESERVATION_COLORS[0])
const title = ref('')
const description = ref('')
const date = ref(new Date().toISOString().slice(0, 10))
const startTime = ref('09:00')
const endTime = ref('10:00')

// Devices filtered by selected category
const filteredDevices = computed(() => {
  if (!selectedCategory.value) return props.devices
  return props.devices.filter((d) => d.category === selectedCategory.value)
})

watch(
  () => props.reservation,
  (r) => {
    if (r) {
      // Find the device to pre-select its category
      const dev = props.devices.find((d) => d.id === r.deviceId)
      if (dev) selectedCategory.value = dev.category
      deviceId.value = r.deviceId
      userName.value = r.userName || ''
      selectedColor.value = r.color || RESERVATION_COLORS[0]
      title.value = r.title
      description.value = r.description || ''
      date.value = r.startTime.slice(0, 10)
      startTime.value = r.startTime.slice(11, 16)
      endTime.value = r.endTime.slice(11, 16)
    }
  },
  { immediate: true },
)

watch(() => props.defaultDate, (d) => { if (d) date.value = d }, { immediate: true })
watch(() => props.defaultStart, (t) => { if (t) startTime.value = t }, { immediate: true })
watch(() => props.defaultEnd, (t) => { if (t) endTime.value = t }, { immediate: true })
watch(() => props.defaultDeviceId, (id) => {
  if (id) {
    deviceId.value = id
    const dev = props.devices.find((d) => d.id === id)
    if (dev) selectedCategory.value = dev.category
  }
}, { immediate: true })

// Reset device when category changes
watch(selectedCategory, () => {
  if (!props.reservation) deviceId.value = 0
})

// Check if end time crosses midnight
const isNextDay = computed(() => endTime.value <= startTime.value)

function handleSave() {
  const start = `${date.value}T${startTime.value}:00`

  // If end ≤ start, assume overnight → next day
  let endDate = date.value
  if (endTime.value <= startTime.value) {
    const d = new Date(date.value)
    d.setDate(d.getDate() + 1)
    endDate = d.toISOString().slice(0, 10)
  }

  const end = `${endDate}T${endTime.value}:00`
  emit('save', {
    deviceId: deviceId.value,
    userName: userName.value,
    title: title.value,
    description: description.value || undefined,
    color: selectedColor.value,
    startTime: start,
    endTime: end,
  })
}

const isEditing = computed(() => !!props.reservation?.id)
</script>

<template>
  <v-dialog
    v-model="isOpen"
    max-width="500"
  >
    <v-card>
      <v-card-title>
        {{ isEditing ? 'Edit Reservation / 予約編集' : 'New Reservation / 新規予約' }}
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleSave">
          <!-- Step 1: Select Category -->
          <v-select
            v-model="selectedCategory"
            label="Category / 装置種類"
            :items="DEVICE_CATEGORIES"
            :disabled="isEditing"
            required
            prepend-icon="mdi-shape"
          />

          <!-- Step 2: Select Device (filtered by category) -->
          <v-select
            v-model="deviceId"
            label="Device / 装置"
            :items="filteredDevices"
            item-title="name"
            item-value="id"
            :disabled="isEditing || !selectedCategory"
            required
            prepend-icon="mdi-microscope"
          />

          <v-divider class="my-2" />

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
                <v-icon
                  v-if="selectedColor === c"
                  size="small"
                >
                  mdi-check
                </v-icon>
              </v-btn>
            </div>
          </div>

          <v-text-field
            v-model="date"
            label="Date / 日付"
            type="date"
            required
            prepend-icon="mdi-calendar"
          />
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="startTime"
                label="Start Time / 開始"
                type="time"
                required
                prepend-icon="mdi-clock-start"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="endTime"
                label="End Time / 終了"
                type="time"
                required
                prepend-icon="mdi-clock-end"
              />
            </v-col>
          </v-row>

          <!-- Overnight hint -->
          <div
            v-if="isNextDay"
            class="text-caption text-primary mb-2"
          >
            ⏱ End time earlier than start → Next day / 開始より早い終了 → 翌日
          </div>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn
          v-if="isEditing"
          color="error"
          variant="tonal"
          @click="emit('delete', reservation!.id!)"
        >
          Delete / 削除
        </v-btn>
        <v-spacer />
        <v-btn
          variant="text"
          @click="emit('cancel')"
        >
          Cancel / キャンセル
        </v-btn>
        <v-btn
          color="primary"
          @click="handleSave"
        >
          Save / 保存
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
