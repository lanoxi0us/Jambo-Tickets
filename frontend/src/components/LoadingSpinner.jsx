export default function LoadingSpinner({ size = 'md', color = 'crimson' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const colors = { crimson: 'border-crimson', white: 'border-white', navy: 'border-navy' }
  return (
    <div className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full animate-spin`} />
  )
}
