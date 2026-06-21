import { defineStore } from 'pinia'
import { ref } from 'vue'
import { get, post, put, del } from '@/services/api/api-requests'
import type { Device, DeviceRequest } from '@/types/device'
import { useAdmin } from '@/stores/admin'

const { getPassword } = useAdmin()

function adminHeaders(): Record<string, string> {
  const pw = getPassword()
  return pw ? { 'X-Admin-Password': pw } : {}
}

export const useDeviceStore = defineStore('device', () => {
  const devices = ref<Device[]>([])
  const selectedDevice = ref<Device | null>(null)
  const isLoading = ref(false)

  async function fetchAllDevices(): Promise<Device[]> {
    isLoading.value = true
    try {
      const response = await get('/devices')
      devices.value = response.data.items || response.data || []
      return devices.value
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDevice(id: number): Promise<Device> {
    const response = await get(`/devices/${id}`)
    const device = response.data.content || response.data
    selectedDevice.value = device
    return device
  }

  async function createDevice(data: DeviceRequest): Promise<Device> {
    const response = await post('/devices', data, adminHeaders())
    const device = response.data.content || response.data
    devices.value.push(device)
    return device
  }

  async function updateDevice(
    id: number,
    data: DeviceRequest,
  ): Promise<Device> {
    const response = await put(`/devices/${id}`, data, adminHeaders())
    const device = response.data.content || response.data
    const index = devices.value.findIndex((d) => d.id === id)
    if (index !== -1) {
      devices.value[index] = device
    }
    selectedDevice.value = device
    return device
  }

  async function deleteDevice(id: number): Promise<void> {
    await del(`/devices/${id}`, adminHeaders())
    devices.value = devices.value.filter((d) => d.id !== id)
    if (selectedDevice.value?.id === id) {
      selectedDevice.value = null
    }
  }

  return {
    devices,
    selectedDevice,
    isLoading,
    fetchAllDevices,
    fetchDevice,
    createDevice,
    updateDevice,
    deleteDevice,
  }
})
