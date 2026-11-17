<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { appState, can, changeDemoRole, initialize, signOut } from '@/stores/app'

const route = useRoute()
const menuOpen = ref(false)
const isDemo = computed(() => !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)

const navigation = [
  { label: 'Resumen', to: '/', permission: 'dashboard' },
  { label: 'Reciclaje', to: '/reciclaje', permission: 'reciclaje' },
  { label: 'Socios', to: '/socios', permission: 'socios' },
  { label: 'Reportes del terreno', to: '/reportes', permission: 'reportes' },
  { label: 'Ingresos y egresos', to: '/movimientos', permission: 'movimientos' },
]

const visibleNavigation = computed(() => navigation.filter((item) => can(item.permission)))
const roleLabels = {
  consejo: 'Consejo de Administración',
  sindicatura: 'Sindicatura',
  socio: 'Socio/a',
  docente_guia: 'Docente guía',
  vecino: 'Vecino/a',
}

onMounted(initialize)

async function leave() {
  try {
    await signOut()
  } catch (error) {
    appState.error = `No se pudo cerrar la sesión: ${error.message || 'error inesperado.'}`
  }
}
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <RouterLink class="brand" to="/" aria-label="Ir al resumen">
        <span class="brand-mark" aria-hidden="true">↻</span>
        <span>
          <strong>PreCoop</strong>
          <small>Reciclado escolar</small>
        </span>
      </RouterLink>
      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-label="Mostrar navegación"
        @click="menuOpen = !menuOpen"
      >
        ☰
      </button>
      <nav class="main-nav" :class="{ 'is-open': menuOpen }" aria-label="Navegación principal">
        <RouterLink
          v-for="item in visibleNavigation"
          :key="item.to"
          :to="item.to"
          :class="{ 'is-active': route.path === item.to }"
          @click="menuOpen = false"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="user-area">
        <label v-if="isDemo" class="role-picker">
          <span>Vista de prueba</span>
          <select :value="appState.role" aria-label="Simular rol" @change="changeDemoRole($event.target.value)">
            <option value="consejo">Consejo de Administración</option>
            <option value="sindicatura">Sindicatura</option>
            <option value="socio">Socio/a</option>
            <option value="docente_guia">Docente guía</option>
            <option value="vecino">Vecino/a</option>
          </select>
        </label>
        <div v-else-if="appState.user" class="signed-user">
          <span>{{ roleLabels[appState.role] || 'Sin rol asignado' }}</span>
          <button class="text-button" type="button" @click="leave">Cerrar sesión</button>
        </div>
        <RouterLink v-else class="button button-small" to="/ingresar">Ingresar</RouterLink>
      </div>
    </header>

    <div v-if="isDemo" class="demo-banner" role="status">
      <strong>Datos de prueba</strong>
      <span>Se guardan en este navegador. Los roles del selector son simulados.</span>
    </div>
    <div v-if="!appState.listo" class="notice notice-info app-error" role="status">Cargando la aplicación…</div>
    <div v-if="appState.error" class="notice notice-error app-error" role="alert">{{ appState.error }}</div>
    <div v-else-if="appState.user && !appState.role" class="notice notice-error">
      Esta cuenta todavía no tiene un rol asignado. Pedí al Consejo que la habilite.
    </div>

    <main class="page-container">
      <RouterView />
    </main>
    <footer class="app-footer">
      <span>Proyecto educativo sin fines de lucro</span>
      <span>Los datos personales reales no se usan en esta demostración.</span>
    </footer>
  </div>
</template>
