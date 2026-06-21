import { ref } from 'vue'

const adminPassword = ref('')

export function useAdmin() {
  function setPassword(pw: string) {
    adminPassword.value = pw
  }

  function getPassword(): string {
    return adminPassword.value
  }

  function hasPassword(): boolean {
    return adminPassword.value.length > 0
  }

  function clearPassword() {
    adminPassword.value = ''
  }

  return { adminPassword, setPassword, getPassword, hasPassword, clearPassword }
}
