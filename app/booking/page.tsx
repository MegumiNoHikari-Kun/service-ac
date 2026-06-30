'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function BookingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    nama: '',
    nomor_wa: '',
    alamat: '',
    jenis_layanan: '',
    tanggal_jadwal: '',
    catatan: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // Simpan atau ambil klien
    let klienId: string

    const { data: existingKlien } = await supabase
      .from('klien')
      .select('id')
      .eq('nomor_wa', form.nomor_wa)
      .single()

    if (existingKlien) {
      klienId = existingKlien.id
    } else {
      const { data: newKlien, error } = await supabase
        .from('klien')
        .insert({ nama: form.nama, nomor_wa: form.nomor_wa, alamat: form.alamat })
        .select('id')
        .single()
      if (error || !newKlien) { setLoading(false); return }
      klienId = newKlien.id
    }

    // Simpan order
    const { error: orderError } = await supabase.from('orders').insert({
      klien_id: klienId,
      jenis_layanan: form.jenis_layanan,
      tanggal_jadwal: form.tanggal_jadwal,
      catatan: form.catatan,
      status: 'pending',
    })

    setLoading(false)
    if (!orderError) {
      setSuccess(true)
      setTimeout(() => router.push('/orders'), 2000)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    background: '#fff',
    outline: 'none',
  }

  const labelStyle = {
    fontSize: '13px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px',
    display: 'block',
  }

  if (success) return (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Booking berhasil!</h2>
        <p style={{ color: '#64748b' }}>Mengalihkan ke daftar order...</p>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>Form Booking</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '2rem' }}>Isi data pelanggan dan jadwal servis</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>Data Pelanggan</div>

          <div>
            <label style={labelStyle}>Nama lengkap</label>
            <input name="nama" value={form.nama} onChange={handleChange} required placeholder="Budi Santoso" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Nomor WhatsApp</label>
            <input name="nomor_wa" value={form.nomor_wa} onChange={handleChange} required placeholder="08123456789" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Alamat lengkap</label>
            <input name="alamat" value={form.alamat} onChange={handleChange} required placeholder="Jl. Merdeka No.10, Jakarta" style={inputStyle} />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>Detail Servis</div>

          <div>
            <label style={labelStyle}>Jenis layanan</label>
            <select name="jenis_layanan" value={form.jenis_layanan} onChange={handleChange} required style={inputStyle}>
              <option value="">-- Pilih layanan --</option>
              <option value="Cuci AC">Cuci AC — Rp 150.000</option>
              <option value="Isi Freon">Isi Freon — Rp 300.000</option>
              <option value="Service AC">Service AC — Rp 250.000</option>
              <option value="Pasang AC Baru">Pasang AC Baru — Rp 500.000</option>
              <option value="Bongkar AC">Bongkar AC — Rp 200.000</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tanggal jadwal</label>
            <input name="tanggal_jadwal" type="date" value={form.tanggal_jadwal} onChange={handleChange} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Catatan tambahan (opsional)</label>
            <textarea name="catatan" value={form.catatan} onChange={handleChange} placeholder="Contoh: AC di kamar lantai 2, merek Sharp 1 PK" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>

        <button type="submit" disabled={loading} style={{
          padding: '12px',
          background: loading ? '#94a3b8' : '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}>
          {loading ? 'Menyimpan...' : 'Buat Order'}
        </button>
      </form>
    </div>
  )
}
