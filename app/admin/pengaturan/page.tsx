'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type Layanan = { nama: string; harga: number }
type Pengaturan = {
  id: string
  nama_usaha: string
  nomor_wa: string
  alamat: string
  kota: string
  template_wa: string
  layanan: Layanan[]
}

export default function PengaturanPage() {
  const [data, setData] = useState<Pengaturan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function fetch() {
      const { data: d } = await supabase.from('pengaturan').select('*').single()
      if (d) setData(d)
      setLoading(false)
    }
    fetch()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!data) return
    setSaving(true)
    await supabase.from('pengaturan').update(data).eq('id', data.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function updateLayanan(i: number, field: 'nama' | 'harga', value: string) {
    if (!data) return
    const updated = [...data.layanan]
    updated[i] = { ...updated[i], [field]: field === 'harga' ? parseInt(value) || 0 : value }
    setData({ ...data, layanan: updated })
  }

  function tambahLayanan() {
    if (!data) return
    setData({ ...data, layanan: [...data.layanan, { nama: '', harga: 0 }] })
  }

  function hapusLayanan(i: number) {
    if (!data) return
    setData({ ...data, layanan: data.layanan.filter((_, idx) => idx !== i) })
  }

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }
  const labelStyle = { fontSize: '13px', fontWeight: 500 as const, color: '#374151', marginBottom: '6px', display: 'block' as const }

  if (loading) return <div style={{ padding: '2rem', color: '#64748b' }}>Memuat...</div>
  if (!data) return <div style={{ padding: '2rem', color: '#ef4444' }}>Data pengaturan tidak ditemukan</div>

  return (
    <div style={{ padding: '2rem', maxWidth: '700px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>Pengaturan</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '2rem' }}>Profil usaha, tarif layanan, dan template WA</p>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* PROFIL USAHA */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '1rem' }}>Profil Usaha</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Nama usaha</label>
              <input value={data.nama_usaha} onChange={e => setData({ ...data, nama_usaha: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nomor WhatsApp</label>
              <input value={data.nomor_wa} onChange={e => setData({ ...data, nomor_wa: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Kota</label>
              <input value={data.kota} onChange={e => setData({ ...data, kota: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Alamat</label>
              <input value={data.alamat} onChange={e => setData({ ...data, alamat: e.target.value })} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* TARIF LAYANAN */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>Tarif Layanan</div>
            <button type="button" onClick={tambahLayanan} style={{ padding: '6px 12px', background: '#eff6ff', color: '#1e40af', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
              + Tambah
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.layanan.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input value={l.nama} onChange={e => updateLayanan(i, 'nama', e.target.value)} placeholder="Nama layanan" style={{ ...inputStyle, flex: 2 }} />
                <input type="number" value={l.harga} onChange={e => updateLayanan(i, 'harga', e.target.value)} placeholder="Harga" style={{ ...inputStyle, flex: 1 }} />
                <button type="button" onClick={() => hapusLayanan(i)} style={{ padding: '8px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', flexShrink: 0 }}>✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* TEMPLATE WA */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '1rem' }}>Template Pesan WA</div>
          <label style={labelStyle}>Template reminder 3 bulan</label>
          <textarea
            value={data.template_wa}
            onChange={e => setData({ ...data, template_wa: e.target.value })}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Halo {nama}, sudah 3 bulan sejak servis terakhir..."
          />
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
            Variabel: <code>{'{nama}'}</code> = nama klien, <code>{'{layanan}'}</code> = jenis layanan terakhir, <code>{'{tanggal}'}</code> = tanggal servis terakhir
          </div>
        </div>

        <button type="submit" disabled={saving} style={{
          padding: '12px', background: saving ? '#94a3b8' : saved ? '#16a34a' : '#3b82f6',
          color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
        }}>
          {saving ? 'Menyimpan...' : saved ? '✓ Tersimpan!' : 'Simpan Pengaturan'}
        </button>
      </form>
    </div>
  )
}
