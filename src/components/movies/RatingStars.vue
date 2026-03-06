<script setup>
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'
import { useRatings } from '@/composables/useRatings'

const props = defineProps({
  movieId: {
    type: Number,
    required: true
  },
  maxStars: {
    type: Number,
    default: 5
  }
})

const { getRating, setRating } = useRatings()

const currentRating = computed(() => getRating(props.movieId))

const rate = (value) => {
  setRating(props.movieId, value)
}
</script>

<template>
  <div class="rating-stars">
    <button 
      v-for="star in maxStars" 
      :key="star"
      class="star-btn"
      @click.stop="rate(star)"
      :title="`Calificar con ${star} estrellas`"
    >
      <Star 
        :size="20" 
        class="star-icon"
        :class="{ 'filled': star <= currentRating }" 
      />
    </button>
  </div>
</template>

<style scoped>
.rating-stars {
  display: flex;
  gap: 0.25rem;
}

.star-btn {
  padding: 0.25rem;
  border-radius: 50%;
  transition: var(--transition-bounce);
}

.star-btn:hover {
  transform: scale(1.2);
}

.star-icon {
  color: var(--color-star-dim);
  transition: var(--transition-smooth);
}

.star-btn:hover .star-icon,
.star-icon.filled {
  color: var(--color-star);
  fill: var(--color-star);
}
</style>
