<script setup lang="ts">
import type { Device } from '@/types/device'
import { DEVICE_CATEGORIES } from '@/types/device'
import { ref, computed } from 'vue'

 
const props = defineProps<{
  devices: Device[]
  viewMode: 'day' | 'week' | 'month'
  currentDate: string
}>()

const emit = defineEmits<{
  'update:viewMode': [mode: 'day' | 'week' | 'month']
  'update:currentDate': [date: string]
  'update:selectedCategories': [categories: string[]]
}>()

const selectedCategories = ref<string[]>([])

const formattedDate = computed(() => {
  const d = new Date(props.currentDate)
  if (props.viewMode === 'day') {
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
})

function goPrev() {
  const d = new Date(props.currentDate)
  if (props.viewMode === 'day') d.setDate(d.getDate() - 1)
  else if (props.viewMode === 'week') d.setDate(d.getDate() - 7)
  else d.setMonth(d.getMonth() - 1)
  emit('update:currentDate', d.toISOString().slice(0, 10))
}

function goNext() {
  const d = new Date(props.currentDate)
  if (props.viewMode === 'day') d.setDate(d.getDate() + 1)
  else if (props.viewMode === 'week') d.setDate(d.getDate() + 7)
  else d.setMonth(d.getMonth() + 1)
  emit('update:currentDate', d.toISOString().slice(0, 10))
}

function goToday() {
  emit('update:currentDate', new Date().toISOString().slice(0, 10))
}

function toggleCategory(cat: string) {
  const idx = selectedCategories.value.indexOf(cat)
  if (idx >= 0) {
    selectedCategories.value.splice(idx, 1)
  } else {
    selectedCategories.value.push(cat)
  }
  emit('update:selectedCategories', [...selectedCategories.value])
}

function selectAll() {
  selectedCategories.value = []
  emit('update:selectedCategories', [])
}
</script>

<template>
  <div class="calendar-toolbar">
    <!-- Top row: navigation + view mode -->
    <div class="d-flex align-center flex-wrap ga-2 mb-3">
      <v-btn-group density="compact">
        <v-btn
          icon="mdi-chevron-left"
          size="small"
          @click="goPrev"
        />
        <v-btn
          size="small"
          @click="goToday"
        >
          Today / 今日
        </v-btn>
        <v-btn
          icon="mdi-chevron-right"
          size="small"
          @click="goNext"
        />
      </v-btn-group>

      <span class="text-h6 text-primary font-weight-bold">{{ formattedDate }}</span>
      <v-spacer />

      <v-btn-group density="compact">
        <v-btn
          :variant="viewMode === 'day' ? 'tonal' : 'text'"
          size="small"
          @click="emit('update:viewMode', 'day')"
        >
          Day / 日
        </v-btn>
        <v-btn
          :variant="viewMode === 'week' ? 'tonal' : 'text'"
          size="small"
          @click="emit('update:viewMode', 'week')"
        >
          Week / 週
        </v-btn>
        <v-btn
          :variant="viewMode === 'month' ? 'tonal' : 'text'"
          size="small"
          @click="emit('update:viewMode', 'month')"
        >
          Month / 月
        </v-btn>
      </v-btn-group>
    </div>

    <!-- Category filter tabs -->
    <div class="d-flex align-center flex-wrap ga-1">
      <v-chip
        :color="selectedCategories.length === 0 ? 'primary' : ''"
        :variant="selectedCategories.length === 0 ? 'tonal' : 'outlined'"
        size="small"
        @click="selectAll"
      >
        All / 全部
      </v-chip>
      <v-chip
        v-for="cat in DEVICE_CATEGORIES"
        :key="cat.value"
        :color="selectedCategories.includes(cat.value) ? cat.color : undefined"
        :variant="selectedCategories.includes(cat.value) ? 'tonal' : 'outlined'"
        size="small"
        @click="toggleCategory(cat.value)"
      >
        {{ cat.title }}
      </v-chip>
    </div>
  </div>
</template>

<style scoped>
.calendar-toolbar {
  flex-wrap: wrap;
}
</style>
