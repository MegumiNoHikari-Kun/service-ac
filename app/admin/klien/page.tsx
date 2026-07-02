'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type UnitAC = {
  id: string
  merek: string
  tipe: string
  pk: string
  tahun_beli: number
  lokasi: string
  catatan: string
}

type Klien = {
  id: string
  nama: string
  nomor_wa: string
  alamat: string
  created_at: string
  orders: { id: string; jenis_layanan: string; tanggal_jadwal: string; status: string }[]
  unit_ac: UnitAC[]
}

const statusColor: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#fef9c3', color: '#ca8a04' },
  on_the_way: { bg: '#dbeafe', color: '#2563eb' },
  selesai:    { bg: '#dcfce7', color: '#16a34a' },
  batal:      { bg: '#fee2e2', color: '#dc2626' },
}

export default function KlienPage() {
  const [klienList, setKlienList] = useState<Klien[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Klien | null>(null)
  const [showUnitForm, setShowUnitForm] = useState(false)
  const [unitForm, setUnitForm] = useState({ merek: '', tipe: '', pk: '', tahun_beli: '', lokasi: '', catatan: '' })

  async function fetchKlien() {
    const { data } = await supabase
      .from('klien')
      .select('*, orders(id, jenis_layanan, tanggal_jadwal, status), unit_ac(*)')
      .order('created_at', { ascending: false })
    if (data) setKlienList(data as Klien[])
    setLoading(false)
  }

  useEffect(() => { fetchKlien() }, [])

  async function tambahUnit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    await supabase.from('unit_ac').insert({
      klien_id: selected.id,
      merek: unitForm.merek,
      tipe: unitForm.tipe,
      pk: unitForm.pk,
      tahun_beli: parseInt(unitForm.tahun_beli) || null,
      lokasi: unitForm.lokasi,
      catatan: unitForm.catatan,
    })
    setUnitForm({ merek: '', tipe: '', pk: '', tahun_beli: '', lokasi: '', catatan: '' })
    setShowUnitForm(false)
    await fetchKlien()
    // refresh selected
    const updated = klienList.find(k => k.id === selected.id)
    if (updated) setSelected(updated)
  }

  async function hapusUnit(id: string) {
    await supabase.from('unit_ac').delete().eq('id', id)
    fetchKlien()
  }

  const filtered = klienList.filter(k =>
    k.nama.toLowerCase().includes(search.toLowerCase()) ||
    k.nomor_wa.includes(search)
  )

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none' }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>Data Klien</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '1.5rem' }}>Total {klienList.length} klien terdaftar</p>

      <input
        placeholder="Cari nama atau nomor WA..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', maxWidth: '360px', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '1.5rem', outline: 'none' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.2fr' : '1fr', gap: '1rem' }}>

        {/* LIST KLIEN */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Memuat...</div>
          ) : filtered.map((klien, i) => (
            <div
              key={klien.id}
              onClick={() => { setSelected(klien.id === selected?.id ? null : klien); setShowUnitForm(false) }}
              style={{
                padding: '14px 16px', borderTop: i > 0 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer',
                background: selected?.id === klien.id ? '#eff6ff' : i % 2 === 0 ? '#fff' : '#fafafa',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', color: '#1e40af', flexShrink: 0 }}>
                {klien.nama.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, color: '#1e293b', fontSize: '14px' }}>{klien.nama}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{klien.nomor_wa}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{klien.orders?.length ?? 0} order</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{klien.unit_ac?.length ?? 0} unit AC</div>
              </div>
            </div>
          ))}
        </div>

        {/* DETAIL KLIEN */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* INFO KLIEN */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px', color: '#1e40af' }}>
                  {selected.nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '16px', color: '#1e293b' }}>{selected.nama}</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Klien sejak {new Date(selected.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#94a3b8', width: '80px' }}>WhatsApp</span>
                  <a href={`https://wa.me/${selected.nomor_wa}`} target="_blank" style={{ color: '#25d366', fontWeight: 500 }}>{selected.nomor_wa}</a>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#94a3b8', width: '80px' }}>Alamat</span>
                  <span style={{ color: '#1e293b' }}>{selected.alamat ?? '-'}</span>
                </div>
              </div>
            </div>

            {/* UNIT AC */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Unit AC ({selected.unit_ac?.length ?? 0})
                </div>
                <button onClick={() => setShowUnitForm(!showUnitForm)} style={{ padding: '5px 10px', background: '#eff6ff', color: '#1e40af', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                  {showUnitForm ? 'Batal' : '+ Tambah Unit'}
                </button>
              </div>

              {showUnitForm && (
                <form onSubmit={tambahUnit} style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Merek *</label>
                      <input value={unitForm.merek} onChange={e => setUnitForm({ ...unitForm, merek: e.target.value })} placeholder="Sharp, Daikin, Panasonic..." style={inputStyle} required />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Tipe</label>
                      <input value={unitForm.tipe} onChange={e => setUnitForm({ ...unitForm, tipe: e.target.value })} placeholder="AH-A5SEY" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '3px' }}>PK</label>
                      <input value={unitForm.pk} onChange={e => setUnitForm({ ...unitForm, pk: e.target.value })} placeholder="1 PK / 1.5 PK" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Tahun beli</label>
                      <input type="number" value={unitForm.tahun_beli} onChange={e => setUnitForm({ ...unitForm, tahun_beli: e.target.value })} placeholder="2020" style={inputStyle} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Lokasi unit</label>
                      <input value={unitForm.lokasi} onChange={e => setUnitForm({ ...unitForm, lokasi: e.target.value })} placeholder="Kamar tidur lantai 2" style={inputStyle} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '3px' }}>Catatan</label>
                      <input value={unitForm.catatan} onChange={e => setUnitForm({ ...unitForm, catatan: e.target.value })} placeholder="Kondisi khusus, keluhan, dll" style={inputStyle} />
                    </div>
                  </div>
                  <button type="submit" style={{ padding: '8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    Simpan Unit AC
                  </button>
                </form>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {!selected.unit_ac || selected.unit_ac.length === 0 ? (
                  <div style={{ color: '#94a3b8', fontSize: '13px' }}>Belum ada unit AC tercatat</div>
                ) : selected.unit_ac.map(unit => (
                  <div key={unit.id} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '13px', color: '#1e293b' }}>❄️ {unit.merek} {unit.tipe}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                        {unit.pk && `${unit.pk} · `}
                        {unit.tahun_beli && `Tahun ${unit.tahun_beli} · `}
                        {unit.lokasi}
                      </div>
                      {unit.catatan && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{unit.catatan}</div>}
                    </div>
                    <button onClick={() => hapusUnit(unit.id)} style={{ padding: '4px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}>
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* RIWAYAT SERVIS */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '10px' }}>
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

          </div>
        )}
      </div>
    </div>
  )
}
