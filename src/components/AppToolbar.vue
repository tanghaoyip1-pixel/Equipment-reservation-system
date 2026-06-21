<script setup lang="ts">
import { config } from '@/config'
import { ref } from 'vue'

const aboutOpen = ref(false)
</script>

<template>
  <v-app-bar color="primary">
    <v-app-bar-title>
      <span class="font-weight-bold">{{ config.appName }}</span>
    </v-app-bar-title>

    <template #append>
      <v-btn
        icon="mdi-information-outline"
        variant="text"
        @click="aboutOpen = true"
      />
    </template>
  </v-app-bar>

  <!-- About Dialog -->
  <v-dialog v-model="aboutOpen" max-width="650">
    <v-card>
      <v-card-title class="text-primary">About</v-card-title>
      <v-card-text>
        <h3 class="mb-2">Authors</h3>
        <p class="mb-1">浩一 &amp; Claude Coding</p>
        <p class="text-caption text-grey mb-4">Ono Lab — Equipment Reservation System</p>

        <h3 class="mb-2">Architecture</h3>
        <pre class="text-caption bg-grey-lighten-4 pa-3 rounded" style="line-height: 1.6">{{
`src/
├── components/          # Reusable Vue components
│   ├── calendar/        #   CalendarGrid, CalendarToolbar
│   ├── reservation/     #   ReservationForm, ReservationCard, BatchReservationForm
│   ├── device/          #   DeviceForm, DeviceCard, DeviceDeleteDialog
│   └── ui/              #   ConfirmDialog
├── layouts/             # Page layout templates
├── pages/               # Route-level page components
├── plugins/             # Vuetify & app plugins
├── router/              # Vue Router config
├── services/api/        # HTTP API layer (Axios)
├── stores/              # Pinia state management (device, reservation, settings)
├── types/               # TypeScript type definitions
└── backend/             # Flask + SQLite backend
    └── app.py           #   Single-file REST API server`
        }}</pre>

        <h3 class="mt-4 mb-2">Tech Stack</h3>
        <v-table density="compact">
          <thead><tr><th>Layer</th><th>Technology</th></tr></thead>
          <tbody>
            <tr><td>Framework</td><td>Vue 3 (Composition API)</td></tr>
            <tr><td>Language</td><td>TypeScript 5.6</td></tr>
            <tr><td>UI Library</td><td>Vuetify 3 + Material Design Icons</td></tr>
            <tr><td>State</td><td>Pinia 2</td></tr>
            <tr><td>Routing</td><td>Vue Router 4</td></tr>
            <tr><td>HTTP Client</td><td>Axios</td></tr>
            <tr><td>Build</td><td>Vite 5</td></tr>
            <tr><td>Lint / Type Check</td><td>ESLint 9 + vue-tsc</td></tr>
            <tr><td>Backend</td><td>Python 3 + Flask + SQLite</td></tr>
            <tr><td>Auth</td><td>Name-based public booking</td></tr>
          </tbody>
        </v-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="aboutOpen = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
