import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'

/**
 * Route protégée — redirige vers /login?from=<url> si l'utilisateur n'est pas connecté.
 * Après connexion, l'utilisateur est redirigé vers l'URL d'origine.
 */
export default function ProtectedRoute() {
  const { token } = useAuthStore()
  const location = useLocation()

  if (!token) {
    const from = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?from=${from}`} replace />
  }

  return <Outlet />
}
