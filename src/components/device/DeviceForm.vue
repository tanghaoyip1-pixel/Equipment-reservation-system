<script setup lang="ts">
import type { Device, DeviceRequest } from '@/types/device'
import { DEVICE_CATEGORIES } from '@/types/device'
import { ref, watch } from 'vue'

const props = defineProps<{
  device?: Device | null
  isNew?: boolean
}>()

const emit = defineEmits<{
  save: [data: DeviceRequest]
  cancel: []
}>()

const category = ref('')
const name = ref('')
const description = ref('')
const location = ref('')
const color = ref('#1867C0')
const status = ref<'active' | 'maintenance' | 'retired'>('active')

const colors = [
  '#1867C0', '#E53935', '#43A047', '#FB8C00',
  '#8E24AA', '#00ACC1', '#6D4C41', '#546E7A',
]

watch(
  () => props.device,
  (d) => {
    if (d) {
      category.value = d.category || ''
      name.value = d.name
      description.value = d.description || ''
      location.value = d.location || ''
      color.value = d.color || '#1867C0'
      status.value = d.status || 'active'
    } else {
      category.value = ''
      name.value = ''
      description.value = ''
      location.value = ''
      color.value = '#1867C0'
      status.value = 'active'
    }
  },
  { immediate: true },
)

function handleSave() {
  emit('save', {
    category: category.value,
    name: name.value,
    description: description.value || undefined,
    location: location.value || undefined,
    color: color.value,
    status: status.value,
  })
}
</script>

<template>
  <v-card>
    <v-card-title>
      {{ isNew ? 'New Device / 新規装置' : 'Edit Device / 装置編集' }}
    </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="handleSave">
        <v-select
          v-model="category"
          label="Category / 装置種類"
          :items="DEVICE_CATEGORIES"
          required
          prepend-icon="mdi-shape"
        />
        <v-text-field
          v-model="name"
          label="Device Name / 装置名"
          required
          prepend-icon="mdi-microscope"
        />
        <v-textarea
          v-model="description"
          label="Description / 説明"
          prepend-icon="mdi-text-box"
          rows="2"
        />
        <v-text-field
          v-model="location"
          label="Location / 設置場所"
          prepend-icon="mdi-map-marker"
        />
        <div class="mb-4">
          <label class="v-label mb-2 d-block">Color / カラー</label>
          <div class="d-flex gap-1 flex-wrap">
            <v-btn
              v-for="c in colors"
              :key="c"
              :color="c"
              :variant="color === c ? 'flat' : 'outlined'"
              size="small"
              icon
              @click="color = c"
            >
              <v-icon
                v-if="color === c"
                size="small"
              >
                mdi-check
              </v-icon>
            </v-btn>
          </div>
        </div>
        <v-select
          v-model="status"
          label="Status / ステータス"
          prepend-icon="mdi-information"
          :items="[
            { title: 'Active / 利用可', value: 'active' },
            { title: 'Maintenance / メンテナンス中', value: 'maintenance' },
            { title: 'Retired / 廃止', value: 'retired' },
          ]"
        />
      </v-form>
    </v-card-text>
    <v-card-actions>
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
</template>
