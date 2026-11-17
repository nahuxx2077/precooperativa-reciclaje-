<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { appState, can } from '@/stores/app'

const mesActual = new Date().toISOString().slice(0, 7)
const reciclajesDelMes = computed(() => appState.datos.reciclajes.filter((item) => item.fecha?.startsWith(mesActual) && item.estado === 'vigente'))
const kilosDelMes = computed(() => reciclajesDelMes.value.reduce((total, item) => total + Number(item.kilos), 0))
const sociosActivos = computed(() => appState.datos.socios.filter((item) => item.estado === 'activo').length)
const reportesAbiertos = computed(() => appState.datos.reportes_basurales.filter((item) => ['pendiente', 'en_revision'].includes(item.estado)).length)
const saldo = computed(() => appState.datos.movimientos
  .filter((item) => item.estado === 'vigente')
  .reduce((total, item) => total + (item.tipo === 'ingreso' ? Number(item.monto) : -Number(item.monto)), 0))
const reportesRecientes = computed(() => [...appState.datos.reportes_basurales].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 3))

const nombreEstado = (estado) => ({
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
}[estado] || estado)
</script>

<template>
  <div v-if="appState.usuario && !appState.rol" class="notice notice-error" role="alert">
    Esta cuenta no tiene un rol habilitado. Un integrante del Consejo debe asignarlo antes de acceder a los datos.
  </div>
  <section class="page-heading">
    <div>
      <p class="eyebrow">Panel de seguimiento</p>
      <h1>Hola, comunidad <span aria-hidden="true">🌱</span></h1>
      <p>Un resumen del trabajo de reciclado y cuidado del entorno.</p>
    </div>
    <RouterLink v-if="can('reciclaje')" class="button" to="/reciclaje">＋ Registrar reciclaje</RouterLink>
    <RouterLink v-else class="button" to="/reportes">Informar un basural</RouterLink>
  </section>

  <section class="metrics-grid" aria-label="Indicadores">
    <article class="metric-card metric-green">
      <span class="metric-icon" aria-hidden="true">♻</span>
      <p>Kilos reciclados este mes</p>
      <strong>{{ kilosDelMes.toLocaleString('es-AR', { maximumFractionDigits: 1 }) }} kg</strong>
      <small>{{ reciclajesDelMes.length }} registros vigentes</small>
    </article>
    <article v-if="can('movimientos')" class="metric-card">
      <span class="metric-icon" aria-hidden="true">◎</span>
      <p>Socios activos</p>
      <strong>{{ sociosActivos }}</strong>
      <small>La regla indica un mínimo de 9</small>
    </article>
    <article class="metric-card metric-orange">
      <span class="metric-icon" aria-hidden="true">⌖</span>
      <p>Reportes por atender</p>
      <strong>{{ reportesAbiertos }}</strong>
      <small>Pendientes o en revisión</small>
    </article>
    <article class="metric-card">
      <span class="metric-icon" aria-hidden="true">↗</span>
      <p>Saldo de movimientos vigentes</p>
      <strong>{{ saldo.toLocaleString('es-AR') }}</strong>
      <small>Moneda no especificada en el proyecto</small>
    </article>
  </section>

  <section class="content-grid">
    <article class="panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Actividad comunitaria</p>
          <h2>Reportes del terreno</h2>
        </div>
        <RouterLink class="text-link" to="/reportes">Ver todos</RouterLink>
      </div>
      <ul v-if="reportesRecientes.length" class="report-list">
        <li v-for="reporte in reportesRecientes" :key="reporte.id">
          <span class="report-marker" aria-hidden="true">⌖</span>
          <div class="report-description">
            <strong>{{ reporte.ubicacion }}</strong>
            <small>{{ reporte.fecha }} · {{ reporte.descripcion }}</small>
          </div>
          <span class="status-pill" :class="`status-${reporte.estado}`">{{ nombreEstado(reporte.estado) }}</span>
        </li>
      </ul>
      <p v-else class="empty-state">Todavía no hay reportes registrados.</p>
    </article>

    <aside class="panel next-steps">
      <p class="eyebrow">Recorrido sugerido</p>
      <h2>Sumate a la tarea</h2>
      <p>Registrá el material recuperado, informá un punto con basura o revisá las actividades.</p>
      <RouterLink class="button button-outline" to="/reportes">Informar un basural</RouterLink>
      <RouterLink v-if="can('reciclaje')" class="text-link" to="/reciclaje">Consultar datos de reciclaje →</RouterLink>
    </aside>
  </section>

  <p class="scope-note">
    Esta primera versión muestra datos de seguimiento. Las actas, votaciones, comprobantes adjuntos y mapa interactivo se dejan para una etapa posterior.
  </p>
</template>
