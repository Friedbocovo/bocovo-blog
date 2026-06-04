interface AvatarProps {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

/** Génère des initiales à partir d'un nom complet */
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

/**
 * Composant Avatar — affiche la photo de profil ou un fallback avec les initiales
 * générées à partir du nom, sur fond coloré dérivé du nom.
 */
export default function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = sizeClasses[size]

  if (src) {
    return (
      <img
        src={src}
        alt={`Avatar de ${name}`}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    )
  }

  const initials = getInitials(name)

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center flex-shrink-0 font-medium select-none ${className}`}
      style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent)' }}
      aria-label={`Avatar de ${name}`}
    >
      {initials}
    </div>
  )
}
