const dateFmt = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const shortDateFmt = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
})

const dateTimeFmt = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDate(value?: string | null): string {
  if (!value) return '—'
  return dateFmt.format(new Date(value))
}

export function formatShortDate(value?: string | null): string {
  if (!value) return '—'
  return shortDateFmt.format(new Date(value))
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  return dateTimeFmt.format(new Date(value))
}

/** Human friendly expiry label like "Caduca mañana", "Caduca en 3 días". */
export function expiryLabel(value?: string | null): {
  text: string
  urgent: boolean
} {
  if (!value) return { text: 'Sin caducidad', urgent: false }
  const now = new Date()
  const exp = new Date(value)
  const ms = exp.getTime() - now.getTime()
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24))

  if (ms <= 0) return { text: 'Caducado', urgent: true }
  if (days === 1) return { text: 'Caduca mañana', urgent: true }
  if (days <= 3) return { text: `Caduca en ${days} días`, urgent: true }
  if (days <= 30)
    return { text: `Caduca en ${days} días`, urgent: false }
  return { text: `Válido hasta el ${formatDate(value)}`, urgent: false }
}
