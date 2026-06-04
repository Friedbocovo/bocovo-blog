import { createBrowserRouter } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/shared/ProtectedRoute'
import HomePage from './pages/HomePage'
import PostDetailPage from './pages/PostDetailPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FavoritesPage from './pages/FavoritesPage'
import MessagingPage from './pages/MessagingPage'
import ProfilePage from './pages/ProfilePage'

/**
 * Routeur principal de l'application blog-visitor.
 * Routes publiques : /, /posts/:slug, /about, /login, /register
 * Routes protégées : /favorites, /messages, /profile
 */
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Routes publiques
      { path: '/', element: <HomePage /> },
      { path: '/posts/:slug', element: <PostDetailPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },

      // Routes protégées
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/favorites', element: <FavoritesPage /> },
          { path: '/messages', element: <MessagingPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
])

export default router
