<script setup lang="ts">
</script>

<template>
  <v-container
    class="fill-height d-flex flex-column align-center justify-center text-center"
  >
    <v-icon
      size="128"
      color="primary"
    >
      mdi-alert-circle-outline
    </v-icon>
    <h1 class="text-h3 mt-4">
      404 - Page Not Found
    </h1>
    <p class="text-subtitle-1">
      Sorry, the page you requested does not exist. /
      お探しのページは見つかりませんでした。
    </p>
    <v-btn
      color="primary"
      class="mt-6"
      @click="$router.push('/')"
    >
      Back to Home / ホームに戻る
    </v-btn>
  </v-container>
</template>

<style scoped>
</style>
