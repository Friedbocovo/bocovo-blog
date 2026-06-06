import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import * as fc from 'fast-check'
import PostDetailPage from './PostDetailPage'
import api from '../lib/api'
import useAuthStore from '../stores/authStore'
import useInteractionStore from '../stores/interactionStore'

// Mock des modules
vi.mock('../lib/api')
vi.mock('../stores/authStore')
vi.mock('../stores/interactionStore')

const mockNavigate = vi.fn()
let mockSlug = 'test-article'
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ slug: mockSlug })
  }
})

// Composant de test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

// Test data
const samplePost = {
  id: 1,
  title: 'Article de test',
  content: '<p>Contenu de test</p>',
  slug: 'article-de-test',
  published_at: '2024-01-01T10:00:00.000Z',
  created_at: '2024-01-01T10:00:00.000Z',
  views_count: 100,
  likes_count: 5,
  tags: [{ id: 1, name: 'React', slug: 'react' }],
  user: { id: 1, name: 'Auteur Test', email: 'author@test.com' }
}

const sampleComments = [
  { id: 1, content: 'Commentaire test', created_at: '2024-01-01T11:00:00.000Z', 
    user: { id: 2, name: 'Commentateur', email: 'commenter@test.com' }, replies: [] }
]

describe('PostDetailPage - Tests de Propriétés de Préservation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSlug = 'article-de-test'
    // Setup des mocks par défaut pour interactionStore
    ;(useInteractionStore as any).mockReturnValue({
      isLiked: vi.fn(() => false),
      isFavorited: vi.fn(() => false),
      setLiked: vi.fn(),
      setFavorited: vi.fn(),
      toggleLike: vi.fn(() => true),
      toggleFavorite: vi.fn(() => true)
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  /**
   * **Validates: Requirements 3.2**
   * Property 2a: Preservation - Comportement Utilisateur Non Connecté
   * 
   * QUAND l'utilisateur n'est pas connecté 
   * ALORS le système DOIT CONTINUER À afficher l'article avec des statuts par défaut (liked: false, favorited: false)
   */
  it('Property 2a: Utilisateur non connecté voit article avec statuts par défaut', async () => {
    // Setup: Utilisateur non connecté
    ;(useAuthStore as any).mockReturnValue({
      token: null,
      user: null
    })

    // Setup: API responses pour utilisateur non connecté (pas de requête status)
    const mockedApi = api as any
    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/posts/article-de-test') {
        return Promise.resolve({ data: samplePost })
      }
      if (url === '/posts/article-de-test/comments') {
        return Promise.resolve({ data: sampleComments })
      }
      throw new Error(`Unexpected API call: ${url}`)
    })

    // Act: Render du composant
    render(
      <TestWrapper>
        <PostDetailPage />
      </TestWrapper>
    )

    // Assert: L'article doit s'afficher
    await waitFor(() => {
      expect(screen.getByText('Article de test')).toBeInTheDocument()
    })

    // Vérification que seules les requêtes nécessaires ont été faites (pas de status pour utilisateur non connecté)
    expect(mockedApi.get).toHaveBeenCalledWith('/posts/article-de-test')
    expect(mockedApi.get).toHaveBeenCalledWith('/posts/article-de-test/comments')
    expect(mockedApi.get).not.toHaveBeenCalledWith('/posts/article-de-test/status')

    // Pas de redirection vers l'accueil
    expect(mockNavigate).not.toHaveBeenCalledWith('/')
  })

  /**
   * **Validates: Requirements 3.1, 3.3**
   * Property 2b: Preservation - API Status Fonctionnelle
   * 
   * QUAND l'endpoint `/posts/{slug}/status` fonctionne correctement 
   * ALORS le système DOIT CONTINUER À charger les vrais statuts liked/favorited de l'utilisateur
   */
  it('Property 2b: API status fonctionnelle charge vrais statuts utilisateur', async () => {
    const mockUser = { id: 1, name: 'User Test', email: 'user@test.com' }
    const mockSetLiked = vi.fn()
    const mockSetFavorited = vi.fn()

    // Setup: Utilisateur connecté
    ;(useAuthStore as any).mockReturnValue({
      token: 'valid-token',
      user: mockUser
    })

    ;(useInteractionStore as any).mockReturnValue({
      isLiked: vi.fn(() => true),
      isFavorited: vi.fn(() => false),
      setLiked: mockSetLiked,
      setFavorited: mockSetFavorited,
      toggleLike: vi.fn(() => false),
      toggleFavorite: vi.fn(() => true)
    })

    // Setup: API responses toutes fonctionnelles
    const mockedApi = api as any
    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/posts/article-de-test') {
        return Promise.resolve({ data: samplePost })
      }
      if (url === '/posts/article-de-test/comments') {
        return Promise.resolve({ data: sampleComments })
      }
      if (url === '/posts/article-de-test/status') {
        return Promise.resolve({ data: { liked: true, favorited: false } })
      }
      throw new Error(`Unexpected API call: ${url}`)
    })

    // Act: Render du composant
    render(
      <TestWrapper>
        <PostDetailPage />
      </TestWrapper>
    )

    // Assert: L'article doit s'afficher
    await waitFor(() => {
      expect(screen.getByText('Article de test')).toBeInTheDocument()
    })

    // Vérification que toutes les requêtes ont été faites
    expect(mockedApi.get).toHaveBeenCalledWith('/posts/article-de-test')
    expect(mockedApi.get).toHaveBeenCalledWith('/posts/article-de-test/comments')
    expect(mockedApi.get).toHaveBeenCalledWith('/posts/article-de-test/status')

    // Vérification que les vrais statuts ont été chargés
    await waitFor(() => {
      expect(mockSetLiked).toHaveBeenCalledWith(1, true)
      expect(mockSetFavorited).toHaveBeenCalledWith(1, false)
    })

    // Pas de redirection vers l'accueil
    expect(mockNavigate).not.toHaveBeenCalledWith('/')
  })

  /**
   * **Validates: Requirements 3.4**
   * Property 2c: Preservation - Article Inexistant
   * 
   * QUAND l'article n'existe pas (vraie erreur 404 sur `/posts/{slug}`) 
   * ALORS le système DOIT CONTINUER À rediriger vers l'accueil
   */
  it('Property 2c: Article inexistant redirige vers accueil', async () => {
    const mockUser = { id: 1, name: 'User Test', email: 'user@test.com' }
    
    // Setup: Utilisateur connecté
    ;(useAuthStore as any).mockReturnValue({
      token: 'valid-token',
      user: mockUser
    })

    // Setup: API retourne 404 pour l'article
    const mockedApi = api as any
    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/posts/article-de-test') {
        const error = new Error('Post not found')
        ;(error as any).response = { status: 404 }
        return Promise.reject(error)
      }
      if (url === '/posts/article-de-test/comments') {
        return Promise.resolve({ data: [] })
      }
      if (url === '/posts/article-de-test/status') {
        return Promise.resolve({ data: { liked: false, favorited: false } })
      }
      throw new Error(`Unexpected API call: ${url}`)
    })

    // Act: Render du composant
    render(
      <TestWrapper>
        <PostDetailPage />
      </TestWrapper>
    )

    // Assert: Doit rediriger vers l'accueil à cause de l'article manquant
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  /**
   * **Validates: Requirements 3.3**
   * Property 2d: Preservation - Fonctionnement Complet Normal (Property-Based Test)
   * 
   * QUAND toutes les requêtes API réussissent 
   * ALORS le système DOIT CONTINUER À fonctionner exactement comme avant
   */
  it('Property 2d: Fonctionnement complet normal inchangé', async () => {
    // Générateur simple pour les statuts
    const statusGenerator = fc.record({
      liked: fc.boolean(),
      favorited: fc.boolean()
    })

    await fc.assert(
      fc.asyncProperty(
        statusGenerator,
        async (status) => {
          const mockUser = { id: 1, name: 'User Test', email: 'user@test.com' }
          const mockSetLiked = vi.fn()
          const mockSetFavorited = vi.fn()

          // Setup: Utilisateur connecté
          ;(useAuthStore as any).mockReturnValue({
            token: 'valid-token',
            user: mockUser
          })

          ;(useInteractionStore as any).mockReturnValue({
            isLiked: vi.fn(() => status.liked),
            isFavorited: vi.fn(() => status.favorited),
            setLiked: mockSetLiked,
            setFavorited: mockSetFavorited,
            toggleLike: vi.fn(() => !status.liked),
            toggleFavorite: vi.fn(() => !status.favorited)
          })

          // Setup: Toutes les API fonctionnent parfaitement
          const mockedApi = api as any
          mockedApi.get.mockImplementation((url: string) => {
            if (url === '/posts/article-de-test') {
              return Promise.resolve({ data: samplePost })
            }
            if (url === '/posts/article-de-test/comments') {
              return Promise.resolve({ data: sampleComments })
            }
            if (url === '/posts/article-de-test/status') {
              return Promise.resolve({ data: status })
            }
            throw new Error(`Unexpected API call: ${url}`)
          })

          // Act: Render du composant
          render(
            <TestWrapper>
              <PostDetailPage />
            </TestWrapper>
          )

          // Assert: Comportement complet normal
          await waitFor(() => {
            expect(screen.getByText('Article de test')).toBeInTheDocument()
            expect(screen.getByText('Auteur Test')).toBeInTheDocument()
          })

          // Toutes les requêtes ont été effectuées
          expect(mockedApi.get).toHaveBeenCalledWith('/posts/article-de-test')
          expect(mockedApi.get).toHaveBeenCalledWith('/posts/article-de-test/comments')
          expect(mockedApi.get).toHaveBeenCalledWith('/posts/article-de-test/status')

          // Les statuts ont été correctement chargés
          await waitFor(() => {
            expect(mockSetLiked).toHaveBeenCalledWith(1, status.liked)
            expect(mockSetFavorited).toHaveBeenCalledWith(1, status.favorited)
          })

          // Pas de redirection
          expect(mockNavigate).not.toHaveBeenCalled()

          // La section commentaires est affichée
          expect(screen.getByText('Commentaires')).toBeInTheDocument()
        }
      ),
      { numRuns: 5 } // Réduire le nombre de runs pour éviter les timeouts
    )
  })
})