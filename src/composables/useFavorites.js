import { ref, watch } from 'vue'

const FAVORITES_STORAGE_KEY = 'cinevault-favorites'

export function useFavorites() {
    // Initialize from LocalStorage
    const getInitialFavorites = () => {
        try {
            const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
            return stored ? JSON.parse(stored) : []
        } catch (e) {
            console.error('Failed to parse favorites from local storage', e)
            return []
        }
    }

    const favoriteMovieIds = ref(getInitialFavorites())

    // Watch for changes and save to LocalStorage
    watch(favoriteMovieIds, (newVal) => {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newVal))
    }, { deep: true })

    const isFavorite = (movieId) => {
        return favoriteMovieIds.value.includes(movieId)
    }

    const toggleFavorite = (movieId) => {
        if (isFavorite(movieId)) {
            favoriteMovieIds.value = favoriteMovieIds.value.filter(id => id !== movieId)
        } else {
            favoriteMovieIds.value.push(movieId)
        }
    }

    return {
        favoriteMovieIds,
        isFavorite,
        toggleFavorite
    }
}
