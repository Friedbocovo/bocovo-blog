import { create } from 'zustand'

interface InteractionState {
  likedPosts: Set<number>
  favoritedPosts: Set<number>
  setLiked: (postId: number, liked: boolean) => void
  setFavorited: (postId: number, favorited: boolean) => void
  toggleLike: (postId: number) => boolean
  toggleFavorite: (postId: number) => boolean
  isLiked: (postId: number) => boolean
  isFavorited: (postId: number) => boolean
  reset: () => void
}

const useInteractionStore = create<InteractionState>((set, get) => ({
  likedPosts: new Set(),
  favoritedPosts: new Set(),
  
  setLiked: (postId, liked) =>
    set((state) => {
      const newLikedPosts = new Set(state.likedPosts)
      if (liked) {
        newLikedPosts.add(postId)
      } else {
        newLikedPosts.delete(postId)
      }
      return { likedPosts: newLikedPosts }
    }),
    
  setFavorited: (postId, favorited) =>
    set((state) => {
      const newFavoritedPosts = new Set(state.favoritedPosts)
      if (favorited) {
        newFavoritedPosts.add(postId)
      } else {
        newFavoritedPosts.delete(postId)
      }
      return { favoritedPosts: newFavoritedPosts }
    }),
    
  toggleLike: (postId) => {
    const { likedPosts, setLiked } = get()
    const wasLiked = likedPosts.has(postId)
    setLiked(postId, !wasLiked)
    return !wasLiked
  },
  
  toggleFavorite: (postId) => {
    const { favoritedPosts, setFavorited } = get()
    const wasFavorited = favoritedPosts.has(postId)
    setFavorited(postId, !wasFavorited)
    return !wasFavorited
  },
  
  isLiked: (postId) => get().likedPosts.has(postId),
  isFavorited: (postId) => get().favoritedPosts.has(postId),
  
  reset: () => set({ likedPosts: new Set(), favoritedPosts: new Set() })
}))

export default useInteractionStore