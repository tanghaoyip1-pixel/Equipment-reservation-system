import { defineStore } from 'pinia'
import { ref } from 'vue'
import { get, post, put, del } from '@/services/api/api-requests'
import type { User, UserRequest } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const selectedUser = ref<User | null>(null)
  const isLoading = ref(false)

  async function fetchAllUsers(): Promise<User[]> {
    isLoading.value = true
    try {
      const response = await get('/users')
      users.value = response.data.items || response.data || []
      return users.value
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUser(id: number): Promise<User> {
    const response = await get(`/users/${id}`)
    const user = response.data.content || response.data
    selectedUser.value = user
    return user
  }

  async function createUser(data: UserRequest): Promise<User> {
    const response = await post('/users', data)
    const user = response.data.content || response.data
    users.value.push(user)
    return user
  }

  async function updateUser(id: number, data: UserRequest): Promise<User> {
    const response = await put(`/users/${id}`, data)
    const user = response.data.content || response.data
    const index = users.value.findIndex((u) => u.id === id)
    if (index !== -1) {
      users.value[index] = user
    }
    selectedUser.value = user
    return user
  }

  async function deleteUser(id: number): Promise<void> {
    await del(`/users/${id}`)
    users.value = users.value.filter((u) => u.id !== id)
    if (selectedUser.value?.id === id) {
      selectedUser.value = null
    }
  }

  return {
    users,
    selectedUser,
    isLoading,
    fetchAllUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
  }
})
