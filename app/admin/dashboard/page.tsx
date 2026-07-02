'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

type Order = {
  id: string
  jenis_layanan: string
  tanggal_jadwal: string
  status: string
  total_biaya: number
  created_at: string
  klien: { nama: string } | null
  teknisi: { nama: string } | null
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*, klien(nama), teknisi(nama)')
        .order('created_at', { ascending: false })
      if (!error && data) setOrders(data as unknown as Order[])
      setLoading(false)
    }
    fetchOrders()
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const orderHariIni = orders.filter(o => o.tanggal_jadwal === today)
  const pending = orders.filter(o => o.status === 'pending').length
  const onTheWay = orders.filter(o => o.status === 'on_the_way').length
  const selesai = orders.filter(o => o.status === 'selesai').length
  const totalPendapatan = orders
    .filter(o => o.status === 'selesai')
    .reduce((sum, o) => sum + (o.total_biaya || 0), 0)

  // Grafik pendapatan 6 bulan terakhir
  const grafik = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const bulan = d.toLocaleString('id-ID', { month: 'short' })
    const tahun = d.getFullYear()
    const bulanStr = `${tahun}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const total = orders
      .filter(o => o.status === 'selesai' && o.created_at?.startsWith(bulanStr))
      .reduce((sum, o) => sum + (o.total_biaya || 0), 0)
    return { bulan, total }
  })

  const statusColor: Record<string, { bg: string; color: string }> = {
    pending:    { bg: '#fef9c3', color: '#ca8a04' },
    on_the_way: { bg: '#dbeafe', color: '#2563eb' },
    selesai:    { bg: '#dcfce7', color: '#16a34a' },
    batal:      { bg: '#fee2e2', color: '#dc2626' },
  }

  const statusLabel: Record<string, string> = {
    pending: 'Pending',
    on_the_way: 'Dalam Perjalanan',
    selesai: 'Selesai',
    batal: 'Batal',
  }

  if (loading) return <div style={{ padding: '2rem', color: '#64748b' }}>Memuat data...</div>

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>Dashboard</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '2rem' }}>
        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      {/* STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Order hari ini', value: orderHariIni.length, color: '#3b82f6' },
          { label: 'Pending', value: pending, color: '#f59e0b' },
          { label: 'Dalam perjalanan', value: onTheWay, color: '#8b5cf6' },
          { label: 'Selesai', value: selesai, color: '#10b981' },
          { label: 'Total pendapatan', value: `Rp ${totalPendapatan.toLocaleString('id-ID')}`, color: '#ec4899' },
        ].map(card => (
          <div key={card.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', borderTop: `4px solid ${card.color}` }}>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>{card.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>

        {/* GRAFIK PENDAPATAN */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Pendapatan 6 Bulan Terakhir</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={grafik}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`Rp ${v.toLocaleString('id-ID')}`, 'Pendapatan']} />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* JADWAL TEKNISI HARI INI */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Jadwal Teknisi Hari Ini</div>
          {orderHariIni.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '2rem 0' }}>Tidak ada jadwal hari ini</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {orderHariIni.map(o => (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>{o.klien?.nama ?? '-'}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{o.jenis_layanan} · {o.teknisi?.nama ?? 'Belum ada teknisi'}</div>
                  </div>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 500, background: statusColor[o.status]?.bg, color: statusColor[o.status]?.color }}>
                    {statusLabel[o.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ORDER TERBARU */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b' }}>
          Order Terbaru
        </div>
        {orders.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Belum ada order</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Klien', 'Layanan', 'Jadwal', 'Teknisi', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((order, i) => (
                <tr key={order.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '10px 16px', color: '#1e293b', fontWeight: 500 }}>{order.klien?.nama ?? '-'}</td>
                  <td style={{ padding: '10px 16px', color: '#64748b' }}>{order.jenis_layanan}</td>
                  <td style={{ padding: '10px 16px', color: '#64748b' }}>{new Date(order.tanggal_jadwal).toLocaleDateString('id-ID')}</td>
                  <td style={{ padding: '10px 16px', color: '#64748b' }}>{order.teknisi?.nama ?? <span style={{ color: '#f59e0b' }}>Belum assign</span>}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, background: statusColor[order.status]?.bg, color: statusColor[order.status]?.color }}>
                      {statusLabel[order.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
