<script setup lang="ts">
const router = useRouter()
router.replace('/calendar/day')
</script>

<template>
  <div class="d-flex align-center justify-center fill-height">
    <v-progress-circular
      indeterminate
      color="primary"
    />
  </div>
</template>
