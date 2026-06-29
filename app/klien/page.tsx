'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Klien = {
  id: string
  nama: string
  nomor_wa: string
  alamat: string
  created_at: string
  orders: { id: string; jenis_layanan: string; tanggal_jadwal: string; status: string }[]
}

export default function KlienPage() {
  const [klienList, setKlienList] = useState<Klien[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Klien | null>(null)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('klien')
        .select('*, orders(id, jenis_layanan, tanggal_jadwal, status)')
        .order('created_at', { ascending: false })
      if (data) setKlienList(data as Klien[])
      setLoading(false)
    }
    fetch()
  }, [])

  const filtered = klienList.filter(k =>
    k.nama.toLowerCase().includes(search.toLowerCase()) ||
    k.nomor_wa.includes(search)
  )

  const statusColor: Record<string, { bg: string; color: string }> = {
    pending:    { bg: '#fef9c3', color: '#ca8a04' },
    on_the_way: { bg: '#dbeafe', color: '#2563eb' },
    selesai:    { bg: '#dcfce7', color: '#16a34a' },
    batal:      { bg: '#fee2e2', color: '#dc2626' },
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '960px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>Data Klien</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '1.5rem' }}>Total {klienList.length} klien terdaftar</p>

      <input
        placeholder="Cari nama atau nomor WA..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', maxWidth: '360px', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '1.5rem', outline: 'none' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1rem' }}>

        {/* LIST KLIEN */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Memuat...</div>
          ) : filtered.map((klien, i) => (
            <div
              key={klien.id}
              onClick={() => setSelected(klien.id === selected?.id ? null : klien)}
              style={{
                padding: '14px 16px',
                borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
                cursor: 'pointer',
                background: selected?.id === klien.id ? '#eff6ff' : i % 2 === 0 ? '#fff' : '#fafafa',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', color: '#1e40af', flexShrink: 0 }}>
                {klien.nama.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, color: '#1e293b', fontSize: '14px' }}>{klien.nama}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{klien.nomor_wa}</div>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', flexShrink: 0 }}>
                {klien.orders?.length ?? 0} order
              </div>
            </div>
          ))}
        </div>

        {/* DETAIL KLIEN */}
        {selected && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', alignSelf: 'start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px', color: '#1e40af' }}>
                {selected.nama.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '16px', color: '#1e293b' }}>{selected.nama}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Klien sejak {new Date(selected.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem', fontSize: '13px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#94a3b8', width: '80px' }}>WhatsApp</span>
                <a href={`https://wa.me/${selected.nomor_wa}`} target="_blank" style={{ color: '#25d366', fontWeight: 500 }}>{selected.nomor_wa}</a>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#94a3b8', width: '80px' }}>Alamat</span>
                <span style={{ color: '#1e293b' }}>{selected.alamat ?? '-'}</span>
              </div>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '8px' }}>
              Riwayat Servis ({selected.orders?.length ?? 0})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selected.orders?.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>Belum ada riwayat servis</div>
              ) : selected.orders.map(o => (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>{o.jenis_layanan}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(o.tanggal_jadwal).toLocaleDateString('id-ID')}</div>
                  </div>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 500, background: statusColor[o.status]?.bg ?? '#f1f5f9', color: statusColor[o.status]?.color ?? '#64748b' }}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
