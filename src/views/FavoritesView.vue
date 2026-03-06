<script setup>
import { computed, ref } from 'vue'
import MovieCard from '@/components/movies/MovieCard.vue'
import MovieModal from '@/components/movies/MovieModal.vue'
import { useMovies } from '@/composables/useMovies'
import { useFavorites } from '@/composables/useFavorites'
import { HeartCrack } from 'lucide-vue-next'

const { movies } = useMovies()
const { favoriteMovieIds } = useFavorites()

const isModalOpen = ref(false)
const selectedMovie = ref({})

const openMovieModal = (movie) => {
  selectedMovie.value = movie
  isModalOpen.value = true
}

const closeMovieModal = () => {
  isModalOpen.value = false
  setTimeout(() => {
     if (!isModalOpen.value) selectedMovie.value = {}
  }, 300)
}

const favoriteMovies = computed(() => {
  return movies.value.filter(movie => favoriteMovieIds.value.includes(movie.id))
})
</script>

<template>
  <div class="favorites-view">
    <div class="view-header">
      <h1 class="text-gradient">Tu Bóveda</h1>
      <p class="subtitle">Películas que has marcado como favoritas.</p>
    </div>
    
    <div v-if="favoriteMovies.length > 0" class="movie-grid">
      <MovieCard 
        v-for="movie in favoriteMovies" 
        :key="movie.id" 
        :movie="movie" 
        @movie-click="openMovieModal"
      />
    </div>
    
    <div v-else class="empty-state">
      <div class="glass-panel empty-card">
        <HeartCrack :size="48" class="empty-icon" />
        <h3>Sin favoritas aún</h3>
        <p>Ve a la página de Inicio y haz clic en el corazón de las películas que te encantan para agregarlas a tu bóveda.</p>
        
        <router-link to="/" class="btn-primary mt-4">
          Descubrir Películas
        </router-link>
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
.favorites-view {
  animation: fadeIn 0.5s ease-out;
}

.view-header {
  margin-bottom: 3rem;
  text-align: center;
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
}

.movie-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
}

.empty-card p {
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.mt-4 {
  margin-top: 2rem;
}

.btn-primary {
  display: inline-block;
  background: var(--color-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  font-weight: 600;
  transition: var(--transition-bounce);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
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
