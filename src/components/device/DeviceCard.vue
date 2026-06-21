<script setup lang="ts">
import type { Device } from '@/types/device'
import { getCategoryTitle } from '@/types/device'

defineProps<{
  device: Device
}>()

const emit = defineEmits<{
  edit: [id: number]
  delete: [id: number]
}>()

const statusColors: Record<string, string> = {
  active: 'success',
  maintenance: 'warning',
  retired: 'grey',
}
</script>

<template>
  <v-card
    class="mb-3"
    :style="{ borderLeft: `4px solid ${device.color || '#1867C0'}` }"
  >
    <v-card-item>
      <template #title>
        <div class="d-flex align-center">
          <v-icon
            :color="device.status === 'active' ? 'success' : device.status === 'maintenance' ? 'warning' : 'grey'"
            class="mr-2"
          >
            {{ device.status === 'active' ? 'mdi-check-circle' : device.status === 'maintenance' ? 'mdi-wrench' : 'mdi-archive' }}
          </v-icon>
          {{ device.name }}
          <v-chip
            size="x-small"
            variant="tonal"
            class="ml-2"
          >
            {{ getCategoryTitle(device.category) }}
          </v-chip>
        </div>
      </template>
      <template #subtitle>
        <div class="mt-1">
          <span v-if="device.description">{{ device.description }}</span>
          <span
            v-if="device.location"
            class="ml-2"
          >
            <v-icon size="small">mdi-map-marker</v-icon> {{ device.location }}
          </span>
          <v-chip
            :color="statusColors[device.status]"
            size="x-small"
            class="ml-2"
          >
            {{ device.status }}
          </v-chip>
        </div>
      </template>
    </v-card-item>
    <v-card-actions>
      <v-spacer />
      <v-btn
        size="small"
        variant="tonal"
        prepend-icon="mdi-pencil"
        @click="emit('edit', device.id)"
      >
        Edit / 編集
      </v-btn>
      <v-btn
        size="small"
        variant="tonal"
        color="error"
        prepend-icon="mdi-delete"
        @click="emit('delete', device.id)"
      >
        Delete / 削除
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
