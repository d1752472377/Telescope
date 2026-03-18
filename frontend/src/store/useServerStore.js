import { create } from 'zustand'
import client from '../api/client'

const getErrorMessage = (error, fallback) => error.response?.data?.detail ?? error.message ?? fallback

const useServerStore = create((set) => ({
  servers: [],
  loading: false,
  error: null,
  selectedGroup: 'all',
  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),
  clearError: () => set({ error: null }),
  fetchServers: async (group) => {
    set({ loading: true, error: null })

    try {
      const response = await client.get('/servers', {
        params: group && group !== 'all' ? { group } : undefined,
      })

      set({ servers: response.data, loading: false })
      return response.data
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to load servers')
      set({ error: message, loading: false })
      throw error
    }
  },
  createServer: async (data) => {
    set({ error: null })

    try {
      const response = await client.post('/servers', data)
      set((state) => ({
        servers: [response.data, ...state.servers],
      }))
      return response.data
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to create server')
      set({ error: message })
      throw error
    }
  },
  updateServer: async (id, data) => {
    set({ error: null })

    try {
      const response = await client.put(`/servers/${id}`, data)
      set((state) => ({
        servers: state.servers.map((server) => (server.id === id ? response.data : server)),
      }))
      return response.data
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to update server')
      set({ error: message })
      throw error
    }
  },
  deleteServer: async (id) => {
    set({ error: null })

    try {
      await client.delete(`/servers/${id}`)
      set((state) => ({
        servers: state.servers.filter((server) => server.id !== id),
      }))
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to delete server')
      set({ error: message })
      throw error
    }
  },
}))

export default useServerStore
