import type { Metadata } from 'next'
import Sidebar from '../components/Sidebar'

export const metadata: Metadata = {
  title: 'Suejuk AC — Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, display: 'flex', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
        <Sidebar />
        <main style={{ flex: 1, minHeight: '100vh' }}>
          {children}
        </main>
      </body>
    </html>
  )
}