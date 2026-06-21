<script setup lang="ts">
import { useDeviceStore } from '@/stores/device'
import { useAdmin } from '@/stores/admin'
import { onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { DEVICE_CATEGORIES, getCategoryTitle } from '@/types/device'

const router = useRouter()
const deviceStore = useDeviceStore()
const { devices } = storeToRefs(deviceStore)
const { adminPassword, setPassword, hasPassword } = useAdmin()

const deleteDialogOpen = ref(false)
const deleteTargetId = ref(0)
const pwDialogOpen = ref(false)
const pwInput = ref('')
const pwError = ref(false)

function requireAdmin(): boolean {
  if (!hasPassword()) {
    pwDialogOpen.value = true
    return false
  }
  return true
}

function submitPassword() {
  setPassword(pwInput.value)
  pwDialogOpen.value = false
  pwInput.value = ''
}

onMounted(async () => {
  await deviceStore.fetchAllDevices()
})

// Group devices by category
const devicesByCategory = computed(() => {
  const map: Record<string, typeof devices.value> = {}
  for (const d of devices.value) {
    const cat = d.category || 'others'
    if (!map[cat]) map[cat] = []
    map[cat].push(d)
  }
  return map
})

const categories = computed(() =>
  DEVICE_CATEGORIES.filter((c) => devicesByCategory.value[c.value]?.length > 0),
)

function goNew() {
  if (!requireAdmin()) return
  router.push('/devices/new')
}

function goEdit(id: number) {
  if (!requireAdmin()) return
  router.push(`/devices/${id}`)
}

function confirmDelete(id: number) {
  if (!requireAdmin()) return
  deleteTargetId.value = id
  deleteDialogOpen.value = true
}

async function handleDelete() {
  await deviceStore.deleteDevice(deleteTargetId.value)
  deleteDialogOpen.value = false
}
</script>

<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h2 class="page-title">Devices / 装置管理</h2>
      <v-spacer />
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="goNew"
      >
        Add Device / 装置追加
      </v-btn>
    </div>

    <v-progress-linear
      v-if="deviceStore.isLoading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <!-- Grouped by category -->
    <template v-if="devices.length > 0">
      <div
        v-for="cat in categories"
        :key="cat.value"
        class="mb-6"
      >
        <h3 class="text-h6 mb-3">
          {{ cat.title }}
          <v-chip
            size="x-small"
            class="ml-2"
          >
            {{ devicesByCategory[cat.value].length }}
          </v-chip>
        </h3>
        <v-row>
          <v-col
            v-for="device in devicesByCategory[cat.value]"
            :key="device.id"
            cols="12"
            md="6"
            lg="4"
          >
            <DeviceCard
              :device="device"
              @edit="goEdit"
              @delete="confirmDelete"
            />
          </v-col>
        </v-row>
      </div>
    </template>

    <v-alert
      v-else-if="!deviceStore.isLoading"
      type="info"
    >
      No devices registered yet. /
      装置が登録されていません。
    </v-alert>

    <DeviceDeleteDialog
      v-model:is-open="deleteDialogOpen"
      v-model:device-id="deleteTargetId"
      :reservations="[]"
      @delete="handleDelete"
    />

    <!-- Admin Password Dialog -->
    <v-dialog v-model="pwDialogOpen" max-width="400">
      <v-card>
        <v-card-title>Admin Password / 管理者パスワード</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="pwInput"
            label="Password"
            type="password"
            :error="pwError"
            @keyup.enter="submitPassword"
            autofocus
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="pwDialogOpen = false">Cancel</v-btn>
          <v-btn color="primary" @click="submitPassword">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
