'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menus = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Daftar Order', href: '/orders', icon: '📋' },
  { label: 'Booking Baru', href: '/booking', icon: '➕' },
  { label: 'Data Klien', href: '/klien', icon: '👥' },
  { label: 'Teknisi', href: '/teknisi', icon: '🔧' },
  { label: 'Laporan', href: '/laporan', icon: '📈' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: '#1e293b',
      padding: '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      flexShrink: 0,
    }}>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: '18px', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
        ❄️ Suejuk AC
      </div>
      {menus.map((menu) => {
        const active = pathname === menu.href
        return (
          <Link key={menu.href} href={menu.href} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: active ? 600 : 400,
            color: active ? '#fff' : '#94a3b8',
            background: active ? '#3b82f6' : 'transparent',
            transition: 'all .15s',
          }}>
            <span>{menu.icon}</span>
            <span>{menu.label}</span>
          </Link>
        )
      })}
    </aside>
  )
}