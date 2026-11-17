const TIPOS_RESIDUO = ['papel', 'carton', 'plastico', 'latas']
const FRECUENCIAS = ['siempre', 'a_veces', 'nunca']
const ESTADOS_TERRENO = ['limpio', 'parcialmente_limpio', 'sucio']
const ESTADOS_REPORTE = ['pendiente', 'en_revision', 'resuelto']
const ESTADOS_SOCIO = ['activo', 'baja']
const TIPOS_MOVIMIENTO = ['ingreso', 'egreso']

function fechaValida(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false
  const fecha = new Date(`${value}T00:00:00`)
  return !Number.isNaN(fecha.valueOf()) && fecha.toISOString().slice(0, 10) === value
}

export function validarRegistro(tabla, registro) {
  const errores = {}
  const requerido = (campo, etiqueta) => {
    if (registro[campo] === '' || registro[campo] === null || registro[campo] === undefined) {
      errores[campo] = `${etiqueta} es obligatorio.`
    }
  }
  if (tabla !== 'socios') {
    requerido('fecha', 'La fecha')
    if (registro.fecha && !fechaValida(registro.fecha)) errores.fecha = 'Ingresá una fecha válida.'
  }

  if (tabla === 'reciclajes') {
    if (!TIPOS_RESIDUO.includes(registro.tipo_residuo)) errores.tipo_residuo = 'Elegí un tipo de residuo permitido.'
    requerido('kilos', 'Los kilos')
    if (!(Number(registro.kilos) > 0)) errores.kilos = 'Los kilos deben ser mayores que cero.'
    requerido('participantes', 'La cantidad de participantes')
    if (!Number.isInteger(Number(registro.participantes)) || Number(registro.participantes) < 0) {
      errores.participantes = 'Ingresá una cantidad entera igual o mayor que cero.'
    }
    if (!FRECUENCIAS.includes(registro.frecuencia)) errores.frecuencia = 'Elegí una frecuencia permitida.'
    if (!FRECUENCIAS.includes(registro.uso_cestos)) errores.uso_cestos = 'Elegí un uso de cestos permitido.'
    requerido('comision_id', 'La comisión')
  }

  if (tabla === 'socios') {
    requerido('nombre', 'El nombre de prueba')
    requerido('codigo', 'El código de socio')
    requerido('fecha_alta', 'La fecha de alta')
    if (registro.fecha_alta && !fechaValida(registro.fecha_alta)) errores.fecha_alta = 'Ingresá una fecha de alta válida.'
    if (!ESTADOS_SOCIO.includes(registro.estado)) errores.estado = 'Elegí un estado permitido.'
    requerido('comision_id', 'La comisión')
  }

  if (tabla === 'reportes_basurales') {
    requerido('ubicacion', 'La ubicación')
    requerido('descripcion', 'La descripción')
    if (!ESTADOS_TERRENO.includes(registro.estado_terreno)) errores.estado_terreno = 'Elegí un estado del terreno permitido.'
    if (!ESTADOS_REPORTE.includes(registro.estado)) errores.estado = 'Elegí un estado de reporte permitido.'
    if (registro.foto_url && !URL.canParse(registro.foto_url)) errores.foto_url = 'Ingresá una dirección web válida para la foto.'
    requerido('comision_id', 'La comisión')
  }

  if (tabla === 'movimientos') {
    if (!TIPOS_MOVIMIENTO.includes(registro.tipo)) errores.tipo = 'Elegí ingreso o egreso.'
    requerido('concepto', 'El concepto')
    requerido('monto', 'El monto')
    if (!(Number(registro.monto) > 0)) errores.monto = 'El monto debe ser mayor que cero.'
    if (registro.tipo === 'egreso' && !registro.comprobante?.trim()) {
      errores.comprobante = 'El comprobante es obligatorio para todo egreso.'
    }
    if (registro.comprobante && !registro.comprobante.trim()) errores.comprobante = 'El comprobante no puede estar vacío.'
  }
  return errores
}
