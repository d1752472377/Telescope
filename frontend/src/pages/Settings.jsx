import { useEffect, useMemo, useState } from 'react'
import useSettingsStore from '../store/useSettingsStore'

const createInitialForm = () => ({
  apiBaseUrl: '/api',
  agentDownloadUrl: '',
  releaseChannel: 'stable',
  token: localStorage.getItem('token') ?? '',
})

const toFormState = (settings) => ({
  apiBaseUrl: settings?.api_base_url ?? '/api',
  agentDownloadUrl: settings?.agent_download_url ?? '',
  releaseChannel: settings?.release_channel ?? 'stable',
  token: settings?.token ?? localStorage.getItem('token') ?? '',
})

export default function Settings() {
  const { settings, loading, saving, error, fetchSettings, updateSettings, clearError } = useSettingsStore()
  const [form, setForm] = useState(createInitialForm)
  const [savedAt, setSavedAt] = useState('')

  useEffect(() => {
    fetchSettings().catch(() => {})
  }, [fetchSettings])

  useEffect(() => {
    if (!settings) {
      return
    }

    setForm(toFormState(settings))
    setSavedAt(settings.updated_at ? new Date(settings.updated_at).toLocaleString() : '')
  }, [settings])

  useEffect(() => {
    if (!error) {
      return
    }

    return () => clearError()
  }, [error, clearError])

  const stats = useMemo(() => ({
    configCount: Object.values(form).filter(Boolean).length,
    tokenStatus: form.token ? '已配置' : '未配置',
    channel: form.releaseChannel === 'beta' ? 'Beta' : 'Stable',
  }), [form])

  const handleFieldChange = (field, value) => {
    if (error) {
      clearError()
    }

    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSave = async (event) => {
    event.preventDefault()

    try {
      const response = await updateSettings({
        api_base_url: form.apiBaseUrl,
        agent_download_url: form.agentDownloadUrl,
        release_channel: form.releaseChannel,
        token: form.token,
      })

      if (form.token) {
        localStorage.setItem('token', form.token)
      } else {
        localStorage.removeItem('token')
      }

      setSavedAt(response.updated_at ? new Date(response.updated_at).toLocaleString() : new Date().toLocaleString())
    } catch {
      // Error state is handled by the store.
    }
  }

  return (
    <section className="space-y-6 text-slate-100">
      <div className="rounded-3xl border border-[#2a2d3a] bg-[#0f1117] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white">设置</h2>
            <p className="mt-2 text-sm text-slate-400">管理接口地址、Agent 下载地址和本地令牌。</p>
          </div>
          <div className="rounded-2xl border border-[#2a2d3a] bg-[#1a1d27] px-4 py-3 text-sm text-slate-300">
            最近保存：{savedAt || '未保存'}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#2a2d3a] bg-[#1a1d27] p-5">
            <p className="text-sm text-slate-400">已填配置项</p>
            <p className="mt-3 text-3xl font-semibold text-white">{stats.configCount}</p>
          </div>
          <div className="rounded-2xl border border-[#2a2d3a] bg-[#1a1d27] p-5">
            <p className="text-sm text-slate-400">令牌状态</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-300">{stats.tokenStatus}</p>
          </div>
          <div className="rounded-2xl border border-[#2a2d3a] bg-[#1a1d27] p-5">
            <p className="text-sm text-slate-400">更新通道</p>
            <p className="mt-3 text-3xl font-semibold text-white">{stats.channel}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-5 rounded-2xl border border-[#2a2d3a] bg-[#1a1d27] p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="API Base URL" required>
              <input
                value={form.apiBaseUrl}
                onChange={(event) => handleFieldChange('apiBaseUrl', event.target.value)}
                className="field"
                placeholder="/api"
                required
                disabled={loading || saving}
              />
            </FormField>
            <FormField label="Agent 下载地址">
              <input
                value={form.agentDownloadUrl}
                onChange={(event) => handleFieldChange('agentDownloadUrl', event.target.value)}
                className="field"
                placeholder="https://example.com/agent"
                disabled={loading || saving}
              />
            </FormField>
            <FormField label="Release Channel" required>
              <select
                value={form.releaseChannel}
                onChange={(event) => handleFieldChange('releaseChannel', event.target.value)}
                className="field"
                required
                disabled={loading || saving}
              >
                <option value="stable">Stable</option>
                <option value="beta">Beta</option>
              </select>
            </FormField>
            <FormField label="访问令牌">
              <input
                value={form.token}
                onChange={(event) => handleFieldChange('token', event.target.value)}
                className="field"
                placeholder="Bearer token"
                disabled={loading || saving}
              />
            </FormField>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="rounded-2xl border border-[#2a2d3a] bg-[#11141c] px-4 py-3 text-sm text-slate-400">
            设置会持久化到后端，保存 token 后仍会同步到本地，保持现有请求头行为不变。
          </div>

          <div className="flex justify-end border-t border-[#2a2d3a] pt-5">
            <button
              type="submit"
              className="rounded-xl bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading || saving}
            >
              {saving ? '保存中...' : loading ? '加载中...' : '保存设置'}
            </button>
          </div>
        </form>
      </div>
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
