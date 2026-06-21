<script setup lang="ts">
import { useDeviceStore } from '@/stores/device'
import { useReservationStore } from '@/stores/reservation'
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import type { BatchReservationRequest } from '@/types/reservation'

const router = useRouter()
const deviceStore = useDeviceStore()
const reservationStore = useReservationStore()
const { devices } = storeToRefs(deviceStore)

const resultDialog = ref(false)
const resultCreated = ref(0)
const resultSkipped = ref(0)
const resultDetails = ref<string[]>([])

onMounted(async () => {
  await deviceStore.fetchAllDevices()
})

async function handleSubmit(data: BatchReservationRequest) {
  const result = await reservationStore.createBatchReservations(data)
  resultCreated.value = result.created.length
  resultSkipped.value = result.skipped.length

  const details: string[] = []
  for (const r of result.created) {
    details.push(`✅ ${r.startTime.slice(0, 10)} ${r.deviceName} — OK`)
  }
  for (const s of result.skipped) {
    const devName = s.deviceName || `Device #${s.deviceId}`
    const by = s.reservedBy || 'someone'
    details.push(`⚠️ ${s.date} ${devName} — Already reserved by ${by} / ${by}が予約済み`)
  }
  resultDetails.value = details
  resultDialog.value = true
}
</script>

<template>
  <div>
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mb-4"
      @click="router.push('/calendar/day')"
    >
      Back to Calendar / カレンダーに戻る
    </v-btn>

    <BatchReservationForm
      :devices="devices"
      @submit="handleSubmit"
    />

    <!-- Result dialog -->
    <v-dialog
      v-model="resultDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title>
          Batch Result / 一括登録 結果
        </v-card-title>
        <v-card-text>
          <div class="text-h6 mb-3">
            ✅ {{ resultCreated }} created / 作成成功
            <span
              v-if="resultSkipped > 0"
              class="text-warning ml-2"
            >
              ⚠️ {{ resultSkipped }} skipped / スキップ
            </span>
          </div>
          <div
            v-for="(line, i) in resultDetails"
            :key="i"
            class="text-body-2 py-1"
          >
            {{ line }}
          </div>
          <v-alert
            v-if="resultSkipped > 0"
            type="info"
            variant="tonal"
            class="mt-3"
          >
            Skipped reservations were already booked by someone else. /
            スキップされた日時は既に他の予約が入っています。
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            @click="router.push('/calendar/day')"
          >
            Back to Calendar / カレンダーへ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
