import { create } from 'zustand'
import client from '../api/client'

const getErrorMessage = (error, fallback) => error.response?.data?.detail ?? error.message ?? fallback

const useSettingsStore = create((set) => ({
  settings: null,
  loading: false,
  saving: false,
  error: null,
  clearError: () => set({ error: null }),
  fetchSettings: async () => {
    set({ loading: true, error: null })

    try {
      const response = await client.get('/settings')
      set({ settings: response.data, loading: false })
      return response.data
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to load settings')
      set({ error: message, loading: false })
      throw error
    }
  },
  updateSettings: async (data) => {
    set({ saving: true, error: null })

    try {
      const response = await client.put('/settings', data)
      set({ settings: response.data, saving: false })
      return response.data
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to save settings')
      set({ error: message, saving: false })
      throw error
    }
  },
}))

export default useSettingsStore
