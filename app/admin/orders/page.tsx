'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

type Teknisi = {
  id: string
  nama: string
}

type Order = {
  id: string
  jenis_layanan: string
  tanggal_jadwal: string
  status: string
  total_biaya: number
  created_at: string
  teknisi_id: string | null
  klien: { nama: string; nomor_wa: string } | null
  teknisi: { nama: string } | null
}

const statusColor: Record<string, { bg: string; color: string }> = {
  pending:     { bg: '#fef9c3', color: '#ca8a04' },
  on_the_way:  { bg: '#dbeafe', color: '#2563eb' },
  selesai:     { bg: '#dcfce7', color: '#16a34a' },
  batal:       { bg: '#fee2e2', color: '#dc2626' },
}

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  on_the_way: 'Dalam Perjalanan',
  selesai: 'Selesai',
  batal: 'Batal',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [teknisiList, setTeknisiList] = useState<Teknisi[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('semua')

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, klien(nama, nomor_wa), teknisi(nama)')
      .order('created_at', { ascending: false })

    if (!error && data) setOrders(data as unknown as Order[])
    setLoading(false)
  }

  async function fetchTeknisi() {
    const { data } = await supabase.from('teknisi').select('id, nama').eq('aktif', true).order('nama')
    if (data) setTeknisiList(data)
  }

  useEffect(() => { fetchOrders(); fetchTeknisi() }, [])

  async function ubahStatus(id: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', id)
    fetchOrders()
  }

  async function assignTeknisi(id: string, teknisiId: string) {
    await supabase.from('orders').update({ teknisi_id: teknisiId || null }).eq('id', id)
    fetchOrders()
  }

  const filtered = filter === 'semua' ? orders : orders.filter(o => o.status === filter)

  const filterBtn = (val: string, label: string) => (
    <button onClick={() => setFilter(val)} style={{
      padding: '6px 14px',
      borderRadius: '20px',
      border: '1px solid',
      fontSize: '13px',
      cursor: 'pointer',
      fontWeight: filter === val ? 600 : 400,
      background: filter === val ? '#3b82f6' : '#fff',
      color: filter === val ? '#fff' : '#64748b',
      borderColor: filter === val ? '#3b82f6' : '#e2e8f0',
    }}>{label}</button>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '960px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>Daftar Order</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Total {orders.length} order</p>
        </div>
        <Link href="/booking" style={{
          padding: '10px 18px',
          background: '#3b82f6',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 600,
        }}>
          + Order Baru
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {filterBtn('semua', 'Semua')}
        {filterBtn('pending', 'Pending')}
        {filterBtn('on_the_way', 'Dalam Perjalanan')}
        {filterBtn('selesai', 'Selesai')}
        {filterBtn('batal', 'Batal')}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Memuat data...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Tidak ada order</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>Klien</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>Layanan</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>Jadwal</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>Teknisi</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>Ubah Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => (
                <tr key={order.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: '#1e293b' }}>{order.klien?.nama ?? '-'}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{order.klien?.nomor_wa ?? '-'}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#1e293b' }}>{order.jenis_layanan}</td>
                  <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: statusColor[order.status]?.bg ?? '#f1f5f9',
                        color: statusColor[order.status]?.color ?? '#64748b',
                      }}>
                        {statusLabel[order.status] ?? order.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={order.teknisi_id ?? ''}
                        onChange={(e) => assignTeknisi(order.id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontSize: '13px',
                          color: order.teknisi_id ? '#1e293b' : '#94a3b8',
                          background: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="">Belum ditugaskan</option>
                        {teknisiList.map(t => (
                          <option key={t.id} value={t.id}>{t.nama}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={order.status}
                        onChange={(e) => ubahStatus(order.id, e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '13px',
                        color: '#1e293b',
                        background: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="on_the_way">Dalam Perjalanan</option>
                      <option value="selesai">Selesai</option>
                      <option value="batal">Batal</option>
                    </select>
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
