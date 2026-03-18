const vpnCards = [
  {
    id: 1,
    name: 'Office VPN',
    endpoint: 'vpn.example.internal',
    client: 'OpenVPN',
  },
  {
    id: 2,
    name: 'Lab WireGuard',
    endpoint: 'wg.example.internal',
    client: 'WireGuard',
  },
]

export default function VPN() {
  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-3xl font-semibold text-slate-900">VPN</h3>
        <p className="mt-2 text-sm text-slate-500">Keep VPN endpoints, client choices, and notes in a single view.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {vpnCards.map((vpn) => (
          <article key={vpn.id} className="card p-5">
            <h4 className="text-lg font-semibold text-slate-900">{vpn.name}</h4>
            <p className="mt-2 text-sm text-slate-500">Endpoint: {vpn.endpoint}</p>
            <p className="mt-1 text-sm text-slate-500">Client: {vpn.client}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
