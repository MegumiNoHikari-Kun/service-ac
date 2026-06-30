'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Order = {
  id: string
  jenis_layanan: string
  tanggal_jadwal: string
  status: string
  total_biaya: number
  catatan: string
  created_at: string
  klien: { nama: string; nomor_wa: string; alamat: string } | null
}

export default function InvoicePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Order | null>(null)
  const [biaya, setBiaya] = useState('')

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('orders')
        .select('*, klien(nama, nomor_wa, alamat)')
        .eq('status', 'selesai')
        .order('created_at', { ascending: false })
      if (data) setOrders(data as Order[])
      setLoading(false)
    }
    fetch()
  }, [])

  async function simpanBiaya(id: string) {
    await supabase.from('orders').update({ total_biaya: parseInt(biaya) }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, total_biaya: parseInt(biaya) } : o))
    setSelected(prev => prev ? { ...prev, total_biaya: parseInt(biaya) } : null)
    setBiaya('')
  }

  function cetakInvoice(order: Order) {
    const tgl = new Date(order.tanggal_jadwal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const isi = `
INVOICE SERVIS AC
=================
Suejuk AC

Kepada: ${order.klien?.nama ?? '-'}
WA    : ${order.klien?.nomor_wa ?? '-'}
Alamat: ${order.klien?.alamat ?? '-'}

Tanggal : ${tgl}
Layanan : ${order.jenis_layanan}
Catatan : ${order.catatan ?? '-'}

TOTAL   : Rp ${(order.total_biaya ?? 0).toLocaleString('id-ID')}
Status  : LUNAS

Terima kasih telah menggunakan Suejuk AC!
Garansi servis 30 hari.
    `.trim()

    const win = window.open('', '_blank')
    if (win) {
      win.document.write(`<pre style="font-family:monospace;padding:2rem;font-size:14px">${isi}</pre>`)
      win.print()
    }
  }

  function kirimWA(order: Order) {
    const tgl = new Date(order.tanggal_jadwal).toLocaleDateString('id-ID')
    const pesan = `Halo ${order.klien?.nama}, terima kasih sudah menggunakan Suejuk AC!\n\nLayanan: ${order.jenis_layanan}\nTanggal: ${tgl}\nTotal: Rp ${(order.total_biaya ?? 0).toLocaleString('id-ID')}\n\nGaransi servis 30 hari. Terima kasih! 🙏`
    window.open(`https://wa.me/${order.klien?.nomor_wa}?text=${encodeURIComponent(pesan)}`, '_blank')
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '960px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>Invoice</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '1.5rem' }}>Order selesai — {orders.length} invoice</p>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1rem' }}>

        {/* LIST ORDER SELESAI */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>
            Order selesai
          </div>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Memuat...</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Belum ada order selesai</div>
          ) : orders.map((order, i) => (
            <div
              key={order.id}
              onClick={() => { setSelected(order.id === selected?.id ? null : order); setBiaya(String(order.total_biaya ?? '')) }}
              style={{ padding: '12px 16px', borderTop: i > 0 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer', background: selected?.id === order.id ? '#eff6ff' : i % 2 === 0 ? '#fff' : '#fafafa' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '14px', color: '#1e293b' }}>{order.klien?.nama ?? '-'}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{order.jenis_layanan} · {new Date(order.tanggal_jadwal).toLocaleDateString('id-ID')}</div>
                </div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: order.total_biaya ? '#16a34a' : '#94a3b8' }}>
                  {order.total_biaya ? `Rp ${order.total_biaya.toLocaleString('id-ID')}` : 'Belum diisi'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DETAIL INVOICE */}
        {selected && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', alignSelf: 'start' }}>
            <div style={{ fontWeight: 600, fontSize: '16px', color: '#1e293b', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
              Detail Invoice
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginBottom: '1rem' }}>
              {[
                ['Klien', selected.klien?.nama ?? '-'],
                ['WhatsApp', selected.klien?.nomor_wa ?? '-'],
                ['Alamat', selected.klien?.alamat ?? '-'],
                ['Layanan', selected.jenis_layanan],
                ['Tanggal', new Date(selected.tanggal_jadwal).toLocaleDateString('id-ID')],
                ['Catatan', selected.catatan ?? '-'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#94a3b8', width: '80px', flexShrink: 0 }}>{label}</span>
                  <span style={{ color: '#1e293b' }}>{val}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px', marginBottom: '1rem' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Total biaya</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="contoh: 150000"
                  value={biaya}
                  onChange={e => setBiaya(e.target.value)}
                  style={{ flex: 1, padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                />
                <button onClick={() => simpanBiaya(selected.id)} style={{ padding: '8px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Simpan
                </button>
              </div>
              {selected.total_biaya > 0 && (
                <div style={{ marginTop: '8px', fontWeight: 700, fontSize: '18px', color: '#16a34a' }}>
                  Rp {selected.total_biaya.toLocaleString('id-ID')}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => cetakInvoice(selected)} style={{ padding: '10px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Cetak Invoice
              </button>
              <button onClick={() => kirimWA(selected)} style={{ padding: '10px', background: '#25d366', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Kirim via WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
