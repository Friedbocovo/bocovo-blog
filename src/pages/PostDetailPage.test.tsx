import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import * as fc from 'fast-check'
import PostDetailPage from './PostDetailPage'
import api from '../lib/api'

// Mock du module react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  }
})

// Mock du module API
vi.mock('../lib/api')

// Mock des stores
vi.mock('../stores/authStore', () => ({
  default: vi.fn(() => ({
    token: 'mock-token',
    user: { id: 1, name: 'Test User', avatar: 'avatar.jpg' },
  })),
}))

vi.mock('../stores/interactionStore', () => ({
  default: vi.fn(() => ({
    isLiked: vi.fn(() => false),
    isFavorited: vi.fn(() => false),
    setLiked: vi.fn(),
    setFavorited: vi.fn(),
    toggleLike: vi.fn(() => true),
    toggleFavorite: vi.fn(() => true),
  })),
}))

const mockNavigate = vi.fn()
const mockUseParams = vi.fn()

// Configuration du mock react-router-dom
vi.mock('react-router-dom', () => ({
  useParams: () => mockUseParams(),
  useNavigate: () => mockNavigate,
}))

const mockApi = vi.mocked(api)

describe('PostDetailPage - Bug Condition Exploration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Configuration des mocks pour chaque test
    vi.mocked(mockUseParams).mockImplementation(() => mockUseParams)
  })

  /**
   * **Validates: Requirements 1.1, 1.2, 1.3**
   * 
   * Property 1: Bug Condition - Échec Promise.all avec Status 404
   * 
   * CRITIQUE: Ce test DOIT ÉCHOUER sur le code non-corrigé - l'échec confirme que le bug existe
   * 
   * Ce test encode le comportement attendu: quand l'endpoint /posts/{slug}/status retourne 404,
   * l'utilisateur connecté devrait voir l'article avec des valeurs par défaut (liked: false, favorited: false)
   * plutôt que d'être redirigé vers l'accueil.
   * 
   * OBJECTIF: Révéler les contre-exemples qui démontrent que le bug existe
   * RÉSULTAT ATTENDU: Le test ÉCHOUE (c'est correct - cela prouve que le bug existe)
   */
  it('should display article with default values when status endpoint returns 404 (Bug Condition)', async () => {
    // Arrange: Utiliser property-based testing pour générer des slugs d'articles valides
    await fc.assert(fc.asyncProperty(
      fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
      async (slug) => {
        // Setup: Simuler un utilisateur connecté avec un article existant mais status 404
        mockUseParams.mockReturnValue({ slug })
        
        const mockPost = {
          id: 1,
          title: `Article ${slug}`,
          content: '<p>Contenu de test</p>',
          slug,
          likes_count: 5,
          views_count: 100,
          created_at: '2024-01-01T00:00:00.000000Z',
          published_at: '2024-01-01T00:00:00.000000Z',
          user: { id: 1, name: 'Auteur Test', avatar: 'avatar.jpg' },
          tags: [],
        }

        const mockComments = [
          { id: 1, content: 'Commentaire test', user: { name: 'Commentateur' }, replies: [] }
        ]

        // Mock des appels API: article et commentaires réussissent, status échoue avec 404
        mockApi.get.mockImplementation((url: string) => {
          if (url === `/posts/${slug}`) {
            return Promise.resolve({ data: mockPost })
          } else if (url === `/posts/${slug}/comments`) {
            return Promise.resolve({ data: mockComments })
          } else if (url === `/posts/${slug}/status`) {
            // Condition de bug: l'endpoint status retourne 404
            const error = new Error('Request failed with status code 404')
            ;(error as any).response = { status: 404 }
            return Promise.reject(error)
          }
          return Promise.reject(new Error('Unknown endpoint'))
        })

        // Act: Rendre le composant
        render(
          <BrowserRouter>
            <PostDetailPage />
          </BrowserRouter>
        )

        // Assert: Comportement attendu après correction
        // L'article devrait s'afficher avec des valeurs par défaut pour liked/favorited
        // plutôt que de rediriger vers l'accueil
        
        await waitFor(
          () => {
            // Vérifier que l'article est affiché
            expect(screen.getByRole('article')).toBeInTheDocument()
            expect(screen.getByText(mockPost.title)).toBeInTheDocument()
            
            // Vérifier que les commentaires sont affichés
            expect(screen.getByText('Commentaires')).toBeInTheDocument()
            
            // Vérifier que les boutons like/favorite sont présents avec valeurs par défaut
            expect(screen.getByText(/🤍/)).toBeInTheDocument() // Like non activé (valeur par défaut)
            expect(screen.getByText(/📑/)).toBeInTheDocument() // Favorite non activé (valeur par défaut)
            
            // Vérifier qu'il N'Y A PAS de redirection vers l'accueil
            expect(mockNavigate).not.toHaveBeenCalledWith('/')
          },
          { timeout: 5000 }
        )
      }
    ), { 
      numRuns: 5, // Tests avec 5 slugs différents pour assurer la reproductibilité
      verbose: true 
    })
  })

  /**
   * Test complémentaire: Vérifier que la condition de bug est bien reproductible
   * avec des cas d'entrée spécifiques documentés
   */
  it('should reproduce bug condition with specific documented examples', async () => {
    const testCases = [
      'mon-premier-article',
      'guide-react', 
      'article-test'
    ]

    for (const slug of testCases) {
      mockUseParams.mockReturnValue({ slug })
      
      const mockPost = {
        id: 1,
        title: `Article ${slug}`,
        content: '<p>Contenu de test</p>',
        slug,
        likes_count: 3,
        views_count: 50,
        created_at: '2024-01-01T00:00:00.000000Z',
        published_at: '2024-01-01T00:00:00.000000Z',
        user: { id: 1, name: 'Auteur', avatar: 'avatar.jpg' },
        tags: [],
      }

      // Mock: article et commentaires OK, status 404
      mockApi.get.mockImplementation((url: string) => {
        if (url === `/posts/${slug}`) return Promise.resolve({ data: mockPost })
        if (url === `/posts/${slug}/comments`) return Promise.resolve({ data: [] })
        if (url === `/posts/${slug}/status`) {
          const error = new Error('Request failed with status code 404')
          ;(error as any).response = { status: 404 }
          return Promise.reject(error)
        }
        return Promise.reject(new Error('Unknown endpoint'))
      })

      render(
        <BrowserRouter>
          <PostDetailPage />
        </BrowserRouter>
      )

      // Comportement attendu: article affiché, pas de redirection
      await waitFor(() => {
        expect(screen.getByRole('article')).toBeInTheDocument()
        expect(screen.getByText(mockPost.title)).toBeInTheDocument()
        expect(mockNavigate).not.toHaveBeenCalledWith('/')
      }, { timeout: 3000 })

      // Nettoyer pour le prochain cas
      vi.clearAllMocks()
    }
  })
})