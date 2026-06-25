<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const links = [
  { title: 'Calendar / カレンダー', path: '/calendar/day', icon: 'mdi-calendar-month' },
  { title: 'Devices / 装置管理',    path: '/devices',       icon: 'mdi-microscope' },
  { title: 'Batch / 一括登録',      path: '/reservations/batch', icon: 'mdi-clipboard-multiple' },
  { title: 'Settings / 設定',        path: '/settings',       icon: 'mdi-cog' },
]

function isActive(linkPath: string) {
  return route.path.startsWith(linkPath)
}

function navigate(path: string) {
  router.push(path)
}

function printPage() {
  window.print()
}
</script>

<template>
  <v-navigation-drawer permanent class="no-print" width="220">
    <!-- Tohoku University mark -->
    <div class="pa-4 text-center border-b">
      <div class="text-primary font-weight-bold text-body-1">Lab Equipment</div>
      <div class="text-caption text-medium-emphasis">Reservation System</div>
    </div>

    <v-list density="compact" nav class="pa-2">
      <v-list-item
        v-for="link in links"
        :key="link.path"
        active-color="primary"
        :active="isActive(link.path)"
        link
        :title="link.title"
        :prepend-icon="link.icon"
        rounded
        class="mb-1"
        @click="navigate(link.path)"
      />
    </v-list>

    <template #append>
      <div class="pa-2">
        <v-divider class="mb-2" />
        <v-list-item
          link
          prepend-icon="mdi-printer"
          title="Print / 印刷"
          rounded
          @click="printPage"
        />
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
