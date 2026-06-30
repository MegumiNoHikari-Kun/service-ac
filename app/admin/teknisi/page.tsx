'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type Teknisi = {
  id: string
  nama: string
  nomor_wa: string
  aktif: boolean
}

type Order = {
  id: string
  jenis_layanan: string
  tanggal_jadwal: string
  status: string
  teknisi_id: string | null
  klien: { nama: string } | null
}

export default function TeknisiPage() {
  const [teknisiList, setTeknisiList] = useState<Teknisi[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Teknisi | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nama: '', nomor_wa: '' })

  async function fetchData() {
    const { data: tData } = await supabase.from('teknisi').select('*').order('nama')
    const { data: oData } = await supabase
      .from('orders')
      .select('id, jenis_layanan, tanggal_jadwal, status, teknisi_id, klien(nama)')
      .order('tanggal_jadwal', { ascending: false })

    if (tData) setTeknisiList(tData)
    if (oData) setOrders(oData as unknown as Order[])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function tambahTeknisi(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nama || !form.nomor_wa) return
    await supabase.from('teknisi').insert({ nama: form.nama, nomor_wa: form.nomor_wa, aktif: true })
    setForm({ nama: '', nomor_wa: '' })
    setShowForm(false)
    fetchData()
  }

  async function toggleAktif(id: string, aktif: boolean) {
    await supabase.from('teknisi').update({ aktif: !aktif }).eq('id', id)
    fetchData()
  }

  async function assignTeknisi(orderId: string, teknisiId: string) {
    await supabase.from('orders').update({ teknisi_id: teknisiId || null }).eq('id', orderId)
    fetchData()
  }

  const statusColor: Record<string, { bg: string; color: string }> = {
    pending:    { bg: '#fef9c3', color: '#ca8a04' },
    on_the_way: { bg: '#dbeafe', color: '#2563eb' },
    selesai:    { bg: '#dcfce7', color: '#16a34a' },
    batal:      { bg: '#fee2e2', color: '#dc2626' },
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '14px', outline: 'none',
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>Manajemen Teknisi</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>{teknisiList.length} teknisi terdaftar</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '10px 18px', background: '#3b82f6', color: '#fff', border: 'none',
          borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
        }}>
          {showForm ? 'Batal' : '+ Tambah Teknisi'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={tambahTeknisi} style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem',
          marginBottom: '1.5rem', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>Nama teknisi</label>
            <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Andi Wijaya" style={inputStyle} required />
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' }}>Nomor WhatsApp</label>
            <input value={form.nomor_wa} onChange={e => setForm({ ...form, nomor_wa: e.target.value })} placeholder="08111111111" style={inputStyle} required />
          </div>
          <button type="submit" style={{
            padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none',
            borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', height: '42px',
          }}>
            Simpan
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1rem' }}>

        {/* LIST TEKNISI */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Memuat...</div>
          ) : teknisiList.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Belum ada teknisi, tambahkan dulu</div>
          ) : teknisiList.map((t, i) => {
            const jumlahOrder = orders.filter(o => o.teknisi_id === t.id).length
            return (
              <div
                key={t.id}
                onClick={() => setSelected(t.id === selected?.id ? null : t)}
                style={{
                  padding: '14px 16px', borderTop: i > 0 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer',
                  background: selected?.id === t.id ? '#eff6ff' : i % 2 === 0 ? '#fff' : '#fafafa',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', background: t.aktif ? '#dcfce7' : '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px',
                  color: t.aktif ? '#16a34a' : '#94a3b8', flexShrink: 0,
                }}>
                  {t.nama.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, color: '#1e293b', fontSize: '14px' }}>{t.nama}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{t.nomor_wa} · {jumlahOrder} order</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleAktif(t.id, t.aktif) }}
                  style={{
                    fontSize: '11px', padding: '4px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                    background: t.aktif ? '#dcfce7' : '#f1f5f9', color: t.aktif ? '#16a34a' : '#94a3b8', fontWeight: 500,
                  }}
                >
                  {t.aktif ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>
            )
          })}
        </div>

        {/* DETAIL + ASSIGN ORDER */}
        {selected && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', alignSelf: 'start' }}>
            <div style={{ fontWeight: 600, fontSize: '16px', color: '#1e293b', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
              {selected.nama}
            </div>

            <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '10px' }}>
              Order yang ditugaskan
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {orders.filter(o => o.teknisi_id === selected.id).length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>Belum ada order yang ditugaskan</div>
              ) : orders.filter(o => o.teknisi_id === selected.id).map(o => (
                <div key={o.id} style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>{o.klien?.nama} · {o.jenis_layanan}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(o.tanggal_jadwal).toLocaleDateString('id-ID')}</div>
                  </div>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 500, background: statusColor[o.status]?.bg, color: statusColor[o.status]?.color }}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ASSIGN TEKNISI KE ORDER YANG BELUM PUNYA TEKNISI */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>
          Order belum ada teknisi
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          {orders.filter(o => !o.teknisi_id && o.status !== 'selesai' && o.status !== 'batal').length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Semua order sudah ada teknisinya 🎉</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>Klien</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>Layanan</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>Jadwal</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>Assign Teknisi</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter(o => !o.teknisi_id && o.status !== 'selesai' && o.status !== 'batal').map((o, i) => (
                  <tr key={o.id} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{o.klien?.nama ?? '-'}</td>
                    <td style={{ padding: '12px 16px', color: '#1e293b' }}>{o.jenis_layanan}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{new Date(o.tanggal_jadwal).toLocaleDateString('id-ID')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <select onChange={(e) => assignTeknisi(o.id, e.target.value)} defaultValue="" style={{
                        padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', cursor: 'pointer',
                      }}>
                        <option value="">-- Pilih teknisimu --</option>
                        {teknisiList.filter(t => t.aktif).map(t => (
                          <option key={t.id} value={t.id}>{t.nama}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
