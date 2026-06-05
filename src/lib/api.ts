import axios from 'axios'

/**
 * Client Axios centralisé pour communiquer avec l'API Laravel (port 8000).
 * Ajoute automatiquement le header Authorization: Bearer <token> si un token
 * est présent dans le localStorage (via authStore).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/**
 * Intercepteur de requête — injecte le Bearer token depuis localStorage.
 * Le token est stocké par authStore sous la clé 'blog-visitor-auth'.
 */
api.interceptors.request.use(
  (config) => {
    // Lecture du store persisté par zustand/persist (localStorage)
    const raw = localStorage.getItem('blog-visitor-auth')
    if (raw) {
      try {
        const stored = JSON.parse(raw) as { state?: { token?: string | null } }
        const token = stored?.state?.token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch {
        // JSON invalide, on continue sans token
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

/**
 * Intercepteur de réponse — gère les erreurs 401 (token expiré / invalide).
 * Déclenche un logout automatique en nettoyant le localStorage et en
 * redirigeant vers /login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Nettoyage du store persisté
      localStorage.removeItem('blog-visitor-auth')
      // Redirection vers la page de connexion
      const currentPath = window.location.pathname + window.location.search
      if (currentPath !== '/login') {
        window.location.href = `/login?from=${encodeURIComponent(currentPath)}`
      }
    }
    return Promise.reject(error)
  },
)

export default api
