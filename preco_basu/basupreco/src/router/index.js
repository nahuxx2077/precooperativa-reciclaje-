import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import RecordsView from '@/views/RecordsView.vue'
import { appState, can, initialize } from '@/stores/app'
import { usaSupabase } from '@/lib/supabase'

const rutas = [
  { path: '/', name: 'resumen', component: DashboardView, meta: { permiso: 'dashboard' } },
  { path: '/reciclaje', name: 'reciclaje', component: RecordsView, props: { kind: 'reciclajes' }, meta: { permiso: 'reciclaje' } },
  { path: '/socios', name: 'socios', component: RecordsView, props: { kind: 'socios' }, meta: { permiso: 'socios' } },
  { path: '/reportes', name: 'reportes', component: RecordsView, props: { kind: 'reportes_basurales' }, meta: { permiso: 'reportes' } },
  { path: '/movimientos', name: 'movimientos', component: RecordsView, props: { kind: 'movimientos' }, meta: { permiso: 'movimientos' } },
  { path: '/ingresar', name: 'ingresar', component: LoginView, meta: { publico: true } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: rutas,
})

router.beforeEach(async (to) => {
  await initialize()
  if (usaSupabase && !to.meta.publico && !appState.sesion) return { name: 'ingresar' }
  if (usaSupabase && to.name === 'ingresar' && appState.sesion) return { name: 'resumen' }
  if (usaSupabase && appState.sesion && !appState.rol && to.name !== 'resumen') return { name: 'resumen' }
  if (usaSupabase && appState.sesion && !appState.rol && to.name === 'resumen') return true
  if (to.meta.permiso && !can(to.meta.permiso)) return { name: 'resumen' }
  return true
})

export default router
