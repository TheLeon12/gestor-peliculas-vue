<script setup>
import { onMounted, watch, ref } from 'vue'
import SearchBar from '@/components/shared/SearchBar.vue'
import MovieCard from '@/components/movies/MovieCard.vue'
import MovieModal from '@/components/movies/MovieModal.vue'
import { useMovies } from '@/composables/useMovies'

const { movies, filteredMovies, searchQuery, isLoading, error, fetchPopularMovies, searchMovies, moviesByGenre } = useMovies()

const isModalOpen = ref(false)
const selectedMovie = ref({})

const openMovieModal = (movie) => {
  selectedMovie.value = movie
  isModalOpen.value = true
}

const closeMovieModal = () => {
  isModalOpen.value = false
  // Small delay to clear movie data after animation
  setTimeout(() => {
     if (!isModalOpen.value) selectedMovie.value = {}
  }, 300)
}

onMounted(() => {
  fetchPopularMovies()
})

// Debounce para la búsqueda
let timeout
watch(searchQuery, (newQuery) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    if (newQuery.trim()) {
      searchMovies(newQuery)
    } else {
      fetchPopularMovies()
    }
  }, 500)
})

</script>

<template>
  <div class="home-view">
    <div class="view-header">
      <h1 class="text-gradient">Descubrir Películas</h1>
      <p class="subtitle">Encuentra tu próxima aventura cinematográfica con TMDB API.</p>
      
      <div class="search-wrapper">
        <SearchBar />
      </div>
    </div>
    
    <div v-if="error" class="error-container glass-panel">
      <p class="text-accent">{{ error }}</p>
      <div v-if="error.includes('VITE_TMDB_API_KEY') || error.includes('API Key')">
        <p>Por favor, crea un archivo <code>.env</code> en la raíz de tu proyecto e incluye tu API Key de la siguiente manera:</p>
        <pre class="code-block"><code>VITE_TMDB_API_KEY=tu_api_key_aqui</code></pre>
        <p>Luego reinicia el servidor de desarrollo.</p>
      </div>
    </div>
    
    <div v-else-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando películas...</p>
    </div>
    
    <!-- Mostrar resultados plana si hay una búsqueda activa -->
    <div v-else-if="searchQuery.trim() !== ''">
      <h2 class="section-title">Resultados para "{{ searchQuery }}"</h2>
      <div v-if="filteredMovies.length > 0" class="movie-grid">
        <MovieCard 
          v-for="movie in filteredMovies" 
          :key="movie.id" 
          :movie="movie" 
          @movie-click="openMovieModal"
        />
      </div>
      <div v-else class="empty-state">
        <div class="glass-panel empty-card">
          <h3>No se encontraron películas</h3>
          <p>No pudimos encontrar ninguna coincidencia para la búsqueda. Intenta con otra palabra.</p>
        </div>
      </div>
    </div>
    
    <!-- Mostrar agrupadas por género en modo normal -->
    <div v-else class="genre-groups">
      <div v-for="group in moviesByGenre" :key="group.genre" class="genre-row">
        <h2 class="genre-title text-gradient">{{ group.genre }}</h2>
        <div class="carousel-container">
          <div class="carousel-track">
            <div 
              v-for="movie in group.movies" 
              :key="movie.id" 
              class="carousel-item"
            >
              <MovieCard :movie="movie" @movie-click="openMovieModal" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Película -->
    <MovieModal 
      :isOpen="isModalOpen" 
      :movie="selectedMovie" 
      @close="closeMovieModal" 
    />
  </div>
</template>

<style scoped>
.home-view {
  animation: fadeIn 0.5s ease-out;
}

.view-header {
  margin-bottom: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  font-weight: 300;
  margin-bottom: 2rem;
}

.search-wrapper {
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;
}

.error-container {
  padding: 2rem;
  text-align: center;
  border-left: 4px solid var(--color-accent);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.code-block {
  background: rgba(0,0,0,0.5);
  padding: 1rem;
  border-radius: 8px;
  display: inline-block;
  margin: 1rem 0;
  font-family: monospace;
  color: var(--color-star);
}

.text-accent {
  color: var(--color-accent);
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: var(--color-text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.section-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

/* Estilos de Carrusel por Género */
.genre-groups {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

.genre-row {
  display: flex;
  flex-direction: column;
}

.genre-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  display: inline-block;
  align-self: flex-start;
  padding-left: 0.5rem;
}

.carousel-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  padding-bottom: 2rem;
  padding-top: 0.5rem;
  /* Scrollbar hiding via standard */
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary) var(--color-bg-primary);
  scroll-behavior: smooth;
}

.carousel-container::-webkit-scrollbar {
  height: 8px;
}
.carousel-container::-webkit-scrollbar-track {
  background: var(--color-bg-primary); 
  border-radius: 4px;
}
.carousel-container::-webkit-scrollbar-thumb {
  background: var(--color-primary); 
  border-radius: 4px;
}

.carousel-track {
  display: flex;
  gap: 1.5rem;
  width: max-content;
  padding: 0 0.5rem;
}

.carousel-item {
  width: 280px; /* Tamaño del MovieCard en el carrusel */
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  justify-content: center;
  margin-top: 4rem;
}

.empty-card {
  padding: 3rem;
  text-align: center;
  max-width: 500px;
}

.empty-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.empty-card p {
  color: var(--color-text-secondary);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  h1 {
    font-size: 2.5rem;
  }
}
</style>
