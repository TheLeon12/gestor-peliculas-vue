import { ref, computed } from 'vue'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

export function useMovies() {
    const movies = ref([])
    const genres = ref([])
    const searchQuery = ref('')
    const isLoading = ref(false)
    const error = ref(null)

    // Helper para mapear películas de TMDB a nuestro formato
    const mapMovie = (movie) => {
        const movieGenres = movie.genre_ids
            ? movie.genre_ids.map(id => {
                const genre = genres.value.find(g => g.id === id)
                return genre ? genre.name : ''
            }).filter(Boolean).join(', ')
            : ''

        return {
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'N/D',
            genre: movieGenres || 'Película',
            director: 'Varios', // TMDB no devuelve director en la lista básica
            description: movie.overview || 'Sin descripción disponible.',
            coverUrl: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://via.placeholder.com/500x750?text=Sin+Imagen',
            genreIds: movie.genre_ids || []
        }
    }

    const fetchGenres = async () => {
        if (!API_KEY) {
            error.value = 'API Key de TMDB no configurada.'
            return
        }
        try {
            const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=es-ES`)
            const data = await res.json()
            if (data.genres) {
                genres.value = data.genres
            }
        } catch (e) {
            console.error('Error fetching genres:', e)
        }
    }

    const fetchPopularMovies = async () => {
        if (!API_KEY) {
            error.value = 'Falta VITE_TMDB_API_KEY en el archivo .env'
            return
        }
        isLoading.value = true
        error.value = null
        try {
            if (genres.value.length === 0) {
                await fetchGenres()
            }
            const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`)
            const data = await res.json()
            if (data.results) {
                movies.value = data.results.map(mapMovie)
            } else if (data.status_message) {
                error.value = data.status_message
            }
        } catch (e) {
            console.error('Error fetching popular movies:', e)
            error.value = 'Error de conexión al obtener películas.'
        } finally {
            isLoading.value = false
        }
    }

    const searchMovies = async (query) => {
        if (!API_KEY) return
        if (!query.trim()) {
            await fetchPopularMovies()
            return
        }
        isLoading.value = true
        error.value = null
        try {
            if (genres.value.length === 0) {
                await fetchGenres()
            }
            const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&page=1`)
            const data = await res.json()
            if (data.results) {
                movies.value = data.results.map(mapMovie)
            }
        } catch (e) {
            console.error('Error searching movies:', e)
            error.value = 'Error al buscar películas.'
        } finally {
            isLoading.value = false
        }
    }

    // Agrupar películas por género
    const moviesByGenre = computed(() => {
        const grouped = {}
        movies.value.forEach(movie => {
            if (movie.genreIds && movie.genreIds.length > 0) {
                movie.genreIds.forEach(genreId => {
                    const genre = genres.value.find(g => g.id === genreId)
                    if (genre) {
                        if (!grouped[genre.name]) {
                            grouped[genre.name] = []
                        }
                        // Avoid duplicates in the same genre
                        if (!grouped[genre.name].find(m => m.id === movie.id)) {
                            grouped[genre.name].push(movie)
                        }
                    }
                })
            } else {
                if (!grouped['Otros']) grouped['Otros'] = []
                if (!grouped['Otros'].find(m => m.id === movie.id)) {
                    grouped['Otros'].push(movie)
                }
            }
        })

        return Object.keys(grouped)
            .map(genreName => ({
                genre: genreName,
                movies: grouped[genreName]
            }))
            .filter(group => group.movies.length > 0)
            .sort((a, b) => b.movies.length - a.movies.length) // Ordenar por cantidad descendente
    })

    const getMovieById = (id) => {
        return movies.value.find(movie => movie.id === id)
    }

    const fetchMovieTrailer = async (id) => {
        if (!API_KEY) return null
        try {
            const res = await fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=es-ES`)
            const data = await res.json()
            if (data.results && data.results.length > 0) {
                // Find a YouTube trailer, preferring official ones
                const trailer = data.results.find(video => video.site === 'YouTube' && video.type === 'Trailer' && video.official)
                    || data.results.find(video => video.site === 'YouTube' && video.type === 'Trailer')
                    || data.results.find(video => video.site === 'YouTube')

                return trailer ? trailer.key : null
            }
            return null
        } catch (e) {
            console.error('Error fetching movie trailer:', e)
            return null
        }
    }

    return {
        movies,
        genres,
        searchQuery,
        isLoading,
        error,
        filteredMovies: computed(() => movies.value),
        moviesByGenre,
        fetchPopularMovies,
        searchMovies,
        getMovieById,
        fetchMovieTrailer
    }
}
