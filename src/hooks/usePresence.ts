import { useEffect } from 'react'
import { createEcho } from '../lib/echo'
import useAuthStore from '../stores/authStore'

/**
 * Hook qui s'abonne au canal presence-online.
 * - Maintient la présence de l'utilisateur connecté
 * - Appelle onPostUpdated lors d'un événement PostUpdated (invalidation du cache)
 * 
 * TEMPORAIREMENT DÉSACTIVÉ : Railway ne supporte pas Reverb WebSocket
 */
export function usePresence(onPostUpdated?: () => void) {
  const { token } = useAuthStore()

  useEffect(() => {
    // Désactivé temporairement - Railway ne supporte pas les WebSockets
    return
    
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
