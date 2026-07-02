'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts'

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

export default function LaporanPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [periode, setPeriode] = useState('6')

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('orders')
        .select('*, klien(nama), teknisi(nama)')
        .order('created_at', { ascending: false })
      if (data) setOrders(data as unknown as Order[])
      setLoading(false)
    }
    fetch()
  }, [])

  const bulanList = Array.from({ length: parseInt(periode) }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (parseInt(periode) - 1 - i))
    const bulan = d.toLocaleString('id-ID', { month: 'short', year: '2-digit' })
    const bulanStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const ordersbulan = orders.filter(o => o.created_at?.startsWith(bulanStr))
    const selesai = ordersbulan.filter(o => o.status === 'selesai')
    return {
      bulan,
      total_order: ordersbulan.length,
      selesai: selesai.length,
      pendapatan: selesai.reduce((sum, o) => sum + (o.total_biaya || 0), 0),
    }
  })

  // Kinerja teknisi
  const kinerjaMaps: Record<string, { nama: string; selesai: number; pendapatan: number }> = {}
  orders.filter(o => o.status === 'selesai' && o.teknisi).forEach(o => {
    const nama = o.teknisi!.nama
    if (!kinerjaMaps[nama]) kinerjaMaps[nama] = { nama, selesai: 0, pendapatan: 0 }
    kinerjaMaps[nama].selesai++
    kinerjaMaps[nama].pendapatan += o.total_biaya || 0
  })
  const kinerjaTeknisi = Object.values(kinerjaMaps).sort((a, b) => b.selesai - a.selesai)

  // Layanan terpopuler
  const layananMap: Record<string, number> = {}
  orders.forEach(o => { layananMap[o.jenis_layanan] = (layananMap[o.jenis_layanan] || 0) + 1 })
  const layananPopuler = Object.entries(layananMap).sort((a, b) => b[1] - a[1])

  const totalPendapatan = orders.filter(o => o.status === 'selesai').reduce((sum, o) => sum + (o.total_biaya || 0), 0)
  const totalSelesai = orders.filter(o => o.status === 'selesai').length
  const totalBatal = orders.filter(o => o.status === 'batal').length

  function exportCSV() {
    const header = 'ID,Klien,Layanan,Jadwal,Status,Teknisi,Biaya\n'
    const rows = orders.map(o =>
      `${o.id},${o.klien?.nama ?? '-'},${o.jenis_layanan},${o.tanggal_jadwal},${o.status},${o.teknisi?.nama ?? '-'},${o.total_biaya ?? 0}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan-servis-ac-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) return <div style={{ padding: '2rem', color: '#64748b' }}>Memuat data...</div>

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>Laporan</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Analitik dan performa bisnis</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select value={periode} onChange={e => setPeriode(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}>
            <option value="3">3 Bulan</option>
            <option value="6">6 Bulan</option>
            <option value="12">12 Bulan</option>
          </select>
          <button onClick={exportCSV} style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Export CSV
          </button>
        </div>
      </div>

      {/* RINGKASAN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total order', value: orders.length, color: '#3b82f6' },
          { label: 'Order selesai', value: totalSelesai, color: '#10b981' },
          { label: 'Order batal', value: totalBatal, color: '#ef4444' },
          { label: 'Total pendapatan', value: `Rp ${totalPendapatan.toLocaleString('id-ID')}`, color: '#8b5cf6' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', borderTop: `4px solid ${c.color}` }}>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>{c.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>

        {/* GRAFIK PENDAPATAN */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Pendapatan per Bulan</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={bulanList}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`Rp ${v.toLocaleString('id-ID')}`, 'Pendapatan']} />
              <Line type="monotone" dataKey="pendapatan" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* GRAFIK ORDER */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Jumlah Order per Bulan</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bulanList}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Bar dataKey="total_order" name="Total Order" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="selesai" name="Selesai" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>

        {/* KINERJA TEKNISI */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Kinerja Teknisi</div>
          {kinerjaTeknisi.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '13px' }}>Belum ada data</div>
          ) : kinerjaTeknisi.map((t, i) => (
            <div key={t.nama} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < kinerjaTeknisi.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', color: '#1e40af' }}>
                {t.nama.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>{t.nama}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.selesai} order selesai</div>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>Rp {t.pendapatan.toLocaleString('id-ID')}</div>
            </div>
          ))}
        </div>

        {/* LAYANAN TERPOPULER */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Layanan Terpopuler</div>
          {layananPopuler.map(([nama, jumlah], i) => (
            <div key={nama} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: '#1e293b' }}>{nama}</span>
                <span style={{ color: '#64748b' }}>{jumlah}x</span>
              </div>
              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#3b82f6', borderRadius: '3px', width: `${(jumlah / orders.length) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
