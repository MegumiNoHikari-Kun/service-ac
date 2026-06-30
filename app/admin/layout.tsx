'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '../../components/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session && pathname !== '/admin/login') {
        router.push('/admin/login')
      }
      setChecking(false)
    }
    checkAuth()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== '/admin/login') {
        router.push('/admin/login')
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [pathname, router])

  if (checking) {
    return <div style={{ padding: '2rem', color: '#64748b' }}>Memeriksa akses...</div>
  }

  // Halaman login tidak perlu sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, background: '#f8fafc' }}>{children}</main>
    </div>
  )
}
