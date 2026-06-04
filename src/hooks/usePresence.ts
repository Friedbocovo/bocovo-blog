import { useEffect } from 'react'
import { createEcho } from '../lib/echo'
import useAuthStore from '../stores/authStore'

/**
 * Hook qui s'abonne au canal presence-online.
 * - Maintient la présence de l'utilisateur connecté
 * - Appelle onPostUpdated lors d'un événement PostUpdated (invalidation du cache)
 */
export function usePresence(onPostUpdated?: () => void) {
  const { token } = useAuthStore()

  useEffect(() => {
    if (!token) return

    const echo = createEcho(token)

    echo
      .join('online')
      .here(() => {})
      .joining(() => {})
      .leaving(() => {})
      .listen('PostUpdated', () => {
        onPostUpdated?.()
      })

    return () => {
      echo.leave('online')
      echo.disconnect()
    }
  }, [token, onPostUpdated])
}
