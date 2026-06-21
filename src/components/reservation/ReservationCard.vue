<script setup lang="ts">
import type { Reservation } from '@/types/reservation'

const props = defineProps<{
  reservation: Reservation
}>()

const emit = defineEmits<{
  click: [id: number]
}>()

const colors = ['#1867C0', '#E53935', '#43A047', '#FB8C00', '#8E24AA', '#00ACC1', '#6D4C41']
const colorIndex = (props.reservation?.deviceId || 1) % colors.length
const bgColor = props.reservation?.deviceColor || colors[colorIndex]
</script>

<template>
  <div
    class="reservation-card"
    :style="{ backgroundColor: bgColor }"
    @click.stop="emit('click', reservation.id)"
  >
    <div class="text-truncate font-weight-medium">
      {{ reservation.title }}
    </div>
    <div class="text-caption">
      {{ reservation.startTime.slice(11, 16) }}-{{ reservation.endTime.slice(11, 16) }}
    </div>
    <div class="text-caption text-truncate">
      {{ reservation.userName }}
    </div>
    <v-tooltip
      activator="parent"
      location="top"
    >
      <div>{{ reservation.title }}</div>
      <div>{{ reservation.startTime.slice(11, 16) }} - {{ reservation.endTime.slice(11, 16) }}</div>
      <div>{{ reservation.userName }} | {{ reservation.deviceName }}</div>
      <div v-if="reservation.description">
        {{ reservation.description }}
      </div>
    </v-tooltip>
  </div>
</template>

<style scoped>
.reservation-card {
  padding: 2px 4px;
  border-radius: 3px;
  color: white;
  cursor: pointer;
  margin-bottom: 1px;
  overflow: hidden;
  min-height: 18px;
  font-size: 11px;
  line-height: 1.2;
}
.reservation-card:hover {
  opacity: 0.85;
}
</style>
