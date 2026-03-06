import { ref, watch } from 'vue'

const RATINGS_STORAGE_KEY = 'cinevault-ratings'

export function useRatings() {
    // Initialize from LocalStorage
    const getInitialRatings = () => {
        try {
            const stored = localStorage.getItem(RATINGS_STORAGE_KEY)
            return stored ? JSON.parse(stored) : {}
        } catch (e) {
            console.error('Failed to parse ratings from local storage', e)
            return {}
        }
    }

    // ratings.value will be an object: { movieId: ratingValue }
    const ratings = ref(getInitialRatings())

    // Watch for changes and save to LocalStorage
    watch(ratings, (newVal) => {
        localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(newVal))
    }, { deep: true })

    const getRating = (movieId) => {
        return ratings.value[movieId] || 0
    }

    const setRating = (movieId, ratingValue) => {
        ratings.value[movieId] = ratingValue
    }

    return {
        ratings,
        getRating,
        setRating
    }
}
