import { create } from 'zustand'
import client from '../api/client'

const getErrorMessage = (error, fallback) => error.response?.data?.detail ?? error.message ?? fallback

const useVpnStore = create((set) => ({
  vpns: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),
  fetchVpns: async () => {
    set({ loading: true, error: null })

    try {
      const response = await client.get('/vpn')
      set({ vpns: response.data, loading: false })
      return response.data
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to load VPNs')
      set({ error: message, loading: false })
      throw error
    }
  },
  createVpn: async (data) => {
    set({ error: null })

    try {
      const response = await client.post('/vpn', data)
      set((state) => ({
        vpns: [response.data, ...state.vpns],
      }))
      return response.data
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to create VPN')
      set({ error: message })
      throw error
    }
  },
  updateVpn: async (id, data) => {
    set({ error: null })

    try {
      const response = await client.put(`/vpn/${id}`, data)
      set((state) => ({
        vpns: state.vpns.map((vpn) => (vpn.id === id ? response.data : vpn)),
      }))
      return response.data
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to update VPN')
      set({ error: message })
      throw error
    }
  },
  deleteVpn: async (id) => {
    set({ error: null })

    try {
      await client.delete(`/vpn/${id}`)
      set((state) => ({
        vpns: state.vpns.filter((vpn) => vpn.id !== id),
      }))
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to delete VPN')
      set({ error: message })
      throw error
    }
  },
}))

export default useVpnStore
