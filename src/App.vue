<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
</script>

<style>
/* Global typography refinements */
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.v-application {
  font-family: 'Roboto', 'Noto Sans JP', sans-serif !important;
}

/* Subtle card hover */
.v-card:not(.v-card--flat):hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
  transition: box-shadow 0.2s ease;
}

/* Softer scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #c4c4c4;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}

/* Page title styling */
.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d1b3e;
  letter-spacing: -0.02em;
}
</style>
