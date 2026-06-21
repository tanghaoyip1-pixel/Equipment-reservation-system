<script setup lang="ts">
defineProps<{
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const isOpen = defineModel<boolean>('isOpen', { default: false })
</script>

<template>
  <v-dialog
    v-model="isOpen"
    max-width="500"
  >
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="emit('cancel')"
        >
          {{ cancelText || 'Cancel / キャンセル' }}
        </v-btn>
        <v-btn
          color="error"
          variant="tonal"
          @click="emit('confirm')"
        >
          {{ confirmText || 'Confirm / 確認' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
