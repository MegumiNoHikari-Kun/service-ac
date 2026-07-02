'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function ReminderPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function kirimReminder() {
    setLoading(true)
    setResult(null)

    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const res = await fetch(`${projectUrl}/functions/v1/wa-reminder`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
    })
    
    const data = await res.json()
    const error = !res.ok ? { message: data.error ?? 'Gagal memanggil function' } : null

    setLoading(false)
    if (error) {
      setResult({ error: error.message })
    } else {
      setResult(data)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>WA Reminder</h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '2rem' }}>Kirim reminder otomatis ke klien yang servis 3 bulan lalu</p>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '14px', color: '#1e293b', marginBottom: '1rem', lineHeight: 1.6 }}>
          Sistem akan otomatis mencari klien yang <strong>terakhir servis tepat 3 bulan lalu</strong> dan mengirimkan pesan WA reminder sesuai template yang sudah diatur di halaman Pengaturan.
        </div>
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#15803d', marginBottom: '1.5rem' }}>
          💡 Jalankan ini setiap hari untuk hasil terbaik. Bisa juga diatur otomatis via Supabase Cron Job.
        </div>
        <button
          onClick={kirimReminder}
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: loading ? '#94a3b8' : '#25d366', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Mengirim reminder...' : '📲 Kirim WA Reminder Sekarang'}
        </button>
      </div>

      {result && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '10px' }}>Hasil Pengiriman</div>
          {result.error ? (
            <div style={{ color: '#dc2626', fontSize: '13px' }}>Error: {result.error}</div>
          ) : (
            <div>
              <div style={{ fontSize: '14px', color: '#16a34a', fontWeight: 500, marginBottom: '8px' }}>
                ✅ {result.sent} reminder berhasil dikirim
              </div>
              {result.results?.map((r: any, i: number) => (
                <div key={i} style={{ fontSize: '13px', color: '#64748b', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                  {r.klien} — {JSON.stringify(r.status)}
                </div>
              ))}
              {result.message && (
                <div style={{ fontSize: '13px', color: '#64748b' }}>{result.message}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
