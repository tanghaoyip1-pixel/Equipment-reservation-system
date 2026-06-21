<script setup lang="ts">
import type { Reservation } from '@/types/reservation'

defineProps<{
  reservations: Reservation[]
}>()

const emit = defineEmits<{
  delete: [id: number]
}>()

const isOpen = defineModel<boolean>('isOpen', { default: false })
const deviceId = defineModel<number>('deviceId', { default: 0 })
</script>

<template>
  <v-dialog
    v-model="isOpen"
    max-width="500"
  >
    <v-card>
      <v-card-title>
        Delete Device / 装置削除
      </v-card-title>
      <v-card-text>
        <v-alert
          v-if="reservations.length > 0"
          type="warning"
          class="mb-4"
        >
          This device has {{ reservations.length }} active reservation(s).
          Deleting it will also cancel these reservations. /
          この装置には {{ reservations.length }} 件の予約があります。削除すると予約も取り消されます。
        </v-alert>
        <p>Are you sure you want to delete this device? / この装置を本当に削除しますか？</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="isOpen = false"
        >
          Cancel / キャンセル
        </v-btn>
        <v-btn
          color="error"
          variant="tonal"
          @click="emit('delete', deviceId); isOpen = false"
        >
          Delete / 削除
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
