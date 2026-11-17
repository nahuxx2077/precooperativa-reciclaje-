import { reactive } from 'vue'
import { comisionesDePrueba, datosDePrueba } from '@/data/demo'
import { supabase, usaSupabase } from '@/lib/supabase'

const claveAlmacenamiento = 'precoop-demo-v1'
const nombresTablas = ['reciclajes', 'socios', 'reportes_basurales', 'movimientos']
const datosVacios = () => Object.fromEntries(nombresTablas.map((tabla) => [tabla, []]))
const permisosPorRol = {
  consejo: ['dashboard', 'reciclaje', 'socios', 'reportes', 'movimientos'],
  sindicatura: ['dashboard', 'reciclaje', 'socios', 'movimientos'],
  socio: ['dashboard', 'reciclaje', 'reportes'],
  docente_guia: ['dashboard', 'reportes'],
  vecino: ['dashboard', 'reportes'],
}

function cargarDatosLocales() {
  const guardados = localStorage.getItem(claveAlmacenamiento)
  return guardados ? JSON.parse(guardados) : structuredClone(datosDePrueba)
}

const estado = reactive({
  datos: usaSupabase ? datosVacios() : cargarDatosLocales(),
  comisiones: usaSupabase ? [] : structuredClone(comisionesDePrueba),
  rol: usaSupabase ? null : localStorage.getItem(`${claveAlmacenamiento}-rol`) || 'consejo',
  usuario: null,
  sesion: null,
  listo: false,
  error: '',
})

export const appState = estado

export function can(permission) {
  return Boolean(estado.rol && permisosPorRol[estado.rol]?.includes(permission))
}

export function changeDemoRole(role) {
  if (usaSupabase || !permisosPorRol[role]) return
  estado.rol = role
  localStorage.setItem(`${claveAlmacenamiento}-rol`, role)
}

async function cargarPerfil(session) {
  estado.sesion = session
  estado.usuario = session?.user ?? null
  estado.rol = null
  if (!session) {
    estado.datos = datosVacios()
    estado.comisiones = []
    return
  }

  const { data, error } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('user_id', session.user.id)
    .maybeSingle()
  if (error) throw error
  estado.rol = data?.rol ?? null
}

export async function cargarRegistros() {
  if (!usaSupabase || !estado.sesion || !estado.rol) {
    if (usaSupabase && !estado.rol) {
      estado.datos = datosVacios()
      estado.comisiones = []
    }
    return
  }
  const [reciclajes, socios, reportes, movimientos, comisiones] = await Promise.all([
    supabase.from('reciclajes').select('*').order('fecha', { ascending: false }),
    supabase.from('socios').select('*').order('nombre'),
    supabase.from('reportes_basurales').select('*').order('fecha', { ascending: false }),
    supabase.from('movimientos').select('*').order('fecha', { ascending: false }),
    supabase.from('comisiones').select('*').order('nombre'),
  ])
  for (const result of [reciclajes, socios, reportes, movimientos, comisiones]) {
    if (result.error) throw result.error
  }
  estado.datos.reciclajes = reciclajes.data
  estado.datos.socios = socios.data
  estado.datos.reportes_basurales = reportes.data
  estado.datos.movimientos = movimientos.data
  estado.comisiones = comisiones.data
  estado.error = ''
}

export async function initialize() {
  if (estado.listo) return
  try {
    if (usaSupabase) {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      await cargarPerfil(data.session)
      if (data.session) await cargarRegistros()
      supabase.auth.onAuthStateChange((_event, session) => {
        void cargarPerfil(session).then(() => cargarRegistros()).catch((error) => {
          estado.error = `No se pudieron actualizar los datos de la sesión: ${error.message || 'error inesperado.'}`
        })
      })
    }
  } catch (error) {
    estado.error = `No se pudieron cargar los datos: ${error.message || 'error inesperado.'}`
  } finally {
    estado.listo = true
  }
}

export async function ingresar(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  await cargarPerfil(data.session)
  await cargarRegistros()
  estado.error = ''
}

export async function signOut() {
  if (!usaSupabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  estado.sesion = null
  estado.usuario = null
  estado.rol = null
  for (const tabla of nombresTablas) estado.datos[tabla] = []
}

function persistirDemo() {
  localStorage.setItem(claveAlmacenamiento, JSON.stringify(estado.datos))
}

export async function guardarRegistro(tabla, registro) {
  if (!nombresTablas.includes(tabla)) throw new Error('El tipo de registro no está habilitado.')
  const copia = { ...registro }
  if (usaSupabase) {
    const id = copia.id
    delete copia.id
    let solicitud = supabase.from(tabla)
    solicitud = id ? solicitud.update(copia).eq('id', id) : solicitud.insert(copia)
    const { error } = await solicitud
    if (error) throw error
    await cargarRegistros()
    return
  }

  const registros = estado.datos[tabla]
  if (!copia.id) copia.id = crypto.randomUUID()
  const indice = registros.findIndex((item) => item.id === copia.id)
  if (indice < 0) registros.unshift(copia)
  else registros.splice(indice, 1, copia)
  persistirDemo()
}

export function conteoSociosActivos() {
  return estado.datos.socios.filter((socio) => socio.estado === 'activo').length
}
