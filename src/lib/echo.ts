import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// Déclaration globale pour TypeScript
declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

// Rendre Pusher disponible globalement (requis par laravel-echo)
window.Pusher = Pusher

/**
 * Initialise une instance Laravel Echo connectée à Laravel Reverb.
 * Les credentials Reverb correspondent à ceux configurés dans blog-api/.env
 * (REVERB_APP_KEY, REVERB_HOST, REVERB_PORT).
 *
 * @param token - Token Bearer Sanctum de l'utilisateur authentifié.
 *                Si null, les canaux privés/présence ne seront pas accessibles.
 */
function createEcho(token: string | null = null): Echo<'reverb'> {
  return new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY ?? 'local',
    wsHost: import.meta.env.VITE_REVERB_HOST ?? 'localhost',
    wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    // Authentification des canaux privés/présence via l'API Laravel
    authEndpoint: `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080'}/broadcasting/auth`,
    auth: {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    },
  })
}

export { createEcho }
export type { Echo }
