const settingsItems = [
  'API endpoint configuration',
  'Stored token management',
  'Desktop agent download links',
]

export default function Settings() {
  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-3xl font-semibold text-slate-900">Settings</h3>
        <p className="mt-2 text-sm text-slate-500">Manage local preferences and prepare this installation for authentication and agent downloads.</p>
      </div>

      <div className="card p-5">
        <ul className="space-y-3 text-sm text-slate-600">
          {settingsItems.map((item) => (
            <li key={item} className="rounded-xl bg-slate-50 px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
