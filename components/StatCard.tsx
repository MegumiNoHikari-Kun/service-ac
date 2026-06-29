type Props = {
  label: string
  value: number | string
  color?: string
}

export default function StatCard({ label, value, color = '#3b82f6' }: Props) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1.25rem 1.5rem',
      borderTop: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>{value}</div>
    </div>
  )
}