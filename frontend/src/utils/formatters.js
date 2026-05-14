export function formatCurrency(amount) {
  if (amount === 0) return 'Free'
  return `KES ${Number(amount).toLocaleString('en-KE')}`
}

export function formatDate(dateStr, options = {}) {
  if (!dateStr) return ''
  const defaults = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateStr).toLocaleDateString('en-KE', { ...defaults, ...options })
}

export function formatDateLong(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(dateStr) {
  return `${formatDate(dateStr)} at ${formatTime(dateStr)}`
}

export function isUpcoming(dateStr) {
  return new Date(dateStr) > new Date()
}

export function isPast(dateStr) {
  return new Date(dateStr) < new Date()
}
