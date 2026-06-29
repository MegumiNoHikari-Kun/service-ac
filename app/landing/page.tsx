import Link from 'next/link'

const layanan = [
  { nama: 'Cuci AC', harga: 'Rp 150.000', desc: 'Bersihkan filter, evaporator, dan kondensor AC kamu', icon: '🧹' },
  { nama: 'Isi Freon', harga: 'Rp 300.000', desc: 'Isi ulang freon AC yang sudah berkurang', icon: '❄️' },
  { nama: 'Service AC', harga: 'Rp 250.000', desc: 'Servis menyeluruh termasuk cek kelistrikan', icon: '🔧' },
  { nama: 'Pasang AC Baru', harga: 'Rp 500.000', desc: 'Instalasi AC baru termasuk pipa dan kabel', icon: '📦' },
  { nama: 'Bongkar AC', harga: 'Rp 200.000', desc: 'Bongkar unit AC lama dengan aman dan rapi', icon: '🛠️' },
]

const testimoni = [
  { nama: 'Budi Santoso', bintang: 5, pesan: 'Teknisi datang tepat waktu, AC langsung dingin. Recommended!' },
  { nama: 'Siti Rahayu', bintang: 5, pesan: 'Harga terjangkau, hasilnya memuaskan. Sudah langganan 2 tahun.' },
  { nama: 'Ahmad Fauzi', bintang: 5, pesan: 'Respon cepat, profesional. AC rumah jadi dingin lagi!' },
]

export default function LandingPage() {
  const nomorWA = '08123456789' // ganti dengan nomor WA kamu
  const pesanWA = encodeURIComponent('Halo, saya ingin booking servis AC')
  const linkWA = `https://wa.me/${nomorWA}?text=${pesanWA}`

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1e293b' }}>

      {/* NAVBAR */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontWeight: 700, fontSize: '18px', color: '#1e293b' }}>❄️ Suejuk AC</div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="#layanan" style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none' }}>Layanan</a>
          <a href="#harga" style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none' }}>Harga</a>
          <a href="#testimoni" style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none' }}>Testimoni</a>
          <a href={linkWA} target="_blank" style={{ padding: '8px 16px', background: '#25d366', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            WhatsApp
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%)', color: '#fff', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '4px 14px', borderRadius: '20px', marginBottom: '1.5rem' }}>
            Servis AC Profesional & Terpercaya
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
            AC Rusak? Kami Siap Datang ke Rumah Kamu
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.85, marginBottom: '2rem', lineHeight: 1.6 }}>
            Teknisi berpengalaman, harga transparan, garansi servis 30 hari. Melayani area Jakarta & sekitarnya.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/booking" style={{ padding: '14px 28px', background: '#fff', color: '#1e40af', borderRadius: '8px', textDecoration: 'none', fontSize: '16px', fontWeight: 700 }}>
              Booking Sekarang
            </Link>
            <a href={linkWA} target="_blank" style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '16px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.3)' }}>
              Chat WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* KEUNGGULAN */}
      <section style={{ padding: '4rem 2rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '⚡', title: 'Respon Cepat', desc: 'Teknisi datang dalam 2 jam setelah booking' },
            { icon: '💰', title: 'Harga Transparan', desc: 'Tidak ada biaya tersembunyi, harga sudah termasuk jasa' },
            { icon: '🛡️', title: 'Garansi 30 Hari', desc: 'Garansi servis selama 30 hari setelah pekerjaan selesai' },
            { icon: '👨‍🔧', title: 'Teknisi Berpengalaman', desc: 'Tim teknisi terlatih dan bersertifikat' },
          ].map((item) => (
            <div key={item.title} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '0.75rem' }}>{item.icon}</div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{item.title}</div>
              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LAYANAN & HARGA */}
      <section id="layanan" style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem' }}>Layanan & Harga</h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2.5rem' }}>Harga sudah termasuk jasa teknisi, belum termasuk spare part jika diperlukan</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {layanan.map((item) => (
              <div key={item.nama} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '28px' }}>{item.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '16px' }}>{item.nama}</div>
                <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, flex: 1 }}>{item.desc}</div>
                <div style={{ fontWeight: 700, fontSize: '18px', color: '#1e40af' }}>{item.harga}</div>
                <Link href="/booking" style={{ display: 'block', textAlign: 'center', padding: '8px', background: '#eff6ff', color: '#1e40af', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                  Booking
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONI */}
      <section id="testimoni" style={{ padding: '4rem 2rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: '2.5rem' }}>Apa Kata Pelanggan Kami</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {testimoni.map((t) => (
              <div key={t.nama} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ color: '#f59e0b', fontSize: '16px', marginBottom: '0.75rem' }}>{'⭐'.repeat(t.bintang)}</div>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, marginBottom: '1rem' }}>"{t.pesan}"</p>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>{t.nama}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 2rem', background: '#1e40af', color: '#fff', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '1rem' }}>Siap Booking Servis AC?</h2>
        <p style={{ opacity: 0.85, marginBottom: '2rem', fontSize: '16px' }}>Hubungi kami sekarang atau booking langsung online</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/booking" style={{ padding: '14px 28px', background: '#fff', color: '#1e40af', borderRadius: '8px', textDecoration: 'none', fontSize: '16px', fontWeight: 700 }}>
            Booking Online
          </Link>
          <a href={linkWA} target="_blank" style={{ padding: '14px 28px', background: '#25d366', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '16px', fontWeight: 600 }}>
            Chat WhatsApp
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '2rem', textAlign: 'center', fontSize: '14px' }}>
        <div style={{ marginBottom: '0.5rem', fontWeight: 600, color: '#fff' }}>❄️ Suejuk AC</div>
        <div>Melayani area Jakarta & sekitarnya · {new Date().getFullYear()}</div>
      </footer>

    </div>
  )
}
