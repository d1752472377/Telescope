import { useEffect, useMemo, useState } from 'react'
import { Edit3, Plus, Power, Trash2, X } from 'lucide-react'
import client from '../api/client'
import useServerStore from '../store/useServerStore'

const PROTOCOL_OPTIONS = [
  { value: 'ssh', label: 'SSH', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { value: 'ftp', label: 'FTP', color: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  { value: 'rdp', label: 'RDP', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
]

const DEFAULT_PORTS = {
  ssh: 22,
  ftp: 21,
  rdp: 3389,
}

const createInitialForm = () => ({
  name: '',
  protocol: 'ssh',
  host: '',
  port: DEFAULT_PORTS.ssh,
  username: '',
  password: '',
  private_key: '',
  group: '',
  notes: '',
})

const getErrorMessage = (error, fallback) => error.response?.data?.detail ?? error.message ?? fallback

export default function Servers() {
  const servers = useServerStore((state) => state.servers)
  const loading = useServerStore((state) => state.loading)
  const error = useServerStore((state) => state.error)
  const selectedGroup = useServerStore((state) => state.selectedGroup)
  const setSelectedGroup = useServerStore((state) => state.setSelectedGroup)
  const fetchServers = useServerStore((state) => state.fetchServers)
  const createServer = useServerStore((state) => state.createServer)
  const updateServer = useServerStore((state) => state.updateServer)
  const deleteServer = useServerStore((state) => state.deleteServer)
  const clearError = useServerStore((state) => state.clearError)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mode, setMode] = useState('create')
  const [editingServer, setEditingServer] = useState(null)
  const [form, setForm] = useState(createInitialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [connectLoadingId, setConnectLoadingId] = useState(null)
  const [connectError, setConnectError] = useState('')

  useEffect(() => {
    fetchServers().catch(() => {})
  }, [fetchServers])

  const groups = useMemo(() => {
    const values = Array.from(
      new Set(
        servers
          .map((server) => server.group?.trim())
          .filter(Boolean),
      ),
    )

    return ['all', ...values]
  }, [servers])

  useEffect(() => {
    if (!groups.includes(selectedGroup)) {
      setSelectedGroup('all')
    }
  }, [groups, selectedGroup, setSelectedGroup])

  const filteredServers = useMemo(() => {
    if (selectedGroup === 'all') {
      return servers
    }

    return servers.filter((server) => server.group === selectedGroup)
  }, [selectedGroup, servers])

  const openCreateModal = () => {
    clearError()
    setConnectError('')
    setMode('create')
    setEditingServer(null)
    setForm(createInitialForm())
    setIsModalOpen(true)
  }

  const openEditModal = (server) => {
    clearError()
    setConnectError('')
    setMode('edit')
    setEditingServer(server)
    setForm({
      name: server.name,
      protocol: server.protocol,
      host: server.host,
      port: server.port,
      username: server.username,
      password: '',
      private_key: '',
      group: server.group ?? '',
      notes: server.notes ?? '',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (isSubmitting) {
      return
    }

    setIsModalOpen(false)
    setEditingServer(null)
    setForm(createInitialForm())
  }

  const handleProtocolChange = (nextProtocol) => {
    setForm((current) => {
      const previousDefaultPort = DEFAULT_PORTS[current.protocol]
      const nextDefaultPort = DEFAULT_PORTS[nextProtocol]
      const shouldUpdatePort = mode === 'create' || current.port === previousDefaultPort

      return {
        ...current,
        protocol: nextProtocol,
        port: shouldUpdatePort ? nextDefaultPort : current.port,
      }
    })
  }

  const handleFieldChange = (field, value) => {
    if (field === 'protocol') {
      handleProtocolChange(value)
      return
    }

    setForm((current) => ({
      ...current,
      [field]: field === 'port' ? (value === '' ? '' : Number(value)) : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    clearError()
    setConnectError('')
    setIsSubmitting(true)

    const payload = {
      name: form.name.trim(),
      protocol: form.protocol,
      host: form.host.trim(),
      port: Number(form.port),
      username: form.username.trim(),
      group: form.group.trim() || null,
      notes: form.notes.trim() || null,
    }

    if (form.password) {
      payload.password = form.password
    } else if (mode === 'create') {
      payload.password = null
    }

    if (form.protocol === 'ssh') {
      if (form.private_key) {
        payload.private_key = form.private_key
      } else if (mode === 'create') {
        payload.private_key = null
      }
    }

    try {
      if (mode === 'create') {
        await createServer(payload)
      } else {
        await updateServer(editingServer.id, payload)
      }

      setIsModalOpen(false)
      setEditingServer(null)
      setForm(createInitialForm())
    } catch {
      // Store error already set.
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConnect = async (serverId) => {
    setConnectError('')
    setConnectLoadingId(serverId)

    try {
      const response = await client.get(`/servers/${serverId}/connect-url`)
      window.location.href = response.data.connect_url
    } catch (error) {
      setConnectError(getErrorMessage(error, 'Failed to launch connection'))
    } finally {
      setConnectLoadingId(null)
    }
  }

  const handleDelete = async (server) => {
    const confirmed = window.confirm(`Delete server \"${server.name}\"?`)
    if (!confirmed) {
      return
    }

    setConnectError('')

    try {
      await deleteServer(server.id)
    } catch {
      // Store error already set.
    }
  }

  return (
    <section className="space-y-6 text-slate-100">
      <div className="rounded-3xl border border-[#2a2d3a] bg-[#0f1117] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white">Servers</h2>
            <p className="mt-2 text-sm text-slate-400">Manage server connections and launch your local Telescope Agent.</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#2563eb]"
          >
            <Plus size={16} />
            Add Server
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {groups.map((group) => {
            const active = selectedGroup === group
            const label = group === 'all' ? 'All' : group

            return (
              <button
                key={group}
                type="button"
                onClick={() => setSelectedGroup(group)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  active
                    ? 'border-[#3b82f6] bg-[#3b82f6]/15 text-white'
                    : 'border-[#2a2d3a] bg-[#1a1d27] text-slate-300 hover:border-slate-500 hover:text-white'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {(error || connectError) && (
          <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {connectError || error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 rounded-2xl border border-[#2a2d3a] bg-[#1a1d27] px-6 py-16 text-center text-sm text-slate-400">
            Loading servers...
          </div>
        ) : filteredServers.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#2a2d3a] bg-[#1a1d27] px-6 py-16 text-center">
            <h3 className="text-lg font-medium text-white">No servers yet</h3>
            <p className="mt-2 text-sm text-slate-400">Add your first server to start connecting through Telescope.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredServers.map((server) => {
              const protocolMeta = PROTOCOL_OPTIONS.find((item) => item.value === server.protocol) ?? PROTOCOL_OPTIONS[0]

              return (
                <article
                  key={server.id}
                  className="rounded-2xl border border-[#2a2d3a] bg-[#1a1d27] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-slate-500"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-white">{server.name}</h3>
                      <p className="mt-2 truncate font-mono text-sm text-slate-400">
                        {server.host}:{server.port}
                      </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${protocolMeta.color}`}>
                      {protocolMeta.label}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                    {server.group ? (
                      <span className="rounded-full border border-[#2a2d3a] bg-[#11141c] px-2.5 py-1">{server.group}</span>
                    ) : null}
                    {server.has_password ? (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">Password set</span>
                    ) : (
                      <span className="rounded-full border border-slate-600 bg-slate-800/50 px-2.5 py-1 text-slate-400">No password</span>
                    )}
                  </div>

                  <p className="mt-4 truncate text-sm text-slate-400">{server.notes || 'No notes provided'}</p>

                  <div className="mt-5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleConnect(server.id)}
                      disabled={connectLoadingId === server.id}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Power size={15} />
                      {connectLoadingId === server.id ? 'Connecting...' : 'Connect'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(server)}
                      className="inline-flex items-center justify-center rounded-xl border border-[#2a2d3a] bg-[#11141c] p-2.5 text-slate-300 transition hover:border-slate-500 hover:text-white"
                      aria-label={`Edit ${server.name}`}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(server)}
                      className="inline-flex items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-rose-200 transition hover:bg-rose-500/20"
                      aria-label={`Delete ${server.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#2a2d3a] bg-[#1a1d27] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-white">{mode === 'create' ? 'Add Server' : 'Edit Server'}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {mode === 'create' ? 'Create a new server connection.' : 'Update server details. Leave secrets blank to keep current values.'}
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
                <FormField label="Name" required>
                  <input
                    value={form.name}
                    onChange={(event) => handleFieldChange('name', event.target.value)}
                    className="field"
                    placeholder="Production API"
                    required
                  />
                </FormField>
                <FormField label="Protocol" required>
                  <select
                    value={form.protocol}
                    onChange={(event) => handleFieldChange('protocol', event.target.value)}
                    className="field"
                    required
                  >
                    {PROTOCOL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Host" required>
                  <input
                    value={form.host}
                    onChange={(event) => handleFieldChange('host', event.target.value)}
                    className="field"
                    placeholder="10.0.0.10"
                    required
                  />
                </FormField>
                <FormField label="Port" required>
                  <input
                    type="number"
                    min="1"
                    max="65535"
                    value={form.port}
                    onChange={(event) => handleFieldChange('port', event.target.value)}
                    className="field"
                    required
                  />
                </FormField>
                <FormField label="Username" required>
                  <input
                    value={form.username}
                    onChange={(event) => handleFieldChange('username', event.target.value)}
                    className="field"
                    placeholder="root"
                    required
                  />
                </FormField>
                <FormField label="Group">
                  <input
                    value={form.group}
                    onChange={(event) => handleFieldChange('group', event.target.value)}
                    className="field"
                    placeholder="prod"
                  />
                </FormField>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Password">
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => handleFieldChange('password', event.target.value)}
                    className="field"
                    placeholder={mode === 'edit' ? '••••••  留空则保留现有密码' : 'Optional'}
                  />
                </FormField>
                {form.protocol === 'ssh' ? (
                  <FormField label="Private Key">
                    <textarea
                      value={form.private_key}
                      onChange={(event) => handleFieldChange('private_key', event.target.value)}
                      className="field min-h-32"
                      placeholder={mode === 'edit' ? '留空则保留现有私钥' : 'Optional'}
                    />
                  </FormField>
                ) : (
                  <div />
                )}
              </div>

              <FormField label="Notes">
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Server' : 'Save Changes'}
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
