<script setup lang="ts">
import { useDeviceStore } from '@/stores/device'
import { onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import type { DeviceRequest } from '@/types/device'

const router = useRouter()
const route = useRoute()
const deviceStore = useDeviceStore()
const { selectedDevice } = storeToRefs(deviceStore)

const routeId = computed(() => (route.params as Record<string, string>).id)
const isNew = computed(() => !routeId.value)

onMounted(async () => {
  const id = routeId.value
  if (id) {
    try {
      await deviceStore.fetchDevice(Number(id))
    } catch {
      // Device not found
    }
  }
})

async function handleSave(data: DeviceRequest) {
  if (isNew.value) {
    await deviceStore.createDevice(data)
  } else {
    await deviceStore.updateDevice(selectedDevice.value!.id, data)
  }
  router.push('/devices')
}

function handleCancel() {
  router.push('/devices')
}
</script>

<template>
  <div>
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mb-4"
      @click="router.push('/devices')"
    >
      Back to Devices / 装置一覧に戻る
    </v-btn>

    <DeviceForm
      :device="selectedDevice"
      :is-new="isNew"
      @save="handleSave"
      @cancel="handleCancel"
    />
  </div>
</template>
