<script setup>
import { X, Play, Info, Heart } from 'lucide-vue-next'
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useMovies } from '@/composables/useMovies'
import { useFavorites } from '@/composables/useFavorites'
import RatingStars from './RatingStars.vue'

const props = defineProps({
  movie: {
    type: Object,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const { fetchMovieTrailer } = useMovies()
const { isFavorite, toggleFavorite } = useFavorites()

const trailerKey = ref(null)
const isLoadingTrailer = ref(false)
const activeTab = ref('info') // 'info' o 'trailer'

const favoriteState = computed(() => isFavorite(props.movie.id))

watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden' // Prevenir scroll al abrir modal
    
    // Resetear estado al abrir
    activeTab.value = 'info'
    trailerKey.value = null
    isLoadingTrailer.value = true
    
    // Obtener trailer
    if (props.movie?.id) {
       trailerKey.value = await fetchMovieTrailer(props.movie.id)
    }
    isLoadingTrailer.value = false
  } else {
    document.body.style.overflow = '' // Restaurar scroll al cerrar modal
    trailerKey.value = null // Limpiar iframe para detener reproducción
  }
})

onUnmounted(() => {
  document.body.style.overflow = '' // Asegurar restauración por si se desmonta
})

const closeModal = () => {
    emit('close')
}

// Cerrar al presionar Escape
onMounted(() => {
    const handleEscape = (e) => {
        if (e.key === 'Escape' && props.isOpen) {
            closeModal()
        }
    }
    document.addEventListener('keydown', handleEscape)
    
    onUnmounted(() => {
        document.removeEventListener('keydown', handleEscape)
    })
})

</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-backdrop" @click="closeModal">
        <div class="modal-container glass-panel" @click.stop>
          
          <!-- Botón Cerrar -->
          <button class="close-btn" @click="closeModal" aria-label="Cerrar modal">
            <X :size="24" />
          </button>

          <div class="modal-content">
            
            <!-- Columna Izquierda: Imagen y tabs en móvil -->
            <div class="modal-sidebar">
               <div class="image-wrapper">
                 <img :src="movie.coverUrl" :alt="movie.title" class="modal-image" loading="lazy" />
                 
                 <!-- Botón Favorito Persistente sobre la Imagen -->
                 <button 
                   class="favorite-floating-btn" 
                   :class="{ 'is-favorite': favoriteState }"
                   @click.stop="toggleFavorite(movie.id)"
                   :title="favoriteState ? 'Eliminar de favoritos' : 'Agregar a favoritos'"
                 >
                   <Heart :size="24" :class="{ 'filled': favoriteState }" />
                 </button>
               </div>
               
               <!-- Botones Tabs (se ven en móvil o para cambiar entre info/trailer) -->
               <div class="tabs-container">
                 <button 
                   class="tab-btn" 
                   :class="{ active: activeTab === 'info' }"
                   @click="activeTab = 'info'"
                 >
                   <Info :size="18" /> Información
                 </button>
                 <button 
                   class="tab-btn" 
                   :class="{ active: activeTab === 'trailer', disabled: !trailerKey && !isLoadingTrailer }"
                   @click="trailerKey ? activeTab = 'trailer' : null"
                   :disabled="!trailerKey && !isLoadingTrailer"
                 >
                   <Play :size="18" /> Tráiler
                 </button>
               </div>
            </div>

            <!-- Columna Derecha: Contenido Dinámico -->
            <div class="modal-main">
              
              <!-- Tab Info -->
              <Transition name="fade" mode="out-in">
                  <div v-if="activeTab === 'info'" class="info-section" key="info">
                    <div class="modal-header">
                        <h2 class="title text-gradient">{{ movie.title }}</h2>
                      <div class="meta-row">
                        <span class="year">{{ movie.year }}</span>
                        <span class="dot">•</span>
                        <span class="genre">{{ movie.genre }}</span>
                      </div>
                    </div>
                    
                    <div class="rating-container">
                        <RatingStars :movieId="movie.id" />
                    </div>

                    <div class="details">
                        <div class="detail-item">
                            <span class="label">Director:</span>
                            <span>{{ movie.director }}</span>
                        </div>
                    </div>

                    <div class="description-container">
                        <h3 class="section-title">Sinopsis</h3>
                        <p class="description">{{ movie.description }}</p>
                    </div>
                  </div>

                  <!-- Tab Trailer -->
                  <div v-else-if="activeTab === 'trailer'" class="trailer-section" key="trailer">
                      <h3 class="section-title text-gradient mb-4">Tráiler Oficial</h3>
                      <div class="video-wrapper glass-panel">
                          <div v-if="isLoadingTrailer" class="loading-trailer">
                             <div class="spinner"></div>
                             <p>Cargando tráiler...</p>
                          </div>
                          <iframe 
                            v-else-if="trailerKey"
                            :src="`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`" 
                            title="YouTube video player" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen
                            class="youtube-iframe"
                          ></iframe>
                          <div v-else class="no-trailer">
                              <p>Tráiler no disponible para esta película.</p>
                          </div>
                      </div>
                  </div>
              </Transition>

            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: var(--color-text-primary);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-bounce);
  backdrop-filter: blur(4px);
}

.close-btn:hover {
  background: var(--color-accent);
  transform: rotate(90deg);
}

.modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  /* Scrollbar hiding */
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary) transparent;
}

.modal-content::-webkit-scrollbar {
  width: 6px;
}
.modal-content::-webkit-scrollbar-thumb {
  background: var(--color-primary); 
  border-radius: 10px;
}

.modal-sidebar {
  width: 100%;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-wrapper {
  position: relative;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  aspect-ratio: 2/3;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}

.modal-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tabs-container {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: center;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-weight: 600;
  transition: var(--transition-smooth);
}

.tab-btn:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
}

.tab-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.tab-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-main {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.info-section, .trailer-section {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modal-header {
  margin-bottom: 1.5rem;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 0.5rem;
  padding-right: 1rem;
}

.favorite-floating-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem;
  border-radius: 50%;
  color: var(--color-text-primary);
  transition: var(--transition-bounce);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 5;
}

.favorite-floating-btn:hover {
  transform: scale(1.1);
  background: rgba(0, 0, 0, 0.8);
  border-color: var(--color-primary);
}

.favorite-floating-btn.is-favorite, .favorite-floating-btn .filled {
  color: var(--color-accent);
  fill: var(--color-accent);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.year {
  color: var(--color-primary);
  background: rgba(99, 102, 241, 0.15);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
}

.dot {
  opacity: 0.5;
}

.rating-container {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.details {
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.label {
  color: var(--color-text-muted);
  font-weight: 600;
  min-width: 80px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.mb-4 {
  margin-bottom: 1rem;
}

.description {
  line-height: 1.7;
  color: var(--color-text-secondary);
  font-size: 1rem;
}

.video-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.youtube-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.loading-trailer, .no-trailer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-left-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container {
  animation: slideUp 0.3s ease-out forwards;
}

.modal-fade-leave-active .modal-container {
  animation: slideDown 0.3s ease-in forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes slideDown {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(30px) scale(0.95); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Disposición para Escritorio */
@media (min-width: 768px) {
  .modal-content {
    flex-direction: row;
    overflow: hidden; /* Prevent global modal scroll on desktop, scroll internally if needed */
  }

  .modal-sidebar {
    width: 35%;
    min-width: 250px;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    justify-content: flex-start;
  }

  .image-wrapper {
    max-width: 100%;
  }

  .tabs-container {
    flex-direction: column;
  }

  .tab-btn {
    padding: 1rem;
    justify-content: flex-start;
  }

  .modal-main {
    width: 65%;
    overflow-y: auto;
    /* Scrollbar */
    scrollbar-width: thin;
    scrollbar-color: var(--color-primary) transparent;
  }
}
</style>
