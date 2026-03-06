<script setup>
import { Heart } from 'lucide-vue-next'
import RatingStars from './RatingStars.vue'
import { useFavorites } from '@/composables/useFavorites'
import { computed } from 'vue'

const props = defineProps({
  movie: {
    type: Object,
    required: true
  }
})

const { isFavorite, toggleFavorite } = useFavorites()

const favoriteState = computed(() => isFavorite(props.movie.id))
</script>

<template>
  <div class="movie-card glass-panel group clickable" @click="$emit('movie-click', movie)">
    <div class="card-image-wrapper">
      <img :src="movie.coverUrl" :alt="movie.title" class="card-image" loading="lazy" />
      
      <div class="card-overlay">
        <button 
          class="favorite-btn" 
          :class="{ 'is-favorite': favoriteState }"
          @click.stop="toggleFavorite(movie.id)"
          :title="favoriteState ? 'Eliminar de favoritos' : 'Agregar a favoritos'"
        >
          <Heart :size="24" :class="{ 'filled': favoriteState }" />
        </button>
        
        <div class="overlay-content">
          <p class="description">{{ movie.description }}</p>
        </div>
      </div>
    </div>
    
    <div class="card-body">
      <div class="card-header">
        <h3 class="title">{{ movie.title }}</h3>
        <span class="year">{{ movie.year }}</span>
      </div>
      
      <div class="card-meta">
        <span class="genre">{{ movie.genre }}</span>
        <span class="director" title="Director"><span class="label">Dir:</span> {{ movie.director }}</span>
      </div>
      
      <div class="card-footer">
        <RatingStars :movieId="movie.id" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.movie-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: var(--transition-smooth);
}

.movie-card.clickable {
  cursor: pointer;
}

.movie-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-glow);
  border-color: rgba(99, 102, 241, 0.4);
}

.card-image-wrapper {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition-bounce);
}

.movie-card:hover .card-image {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10, 10, 14, 0.95) 0%, rgba(10, 10, 14, 0.4) 60%, transparent 100%);
  opacity: 0;
  transition: var(--transition-smooth);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
}

.movie-card:hover .card-overlay {
  opacity: 1;
}

.favorite-btn {
  align-self: flex-end;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  padding: 0.75rem;
  border-radius: 50%;
  color: var(--color-text-primary);
  transition: var(--transition-bounce);
}

.favorite-btn:hover {
  transform: scale(1.1);
  background: rgba(0, 0, 0, 0.8);
}

.favorite-btn.is-favorite, .favorite-btn .filled {
  color: var(--color-accent);
  fill: var(--color-accent);
}

.overlay-content {
  transform: translateY(20px);
  transition: var(--transition-smooth);
}

.movie-card:hover .overlay-content {
  transform: translateY(0);
}

.description {
  font-size: 0.9rem;
  line-height: 1.4;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.year {
  font-size: 0.85rem;
  color: var(--color-primary);
  background: rgba(99, 102, 241, 0.15);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.genre {
  color: var(--color-text-primary);
  font-weight: 500;
}

.director {
  color: var(--color-text-muted);
}

.label {
  font-weight: 600;
}

.card-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
</style>
