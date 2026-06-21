<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import { useAdmin } from '@/stores/admin'
import { onMounted, ref } from 'vue'

const settingsStore = useSettingsStore()
const { setPassword } = useAdmin()

const defaultViewMode = ref('day')
const appName = ref('')

const saving = ref(false)
const saveSuccess = ref(false)

// Admin password change
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const pwSaving = ref(false)
const pwSuccess = ref(false)
const pwError = ref('')

async function handleChangePassword() {
  pwError.value = ''
  if (newPassword.value !== confirmPassword.value) {
    pwError.value = 'Passwords do not match / パスワードが一致しません'
    return
  }
  if (newPassword.value.length < 3) {
    pwError.value = 'Password too short / パスワードが短すぎます'
    return
  }
  pwSaving.value = true
  setPassword(currentPassword.value)
  try {
    await settingsStore.updateSettings({ admin_password: newPassword.value } as any)
    pwSuccess.value = true
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch {
    pwError.value = 'Failed. Check current password. / 失敗。現在のパスワードを確認してください。'
  } finally {
    pwSaving.value = false
  }
}

onMounted(async () => {
  await settingsStore.fetchSettings()
  defaultViewMode.value = settingsStore.defaultViewMode
  appName.value = settingsStore.appName
})

async function handleSave() {
  saving.value = true
  saveSuccess.value = false
  try {
    await settingsStore.updateSettings({
      default_view_mode: defaultViewMode.value,
      app_name: appName.value,
    })
    saveSuccess.value = true
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="page-title mb-4">Settings / 設定</h2>

    <v-card>
      <v-card-text>
        <v-form @submit.prevent="handleSave">
          <v-alert v-if="saveSuccess" type="success" class="mb-4" closable>
            Settings saved successfully. / 設定が保存されました。
          </v-alert>

          <v-text-field
            v-model="appName"
            label="Application Name / アプリ名"
            prepend-icon="mdi-application"
          />

          <v-select
            v-model="defaultViewMode"
            label="Default Calendar View / デフォルト表示"
            prepend-icon="mdi-calendar"
            :items="[
              { title: 'Day / 日', value: 'day' },
              { title: 'Week / 週', value: 'week' },
              { title: 'Month / 月', value: 'month' },
            ]"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" :loading="saving" @click="handleSave">
          Save Settings / 設定保存
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Change Admin Password -->
    <v-card class="mt-4">
      <v-card-title>Change Admin Password / 管理者パスワード変更</v-card-title>
      <v-card-text>
        <v-alert v-if="pwSuccess" type="success" class="mb-4" closable>
          Password changed successfully. / パスワードが変更されました。
        </v-alert>
        <v-alert v-if="pwError" type="error" class="mb-4" closable>
          {{ pwError }}
        </v-alert>
        <v-form @submit.prevent="handleChangePassword">
          <v-text-field
            v-model="currentPassword"
            label="Current Password / 現在のパスワード"
            type="password"
            required
            prepend-icon="mdi-lock"
          />
          <v-text-field
            v-model="newPassword"
            label="New Password / 新しいパスワード"
            type="password"
            required
            prepend-icon="mdi-lock-plus"
          />
          <v-text-field
            v-model="confirmPassword"
            label="Confirm New Password / 新しいパスワード（確認）"
            type="password"
            required
            prepend-icon="mdi-lock-check"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" :loading="pwSaving" @click="handleChangePassword">
          Change Password / パスワード変更
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
