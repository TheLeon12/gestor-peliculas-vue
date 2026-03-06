<script setup>
import { Film, Heart, Home } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const currentRouteName = computed(() => route.name)
</script>

<template>
  <nav class="navbar glass-panel">
    <div class="container nav-content">
      <router-link to="/" class="brand">
        <Film class="brand-icon" :size="28" />
        <span class="brand-text text-gradient">CineVault</span>
      </router-link>

      <div class="nav-links">
        <router-link 
          to="/" 
          class="nav-item" 
          :class="{ active: currentRouteName === 'home' }"
        >
          <Home :size="20" />
          <span>Inicio</span>
        </router-link>
        
        <router-link 
          to="/favorites" 
          class="nav-item" 
          :class="{ active: currentRouteName === 'favorites' }"
        >
          <Heart :size="20" />
          <span>Favoritos</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-radius: 0;
  border-top: none;
  border-left: none;
  border-right: none;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon {
  color: var(--color-primary);
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  color: var(--color-text-secondary);
  font-weight: 500;
  transition: var(--transition-smooth);
}

.nav-item:hover {
  color: var(--color-text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  color: var(--color-text-primary);
  background: var(--color-primary);
  box-shadow: var(--shadow-glow);
}

@media (max-width: 600px) {
  .nav-item span {
    display: none;
  }
}
</style>
