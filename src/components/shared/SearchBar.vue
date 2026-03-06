<script setup>
import { computed } from 'vue'
import { Search } from 'lucide-vue-next'
import { useMovies } from '@/composables/useMovies'

const { searchQuery } = useMovies()

const model = computed({
  get: () => searchQuery.value,
  set: (val) => { searchQuery.value = val }
})

</script>

<template>
  <div class="search-container glass-panel">
    <Search class="search-icon" :size="20" />
    <input 
      type="text" 
      v-model="model" 
      placeholder="Buscar películas, directores, géneros..." 
      class="search-input"
    />
  </div>
</template>

<style scoped>
.search-container {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  width: 100%;
  max-width: 500px;
  transition: var(--transition-smooth);
}

.search-container:focus-within {
  box-shadow: var(--shadow-glow);
  border-color: var(--color-primary);
}

.search-icon {
  color: var(--color-text-muted);
  margin-right: 0.75rem;
  transition: var(--transition-smooth);
}

.search-container:focus-within .search-icon {
  color: var(--color-primary);
}

.search-input {
  flex: 1;
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 400;
  width: 100%;
}

.search-input::placeholder {
  color: var(--color-text-muted);
}
</style>
