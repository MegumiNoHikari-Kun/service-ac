'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const menus = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Daftar Order', href: '/admin/orders', icon: '📋' },
  { label: 'Booking Baru', href: '/admin/booking', icon: '➕' },
  { label: 'Data Klien', href: '/admin/klien', icon: '👥' },
  { label: 'Teknisi', href: '/admin/teknisi', icon: '🔧' },
  { label: 'Invoice', href: '/admin/invoice', icon: '🧾' },
  { label: 'Stok', href: '/admin/stok', icon: '📦' },
  { label: 'Laporan', href: '/admin/laporan', icon: '📈' },
  { label: 'WA Reminder', href: '/admin/reminder', icon: '📲' },
  { label: 'Pengaturan', href: '/admin/pengaturan', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside style={{
      width: '220px', minHeight: '100vh', background: '#1e293b', padding: '1.5rem 1rem',
      display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0,
    }}>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: '18px', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
        ❄️ Suejuk AC
      </div>
      {menus.map((menu) => {
        const active = pathname === menu.href
        return (
          <Link key={menu.href} href={menu.href} style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px',
            textDecoration: 'none', fontSize: '14px', fontWeight: active ? 600 : 400,
            color: active ? '#fff' : '#94a3b8', background: active ? '#3b82f6' : 'transparent',
          }}>
            <span>{menu.icon}</span>
            <span>{menu.label}</span>
          </Link>
        )
      })}
      <button onClick={handleLogout} style={{
        marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
        borderRadius: '8px', fontSize: '14px', color: '#f87171', background: 'transparent',
        border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        <span>🚪</span>
        <span>Keluar</span>
      </button>
    </aside>
  )
}
