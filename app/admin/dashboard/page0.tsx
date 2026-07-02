'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import StatCard from '../../../components/StatCard'

type Order = {
  id: string
  jenis_layanan: string
  tanggal_jadwal: string
  status: string
  total_biaya: number
  created_at: string
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) setOrders(data)
      setLoading(false)
    }
    fetchOrders()
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const orderHariIni = orders.filter(o => o.tanggal_jadwal === today).length
  const pending = orders.filter(o => o.status === 'pending').length
  const selesai = orders.filter(o => o.status === 'selesai').length
  const totalPendapatan = orders
    .filter(o => o.status === 'selesai')
    .reduce((sum, o) => sum + (o.total_biaya || 0), 0)

  if (loading) return (
    <div style={{ padding: '2rem', color: '#64748b' }}>Memuat data...</div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
        Dashboard
      </h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '2rem' }}>
        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Order hari ini" value={orderHariIni} color="#3b82f6" />
        <StatCard label="Menunggu konfirmasi" value={pending} color="#f59e0b" />
        <StatCard label="Selesai" value={selesai} color="#10b981" />
        <StatCard label="Total pendapatan" value={`Rp ${totalPendapatan.toLocaleString('id-ID')}`} color="#8b5cf6" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#1e293b' }}>
          Order terbaru
        </div>
        {orders.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            Belum ada order masuk
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>Layanan</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>Jadwal</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>Biaya</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((order, i) => (
                <tr key={order.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '12px 16px', color: '#1e293b' }}>{order.jenis_layanan}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    {new Date(order.tanggal_jadwal).toLocaleDateString('id-ID')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: order.status === 'selesai' ? '#dcfce7' : order.status === 'pending' ? '#fef9c3' : '#dbeafe',
                      color: order.status === 'selesai' ? '#16a34a' : order.status === 'pending' ? '#ca8a04' : '#2563eb',
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#1e293b' }}>
                    Rp {(order.total_biaya || 0).toLocaleString('id-ID')}
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
