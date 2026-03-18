import { useEffect, useMemo, useState } from 'react'
import { Edit3, Plus, Trash2, X } from 'lucide-react'
import useVpnStore from '../store/useVpnStore'

const createInitialForm = () => ({
  name: '',
  provider: '',
  server_address: '',
  username: '',
  password: '',
  client: '',
  notes: '',
})

export default function VPN() {
  const vpns = useVpnStore((state) => state.vpns)
  const loading = useVpnStore((state) => state.loading)
  const error = useVpnStore((state) => state.error)
  const fetchVpns = useVpnStore((state) => state.fetchVpns)
  const createVpn = useVpnStore((state) => state.createVpn)
  const updateVpn = useVpnStore((state) => state.updateVpn)
  const deleteVpn = useVpnStore((state) => state.deleteVpn)
  const clearError = useVpnStore((state) => state.clearError)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mode, setMode] = useState('create')
  const [editingVpn, setEditingVpn] = useState(null)
  const [form, setForm] = useState(createInitialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchVpns().catch(() => {})
  }, [fetchVpns])

  const stats = useMemo(() => {
    const providerCount = new Set(vpns.map((vpn) => vpn.provider?.trim()).filter(Boolean)).size
    const clientCount = new Set(vpns.map((vpn) => vpn.client?.trim()).filter(Boolean)).size

    return {
      total: vpns.length,
      providers: providerCount,
      clients: clientCount,
    }
  }, [vpns])

  const openCreateModal = () => {
    clearError()
    setMode('create')
    setEditingVpn(null)
    setForm(createInitialForm())
    setIsModalOpen(true)
  }

  const openEditModal = (vpn) => {
    clearError()
    setMode('edit')
    setEditingVpn(vpn)
    setForm({
      name: vpn.name ?? '',
      provider: vpn.provider ?? '',
      server_address: vpn.server_address ?? '',
      username: vpn.username ?? '',
      password: '',
      client: vpn.client ?? '',
      notes: vpn.notes ?? '',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (isSubmitting) {
      return
    }

    setIsModalOpen(false)
    setEditingVpn(null)
    setForm(createInitialForm())
  }

  const handleFieldChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    clearError()
    setIsSubmitting(true)

    const payload = {
      name: form.name.trim(),
      provider: form.provider.trim() || null,
      server_address: form.server_address.trim(),
      username: form.username.trim() || null,
      client: form.client.trim() || null,
      notes: form.notes.trim() || null,
    }

    if (form.password) {
      payload.password = form.password
    } else if (mode === 'create') {
      payload.password = null
    }

    try {
      if (mode === 'create') {
        await createVpn(payload)
      } else {
        await updateVpn(editingVpn.id, payload)
      }

      setIsModalOpen(false)
      setEditingVpn(null)
      setForm(createInitialForm())
    } catch {
      // Store error already set.
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (vpn) => {
    const confirmed = window.confirm(`Delete VPN \"${vpn.name}\"?`)
    if (!confirmed) {
      return
    }

    try {
      await deleteVpn(vpn.id)
    } catch {
      // Store error already set.
    }
  }

  return (
    <section className="space-y-6 text-slate-100">
      <div className="rounded-3xl border border-[#2a2d3a] bg-[#0f1117] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white">VPN</h2>
            <p className="mt-2 text-sm text-slate-400">统一管理 VPN 节点地址、账号信息和客户端类型。</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#2563eb]"
          >
            <Plus size={16} />
            新增 VPN
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#2a2d3a] bg-[#1a1d27] p-5">
            <p className="text-sm text-slate-400">VPN 总数</p>
            <p className="mt-3 text-3xl font-semibold text-white">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-[#2a2d3a] bg-[#1a1d27] p-5">
            <p className="text-sm text-slate-400">服务商</p>
            <p className="mt-3 text-3xl font-semibold text-white">{stats.providers}</p>
          </div>
          <div className="rounded-2xl border border-[#2a2d3a] bg-[#1a1d27] p-5">
            <p className="text-sm text-slate-400">客户端类型</p>
            <p className="mt-3 text-3xl font-semibold text-white">{stats.clients}</p>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 rounded-2xl border border-[#2a2d3a] bg-[#1a1d27] px-6 py-16 text-center text-sm text-slate-400">
            Loading VPNs...
          </div>
        ) : vpns.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#2a2d3a] bg-[#1a1d27] px-6 py-16 text-center">
            <h3 className="text-lg font-medium text-white">暂无 VPN</h3>
            <p className="mt-2 text-sm text-slate-400">添加第一条 VPN 配置后会展示在这里。</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {vpns.map((vpn) => (
              <article key={vpn.id} className="rounded-2xl border border-[#2a2d3a] bg-[#1a1d27] p-5 transition hover:border-slate-500">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-white">{vpn.name}</h3>
                    <p className="mt-2 truncate font-mono text-sm text-slate-400">{vpn.server_address}</p>
                  </div>
                  {vpn.client ? (
                    <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-300">
                      {vpn.client}
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 space-y-2 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">服务商</span>
                    <span>{vpn.provider || '未设置'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">用户名</span>
                    <span>{vpn.username || '未设置'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">创建时间</span>
                    <span>{new Date(vpn.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <p className="mt-4 truncate text-sm text-slate-400">{vpn.notes || '暂无备注'}</p>

                <div className="mt-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(vpn)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#2a2d3a] bg-[#11141c] px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
                  >
                    <Edit3 size={15} />
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(vpn)}
                    className="inline-flex items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-rose-200 transition hover:bg-rose-500/20"
                    aria-label={`Delete ${vpn.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#2a2d3a] bg-[#1a1d27] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-white">{mode === 'create' ? '新增 VPN' : '编辑 VPN'}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {mode === 'create' ? '录入新的 VPN 连接信息。' : '更新 VPN 信息，密码留空则保持原值。'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex items-center justify-center rounded-xl border border-[#2a2d3a] bg-[#11141c] p-2 text-slate-300 transition hover:border-slate-500 hover:text-white"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="名称" required>
                  <input
                    value={form.name}
                    onChange={(event) => handleFieldChange('name', event.target.value)}
                    className="field"
                    placeholder="Office VPN"
                    required
                  />
                </FormField>
                <FormField label="服务商">
                  <input
                    value={form.provider}
                    onChange={(event) => handleFieldChange('provider', event.target.value)}
                    className="field"
                    placeholder="OpenVPN Cloud"
                  />
                </FormField>
                <FormField label="服务器地址" required>
                  <input
                    value={form.server_address}
                    onChange={(event) => handleFieldChange('server_address', event.target.value)}
                    className="field"
                    placeholder="vpn.example.internal"
                    required
                  />
                </FormField>
                <FormField label="客户端类型">
                  <input
                    value={form.client}
                    onChange={(event) => handleFieldChange('client', event.target.value)}
                    className="field"
                    placeholder="WireGuard"
                  />
                </FormField>
                <FormField label="用户名">
                  <input
                    value={form.username}
                    onChange={(event) => handleFieldChange('username', event.target.value)}
                    className="field"
                    placeholder="operator"
                  />
                </FormField>
                <FormField label="密码">
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => handleFieldChange('password', event.target.value)}
                    className="field"
                    placeholder={mode === 'edit' ? '留空则保留现有密码' : 'Optional'}
                  />
                </FormField>
              </div>

              <FormField label="备注">
                <textarea
                  value={form.notes}
                  onChange={(event) => handleFieldChange('notes', event.target.value)}
                  className="field min-h-28"
                  placeholder="Optional notes"
                />
              </FormField>

              <div className="flex justify-end gap-3 border-t border-[#2a2d3a] pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-[#2a2d3a] bg-[#11141c] px-4 py-2.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? '保存中...' : mode === 'create' ? '创建 VPN' : '保存修改'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function FormField({ label, required = false, children }) {
  return (
    <label className="block space-y-2 text-sm text-slate-300">
      <span>
        {label}
        {required ? <span className="ml-1 text-rose-300">*</span> : null}
      </span>
      {children}
    </label>
  )
}
