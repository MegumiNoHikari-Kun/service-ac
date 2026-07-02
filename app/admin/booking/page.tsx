'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminBookingPage() {
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
      setTimeout(() => router.push('/admin/orders'), 2000)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
    borderRadius: '8px', fontSize: '14px', color: '#1e293b', background: '#fff', outline: 'none',
  }

  const labelStyle = {
    fontSize: '13px', fontWeight: 500 as const, color: '#374151',
    marginBottom: '6px', display: 'block' as const,
  }

  if (success) return (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px',