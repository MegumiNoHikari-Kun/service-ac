'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type StokItem = {
  id: string
  nama: string
  satuan: string
  stok_saat_ini: number
  stok_minimum: number
  harga_satuan: number
}

export default function StokPage() {
  const [stokList, setStokList] = useState<StokItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showTransaksi, setShowTransaksi] = useState<StokItem | null>(null)
  const [form, setForm] = useState({ nama: '', satuan: 'pcs', stok_saat_ini: '', stok_minimum: '5', harga_satuan: '' })
  const [transaksi, setTransaksi] = useState({ tipe: 'masuk', jumlah: '', keterangan: '' })

  async function fetchStok() {
    const { data } = await supabase.from('stok').select('*').order('nama')
    if (data) setStokList(data)
    setLoading(false)
  }

  useEffect(() => { fetchStok() }, [])

  async function tambahStok(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('stok').insert({
      nama: form.nama,
      satuan: form.satuan,
      stok_saat_ini: parseInt(form.stok_saat_ini) || 0,
      stok_minimum: parseInt(form.stok_minimum) || 5,
      harga_satuan: parseInt(form.harga_satuan) || 0,
    })
    setForm({ nama: '', satuan: 'pcs', stok_saat_ini: '', stok_minimum: '5', harga_satuan: '' })
    setShowForm(false)
    fetchStok()
  }

  async function tambahTransaksi(e: React.FormEvent) {
    e.preventDefault()
    if (!showTransaksi) return
    const jumlah = parseInt(transaksi.jumlah)
    const stokBaru = transaksi.tipe === 'masuk'
      ? showTransaksi.stok_saat_ini + jumlah
      : showTransaksi.stok_saat_ini - jumlah

    await supabase.from('stok').update({ stok_saat_ini: stokBaru }).eq('id', showTransaksi.id)
    await supabase.from('stok_transaksi').insert({
      stok_id: showTransaksi.id,
      tipe: transaksi.tipe,
      jumlah,
      keterangan: transaksi.keterangan,
    })
    setTransaksi({ tipe: 'masuk', jumlah: '', keterangan: '' })
    setShowTransaksi(null)
    fetchStok()
  }

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none' }
  const stokMinim = stokList.filter(s => s.stok_saat_ini <= s.stok_minimum)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>Stok Suku Cadang</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>{stokList.length} item terdaftar</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          {showForm ? 'Batal' : '+ Tambah Item'}
        </button>
      </div>

      {/* ALERT STOK MINIM */}
      {stokMinim.length > 0 && (
        <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.5rem', fontSize: '13px', color: '#854d0e' }}>
          ⚠️ <strong>{stokMinim.length} item</strong> stoknya menipis: {stokMinim.map(s => s.nama).join(', ')}
        </div>
      )}

      {/* FORM TAMBAH */}
      {showForm && (
        <form onSubmit={tambahStok} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Nama part</label>
            <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Filter AC" style={inputStyle} required />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Satuan</label>
            <input value={form.satuan} onChange={e => setForm({ ...form, satuan: e.target.value })} placeholder="pcs / kg / liter" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Stok awal</label>
            <input type="number" value={form.stok_saat_ini} onChange={e => setForm({ ...form, stok_saat_ini: e.target.value })} placeholder="0" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Stok minimum</label>
            <input type="number" value={form.stok_minimum} onChange={e => setForm({ ...form, stok_minimum: e.target.value })} placeholder="5" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Harga satuan</label>
            <input type="number" value={form.harga_satuan} onChange={e => setForm({ ...form, harga_satuan: e.target.value })} placeholder="50000" style={inputStyle} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" style={{ width: '100%', padding: '8px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Simpan</button>
          </div>
        </form>
      )}

      {/* TABEL STOK */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Memuat...</div>
        ) : stokList.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Belum ada stok, tambahkan dulu</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Nama Part', 'Stok', 'Minimum', 'Harga Satuan', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stokList.map((item, i) => {
                const minim = item.stok_saat_ini <= item.stok_minimum
                return (
                  <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1e293b' }}>{item.nama}</td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{item.stok_saat_ini} {item.satuan}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.stok_minimum} {item.satuan}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>Rp {item.harga_satuan.toLocaleString('id-ID')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 500, background: minim ? '#fee2e2' : '#dcfce7', color: minim ? '#dc2626' : '#16a34a' }}>
                        {minim ? '⚠️ Minim' : '✓ Aman'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => setShowTransaksi(item)} style={{ padding: '6px 12px', background: '#eff6ff', color: '#1e40af', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                        Stok Masuk/Keluar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL TRANSAKSI */}
      {showTransaksi && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <form onSubmit={tambahTransaksi} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '380px' }}>
            <div style={{ fontWeight: 600, fontSize: '16px', color: '#1e293b', marginBottom: '1rem' }}>
              Update Stok — {showTransaksi.nama}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '1rem' }}>
              Stok saat ini: <strong>{showTransaksi.stok_saat_ini} {showTransaksi.satuan}</strong>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Tipe</label>
              <select value={transaksi.tipe} onChange={e => setTransaksi({ ...transaksi, tipe: e.target.value })} style={{ ...inputStyle, width: '100%' }}>
                <option value="masuk">Stok Masuk</option>
                <option value="keluar">Stok Keluar</option>
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Jumlah</label>
              <input type="number" value={transaksi.jumlah} onChange={e => setTransaksi({ ...transaksi, jumlah: e.target.value })} placeholder="0" style={inputStyle} required />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Keterangan</label>
              <input value={transaksi.keterangan} onChange={e => setTransaksi({ ...transaksi, keterangan: e.target.value })} placeholder="Beli dari toko ABC..." style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setShowTransaksi(null)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>Batal</button>
              <button type="submit" style={{ flex: 1, padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Simpan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
