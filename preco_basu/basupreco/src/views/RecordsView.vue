<script setup>
import { computed, reactive, ref } from 'vue'
import { appState, can, conteoSociosActivos, guardarRegistro } from '@/stores/app'
import { validarRegistro } from '@/utils/validation'

const props = defineProps({
  kind: { type: String, required: true },
})

const residuo = [
  { value: 'papel', label: 'Papel' },
  { value: 'carton', label: 'Cartón' },
  { value: 'plastico', label: 'Plástico' },
  { value: 'latas', label: 'Latas' },
]
const frecuencia = [
  { value: 'siempre', label: 'Siempre' },
  { value: 'a_veces', label: 'A veces' },
  { value: 'nunca', label: 'Nunca' },
]
const terreno = [
  { value: 'limpio', label: 'Limpio' },
  { value: 'parcialmente_limpio', label: 'Parcialmente limpio' },
  { value: 'sucio', label: 'Sucio' },
]
const comisionField = {
  key: 'comision_id',
  label: 'Comisión',
  type: 'select',
  options: computed(() => appState.comisiones.map((item) => ({ value: item.id, label: item.nombre }))),
  required: true,
}

const configs = {
  reciclajes: {
    title: 'Registro de reciclaje',
    description: 'Seguimiento del material separado y recuperado por la comunidad.',
    createLabel: 'Registrar material',
    filters: [
      { key: 'tipo_residuo', label: 'Tipo de residuo', options: residuo },
      { key: 'comision_id', label: 'Comisión', options: computed(() => appState.comisiones.map((item) => ({ value: item.id, label: item.nombre }))) },
      { key: 'mes', label: 'Mes', type: 'month' },
    ],
    columns: [
      { key: 'fecha', label: 'Fecha' },
      { key: 'tipo_residuo', label: 'Material' },
      { key: 'kilos', label: 'Kilos' },
      { key: 'participantes', label: 'Participantes' },
      { key: 'frecuencia', label: 'Frecuencia' },
      { key: 'comision_id', label: 'Comisión' },
      { key: 'estado', label: 'Estado' },
    ],
    fields: [
      { key: 'fecha', label: 'Fecha', type: 'date', required: true },
      { key: 'tipo_residuo', label: 'Tipo de residuo', type: 'select', options: residuo, required: true },
      { key: 'kilos', label: 'Kilos recuperados', type: 'number', min: 0.1, step: 0.1, required: true },
      { key: 'participantes', label: 'Cantidad de participantes', type: 'number', min: 0, step: 1, required: true },
      { key: 'frecuencia', label: 'Frecuencia de reciclado', type: 'select', options: frecuencia, required: true },
      { key: 'cestos_instalados', label: 'Cestos instalados', type: 'number', min: 0, step: 1, required: true },
      { key: 'uso_cestos', label: 'Uso observado de los cestos', type: 'select', options: frecuencia, required: true },
      comisionField,
    ],
    canCreate: () => can('reciclaje') && ['consejo', 'socio'].includes(appState.rol),
    canEdit: () => appState.rol === 'consejo',
    canCancel: () => appState.rol === 'consejo',
    filterStatus: [{ value: 'vigente', label: 'Vigente' }, { value: 'anulado', label: 'Anulado' }],
  },
  socios: {
    title: 'Registro de socios',
    description: 'Padrón de estudiantes asociados. La baja se conserva en el historial.',
    createLabel: 'Registrar socio/a',
    filters: [
      { key: 'estado', label: 'Estado del socio', options: [{ value: 'activo', label: 'Activo' }, { value: 'baja', label: 'Baja' }] },
      { key: 'comision_id', label: 'Comisión', options: computed(() => appState.comisiones.map((item) => ({ value: item.id, label: item.nombre }))) },
    ],
    columns: [
      { key: 'codigo', label: 'Código' },
      { key: 'nombre', label: 'Nombre ficticio' },
      { key: 'comision_id', label: 'Comisión' },
      { key: 'fecha_alta', label: 'Alta' },
      { key: 'fecha_baja', label: 'Baja' },
      { key: 'baja_escuchada', label: 'Persona escuchada' },
      { key: 'estado', label: 'Estado' },
    ],
    fields: [
      { key: 'codigo', label: 'Código de socio', type: 'text', required: true, maxlength: 20 },
      { key: 'nombre', label: 'Nombre ficticio', type: 'text', required: true, maxlength: 80 },
      { key: 'fecha_alta', label: 'Fecha de alta', type: 'date', required: true },
      comisionField,
    ],
    canCreate: () => appState.rol === 'consejo',
    canEdit: () => appState.rol === 'consejo',
    canCancel: () => appState.rol === 'consejo',
    filterStatus: [],
  },
  reportes_basurales: {
    title: 'Reportes del terreno',
    description: 'Avisos comunitarios sobre puntos con basura y estado del entorno.',
    createLabel: 'Informar punto',
    filters: [
      { key: 'estado', label: 'Estado del reporte', options: [
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'en_revision', label: 'En revisión' },
        { value: 'resuelto', label: 'Resuelto' },
        { value: 'cerrado', label: 'Cerrado' },
      ] },
      { key: 'estado_terreno', label: 'Estado del terreno', options: terreno },
      { key: 'mes', label: 'Mes', type: 'month' },
    ],
    columns: [
      { key: 'fecha', label: 'Fecha' },
      { key: 'ubicacion', label: 'Ubicación' },
      { key: 'descripcion', label: 'Descripción' },
      { key: 'estado_terreno', label: 'Terreno' },
      { key: 'estado', label: 'Reporte' },
      { key: 'foto_url', label: 'Foto' },
    ],
    fields: [
      { key: 'fecha', label: 'Fecha del reporte', type: 'date', required: true },
      { key: 'ubicacion', label: 'Ubicación descriptiva', type: 'text', required: true, maxlength: 120 },
      { key: 'descripcion', label: 'Descripción', type: 'textarea', required: true, maxlength: 500 },
      { key: 'estado_terreno', label: 'Estado del terreno', type: 'select', options: terreno, required: true },
      { key: 'estado', label: 'Estado del reporte', type: 'select', options: [
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'en_revision', label: 'En revisión' },
        { value: 'resuelto', label: 'Resuelto' },
      ], required: true },
      { key: 'foto_url', label: 'Enlace a foto (opcional)', type: 'url' },
      comisionField,
    ],
    canCreate: () => can('reportes'),
    canEdit: () => appState.rol === 'consejo',
    canCancel: () => appState.rol === 'consejo',
    filterStatus: [],
  },
  movimientos: {
    title: 'Libro de ingresos y egresos',
    description: 'Movimientos con comprobante obligatorio para cada gasto.',
    createLabel: 'Registrar movimiento',
    filters: [
      { key: 'tipo', label: 'Tipo', options: [{ value: 'ingreso', label: 'Ingreso' }, { value: 'egreso', label: 'Egreso' }] },
      { key: 'estado', label: 'Estado', options: [{ value: 'vigente', label: 'Vigente' }, { value: 'anulado', label: 'Anulado' }] },
      { key: 'mes', label: 'Mes', type: 'month' },
    ],
    columns: [
      { key: 'fecha', label: 'Fecha' },
      { key: 'tipo', label: 'Tipo' },
      { key: 'concepto', label: 'Concepto' },
      { key: 'monto', label: 'Monto' },
      { key: 'comprobante', label: 'Comprobante' },
      { key: 'estado', label: 'Estado' },
    ],
    fields: [
      { key: 'fecha', label: 'Fecha', type: 'date', required: true },
      { key: 'tipo', label: 'Tipo de movimiento', type: 'select', options: [{ value: 'ingreso', label: 'Ingreso' }, { value: 'egreso', label: 'Egreso' }], required: true },
      { key: 'concepto', label: 'Concepto', type: 'text', required: true, maxlength: 160 },
      { key: 'monto', label: 'Monto (moneda por definir)', type: 'number', min: 0.01, step: 0.01, required: true },
      { key: 'comprobante', label: 'Comprobante o referencia', type: 'text', maxlength: 200 },
    ],
    canCreate: () => appState.rol === 'consejo',
    canEdit: () => false,
    canCancel: () => appState.rol === 'consejo',
    filterStatus: [],
  },
}

const config = computed(() => configs[props.kind])
const registros = computed(() => appState.datos[props.kind] || [])
const filtros = reactive({ q: '', tipo_residuo: '', comision_id: '', estado: '', estado_terreno: '', tipo: '', mes: '' })
const modalAbierto = ref(false)
const registroEditando = ref(null)
const formulario = ref({})
const errores = ref({})
const errorOperacion = ref('')
const mensajeOperacion = ref('')
const guardando = ref(false)
const modalBaja = ref(false)
const bajaEscuchada = ref(false)

const campos = computed(() => config.value.fields)
const opcionesFiltros = (filter) => Array.isArray(filter.options) ? filter.options : filter.options.value
const cantidadSociosActivos = computed(conteoSociosActivos)

const registrosFiltrados = computed(() => {
  const consulta = filtros.q.trim().toLocaleLowerCase('es')
  return registros.value
    .filter((registro) => {
      const coincideTexto = !consulta || config.value.columns.some((column) => {
        const value = column.key === 'comision_id' ? comisionNombre(registro.comision_id) : registro[column.key]
        return String(value ?? '').toLocaleLowerCase('es').includes(consulta)
      })
      const coincideFiltros = config.value.filters.every((filter) => {
        const valor = filtros[filter.key]
        if (!valor) return true
        if (filter.key === 'mes') return registro.fecha?.startsWith(valor)
        return String(registro[filter.key] ?? '') === valor
      })
      const coincideEstado = !filtros.estado || String(registro.estado) === filtros.estado
      return coincideTexto && coincideFiltros && coincideEstado
    })
    .sort((a, b) => String(b.fecha || b.fecha_alta || '').localeCompare(String(a.fecha || a.fecha_alta || '')))
})

function hoyLocal() {
  const ahora = new Date()
  return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`
}

function comisionNombre(id) {
  return appState.comisiones.find((item) => item.id === id)?.nombre || '—'
}

function etiqueta(key, value) {
  const opciones = {
    papel: 'Papel', carton: 'Cartón', plastico: 'Plástico', latas: 'Latas',
    siempre: 'Siempre', a_veces: 'A veces', nunca: 'Nunca',
    limpio: 'Limpio', parcialmente_limpio: 'Parcialmente limpio', sucio: 'Sucio',
    pendiente: 'Pendiente', en_revision: 'En revisión', resuelto: 'Resuelto', cerrado: 'Cerrado',
    vigente: 'Vigente', anulado: 'Anulado', activo: 'Activo', baja: 'Baja',
    ingreso: 'Ingreso', egreso: 'Egreso',
  }
  if (key === 'comision_id') return comisionNombre(value)
  if (key === 'foto_url') return value ? 'Ver foto' : 'Sin foto'
  if (key === 'baja_escuchada') return value ? 'Sí' : '—'
  if (key === 'monto') return Number(value).toLocaleString('es-AR', { maximumFractionDigits: 2 })
  return opciones[value] || value || '—'
}

function claseEstado(estado) {
  return `status-${estado}`
}

function nuevoFormulario(registro = null) {
  registroEditando.value = registro
  errores.value = {}
  errorOperacion.value = ''
  mensajeOperacion.value = ''
  const valores = Object.fromEntries(config.value.fields.map((field) => [field.key, '']))
  valores.fecha = hoyLocal()
  valores.fecha_alta = hoyLocal()
  valores.estado = props.kind === 'socios' ? 'activo' : props.kind === 'reportes_basurales' ? 'pendiente' : 'vigente'
  valores.estado_terreno = 'sucio'
  valores.baja_escuchada = false
  valores.frecuencia = 'siempre'
  valores.uso_cestos = 'siempre'
  valores.cestos_instalados = 0
  valores.participantes = 0
  valores.tipo = 'ingreso'
  valores.tipo_residuo = 'papel'
  valores.comision_id = appState.comisiones[0]?.id || ''
  formulario.value = { ...valores, ...(registro || {}) }
  modalAbierto.value = true
}

function guardarFormulario() {
  if (!config.value.canCreate() && !config.value.canEdit()) return
  errores.value = validarRegistro(props.kind, formulario.value)
  if (Object.keys(errores.value).length) return
  void guardarCambios()
}

async function guardarCambios() {
  guardando.value = true
  errorOperacion.value = ''
  try {
    const registro = { ...formulario.value }
    if (props.kind === 'reciclajes') {
      registro.kilos = Number(registro.kilos)
      registro.participantes = Number(registro.participantes)
      registro.cestos_instalados = Number(registro.cestos_instalados)
      registro.estado ||= 'vigente'
    }
    if (props.kind === 'socios' && !registro.id) registro.estado = 'activo'
    if (props.kind === 'reportes_basurales' && !registro.id) registro.estado = 'pendiente'
    if (props.kind === 'movimientos') {
      registro.monto = Number(registro.monto)
      registro.estado ||= 'vigente'
      if (!registro.comprobante?.trim()) registro.comprobante = null
    }
    await guardarRegistro(props.kind, registro)
    mensajeOperacion.value = registroEditando.value ? 'Cambios guardados.' : 'Registro creado.'
    modalAbierto.value = false
  } catch (error) {
    errorOperacion.value = `No se pudo guardar: ${error.message || 'error inesperado.'}`
  } finally {
    guardando.value = false
  }
}

function solicitarCancelacion(registro) {
  if (props.kind === 'socios' && registro.estado === 'activo' && cantidadSociosActivos.value <= 9) {
    errorOperacion.value = 'No se puede registrar esta baja: el reglamento establece un mínimo de 9 socios.'
    return
  }
  if (props.kind === 'socios') {
    bajaEscuchada.value = false
    registroPendienteBaja.value = registro
    modalBaja.value = true
    return
  }
  const confirmacion = props.kind === 'movimientos'
      ? '¿Anular este movimiento? Se conservará en el libro como anulado.'
      : props.kind === 'reciclajes'
        ? '¿Anular este registro de reciclaje? Se conservará en el historial.'
        : '¿Cerrar este reporte? Se conservará en el historial.'
  if (!window.confirm(confirmacion)) return

  const actualizado = { ...registro, estado: props.kind === 'reportes_basurales' ? 'cerrado' : 'anulado' }
  void cancelarRegistro(actualizado)
}

const registroPendienteBaja = ref(null)

async function cancelarRegistro(registro) {
  guardando.value = true
  errorOperacion.value = ''
  try {
    await guardarRegistro(props.kind, registro)
    mensajeOperacion.value = 'La operación se confirmó y el registro quedó en el historial.'
  } catch (error) {
    errorOperacion.value = `No se pudo completar la operación: ${error.message || 'error inesperado.'}`
  } finally {
    guardando.value = false
  }
}

async function confirmarBaja() {
  if (!bajaEscuchada.value) {
    errorOperacion.value = 'Antes de registrar la baja, confirmá que la persona fue escuchada por el Consejo.'
    return
  }
  guardando.value = true
  errorOperacion.value = ''
  try {
    await guardarRegistro('socios', {
      ...registroPendienteBaja.value,
      estado: 'baja',
      fecha_baja: hoyLocal(),
      baja_escuchada: true,
    })
    modalBaja.value = false
    mensajeOperacion.value = 'Baja registrada; queda en el padrón con constancia de escucha.'
  } catch (error) {
    errorOperacion.value = `No se pudo registrar la baja: ${error.message || 'error inesperado.'}`
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <section class="page-heading">
    <div>
      <p class="eyebrow">Gestión de la precooperativa</p>
      <h1>{{ config.title }}</h1>
      <p>{{ config.description }}</p>
    </div>
    <button v-if="config.canCreate()" class="button" type="button" @click="nuevoFormulario()">＋ {{ config.createLabel }}</button>
  </section>

  <div v-if="kind === 'socios'" class="notice notice-info">
    {{ cantidadSociosActivos }} socios activos. El reglamento establece un mínimo de 9. Las bajas se conservan.
  </div>
  <div v-if="kind === 'movimientos'" class="notice notice-info">
    El comprobante se pide obligatoriamente para los egresos. Los montos se muestran sin símbolo porque la moneda no está especificada.
  </div>
  <p v-if="mensajeOperacion" class="notice notice-success" role="status">{{ mensajeOperacion }}</p>
  <p v-if="errorOperacion" class="notice notice-error" role="alert">{{ errorOperacion }}</p>

  <section class="panel records-panel">
    <div class="filter-row">
      <label class="search-field">
        <span>Buscar</span>
        <input v-model="filtros.q" type="search" placeholder="Buscar en los registros" aria-label="Buscar en los registros">
      </label>
      <label v-for="filter in config.filters" :key="filter.key">
        <span>{{ filter.label }}</span>
        <input v-if="filter.type === 'month'" v-model="filtros[filter.key]" type="month">
        <select v-else v-model="filtros[filter.key]">
          <option value="">Todos</option>
          <option v-for="option in opcionesFiltros(filter)" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>
    </div>

    <div v-if="kind === 'reciclajes'" class="extra-filter">
      <label>
        <span>Estado del registro</span>
        <select v-model="filtros.estado">
          <option value="">Todos</option>
          <option value="vigente">Vigente</option>
          <option value="anulado">Anulado</option>
        </select>
      </label>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th v-for="column in config.columns" :key="column.key">{{ column.label }}</th>
            <th v-if="config.canEdit() || config.canCancel()">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="registro in registrosFiltrados" :key="registro.id">
            <td v-for="column in config.columns" :key="column.key">
              <a
                v-if="column.key === 'foto_url' && registro.foto_url"
                :href="registro.foto_url"
                target="_blank"
                rel="noopener noreferrer"
              >Ver foto ↗</a>
              <span v-else-if="column.key === 'estado'" class="status-pill" :class="claseEstado(registro.estado)">
                {{ etiqueta(column.key, registro.estado) }}
              </span>
              <span v-else>{{ etiqueta(column.key, registro[column.key]) }}</span>
            </td>
            <td v-if="config.canEdit() || config.canCancel()">
              <div class="row-actions">
                <button
                  v-if="config.canEdit() && kind !== 'movimientos'"
                  class="text-button"
                  type="button"
                  :disabled="guardando"
                  @click="nuevoFormulario(registro)"
                >Editar</button>
                <button
                  v-if="config.canCancel() && registro.estado !== 'baja' && registro.estado !== 'anulado' && registro.estado !== 'cerrado'"
                  class="text-button text-danger"
                  type="button"
                  :disabled="guardando"
                  @click="solicitarCancelacion(registro)"
                >{{ kind === 'socios' ? 'Registrar baja' : kind === 'reportes_basurales' ? 'Cerrar' : 'Anular' }}</button>
              </div>
            </td>
          </tr>
          <tr v-if="!registrosFiltrados.length">
            <td class="table-empty" :colspan="config.columns.length + (config.canEdit() || config.canCancel() ? 1 : 0)">
              No hay registros que coincidan con la búsqueda y los filtros.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="results-count">{{ registrosFiltrados.length }} de {{ registros.length }} registros</p>
  </section>

  <div v-if="modalAbierto" class="modal-backdrop" role="presentation" @click.self="modalAbierto = false">
    <section class="form-modal" role="dialog" aria-modal="true" :aria-labelledby="`form-title-${kind}`">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">{{ registroEditando ? 'Modificar registro' : 'Nuevo registro' }}</p>
          <h2 :id="`form-title-${kind}`">{{ registroEditando ? 'Editar información' : config.createLabel }}</h2>
        </div>
        <button class="icon-button" type="button" aria-label="Cerrar formulario" @click="modalAbierto = false">×</button>
      </div>
      <form class="stack-form" @submit.prevent="guardarFormulario">
        <label v-for="field in campos" :key="field.key">
          <span>
            {{ field.label }}
            <em v-if="field.required || (field.key === 'comprobante' && formulario.tipo === 'egreso')">Obligatorio</em>
            <small v-else>Opcional</small>
          </span>
          <select
            v-if="field.type === 'select'"
            v-model="formulario[field.key]"
            :required="field.required"
            :aria-invalid="Boolean(errores[field.key])"
          >
            <option value="" disabled>Seleccioná una opción</option>
            <option v-for="option in (Array.isArray(field.options) ? field.options : field.options.value)" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <textarea
            v-else-if="field.type === 'textarea'"
            v-model.trim="formulario[field.key]"
            :maxlength="field.maxlength"
            :required="field.required"
            :aria-invalid="Boolean(errores[field.key])"
            rows="3"
          />
          <input
            v-else
            v-model.trim="formulario[field.key]"
            :type="field.type"
            :min="field.min"
            :step="field.step"
            :maxlength="field.maxlength"
            :required="field.required || (field.key === 'comprobante' && formulario.tipo === 'egreso')"
            :aria-invalid="Boolean(errores[field.key])"
          >
          <small v-if="errores[field.key]" class="field-error">{{ errores[field.key] }}</small>
        </label>
        <p v-if="kind === 'reportes_basurales'" class="form-help">
          [SUPUESTO] La foto se referencia mediante un enlace web; esta versión no carga archivos ni muestra un mapa.
        </p>
        <p v-if="kind === 'socios'" class="form-help">
          [SUPUESTO] Se usan nombres inventados, sin información de contacto. No cargues datos reales en este prototipo.
        </p>
        <button class="button" type="submit" :disabled="guardando">
          {{ guardando ? 'Guardando…' : 'Guardar registro' }}
        </button>
      </form>
    </section>
  </div>

  <div v-if="modalBaja" class="modal-backdrop" role="presentation" @click.self="modalBaja = false">
    <section class="form-modal hearing-modal" role="dialog" aria-modal="true" aria-labelledby="hearing-title">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Procedimiento de baja</p>
          <h2 id="hearing-title">Escuchar antes de decidir</h2>
        </div>
        <button class="icon-button" type="button" aria-label="Cerrar confirmación" @click="modalBaja = false">×</button>
      </div>
      <p class="form-help">
        El reglamento indica que una baja debe realizarse después de escuchar a la persona. No ingreses detalles personales en esta constancia.
      </p>
      <label class="hearing-check">
        <input v-model="bajaEscuchada" type="checkbox">
        Confirmo que el Consejo escuchó a la persona antes de registrar la baja.
      </label>
      <p v-if="errorOperacion" class="notice notice-error" role="alert">{{ errorOperacion }}</p>
      <div class="dialog-actions">
        <button class="button button-outline" type="button" @click="modalBaja = false">Volver</button>
        <button class="button" type="button" :disabled="guardando" @click="confirmarBaja">
          {{ guardando ? 'Guardando…' : 'Confirmar baja' }}
        </button>
      </div>
    </section>
  </div>
</template>
