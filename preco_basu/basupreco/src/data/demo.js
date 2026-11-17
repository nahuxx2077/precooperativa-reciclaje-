export const comisionesDePrueba = [
  { id: '00000000-0000-4000-8000-000000000001', nombre: 'Recolección y separación' },
  { id: '00000000-0000-4000-8000-000000000002', nombre: 'Limpieza y cuidado del entorno' },
  { id: '00000000-0000-4000-8000-000000000003', nombre: 'Comunicación y difusión' },
  { id: '00000000-0000-4000-8000-000000000004', nombre: 'Técnica' },
  { id: '00000000-0000-4000-8000-000000000005', nombre: 'Administración' },
  { id: '00000000-0000-4000-8000-000000000006', nombre: 'Acción comunitaria' },
]

export const datosDePrueba = {
  reciclajes: [
    { id: '10000000-0000-4000-8000-000000000001', fecha: '2026-11-03', tipo_residuo: 'papel', kilos: 18.5, participantes: 12, frecuencia: 'siempre', cestos_instalados: 3, uso_cestos: 'siempre', comision_id: comisionesDePrueba[0].id, estado: 'vigente' },
    { id: '10000000-0000-4000-8000-000000000002', fecha: '2026-11-07', tipo_residuo: 'plastico', kilos: 24, participantes: 9, frecuencia: 'a_veces', cestos_instalados: 2, uso_cestos: 'a_veces', comision_id: comisionesDePrueba[0].id, estado: 'vigente' },
    { id: '10000000-0000-4000-8000-000000000003', fecha: '2026-11-12', tipo_residuo: 'carton', kilos: 31.2, participantes: 15, frecuencia: 'siempre', cestos_instalados: 4, uso_cestos: 'siempre', comision_id: comisionesDePrueba[0].id, estado: 'vigente' },
    { id: '10000000-0000-4000-8000-000000000004', fecha: '2026-10-24', tipo_residuo: 'latas', kilos: 8.4, participantes: 7, frecuencia: 'a_veces', cestos_instalados: 1, uso_cestos: 'a_veces', comision_id: comisionesDePrueba[0].id, estado: 'vigente' },
  ],
  socios: [
    { id: '20000000-0000-4000-8000-000000000001', nombre: 'Alex Ríos', codigo: 'SOC-001', comision_id: comisionesDePrueba[0].id, fecha_alta: '2026-03-10', estado: 'activo' },
    { id: '20000000-0000-4000-8000-000000000002', nombre: 'Sol Benítez', codigo: 'SOC-002', comision_id: comisionesDePrueba[1].id, fecha_alta: '2026-03-11', estado: 'activo' },
    { id: '20000000-0000-4000-8000-000000000003', nombre: 'Noa Fernández', codigo: 'SOC-003', comision_id: comisionesDePrueba[2].id, fecha_alta: '2026-03-12', estado: 'activo' },
    { id: '20000000-0000-4000-8000-000000000004', nombre: 'Luz Acosta', codigo: 'SOC-004', comision_id: comisionesDePrueba[3].id, fecha_alta: '2026-03-13', estado: 'activo' },
    { id: '20000000-0000-4000-8000-000000000005', nombre: 'Tiziano Luna', codigo: 'SOC-005', comision_id: comisionesDePrueba[4].id, fecha_alta: '2026-03-14', estado: 'activo' },
    { id: '20000000-0000-4000-8000-000000000006', nombre: 'Uma Paredes', codigo: 'SOC-006', comision_id: comisionesDePrueba[5].id, fecha_alta: '2026-03-15', estado: 'activo' },
    { id: '20000000-0000-4000-8000-000000000007', nombre: 'Ivo Sosa', codigo: 'SOC-007', comision_id: comisionesDePrueba[0].id, fecha_alta: '2026-03-16', estado: 'activo' },
    { id: '20000000-0000-4000-8000-000000000008', nombre: 'Mora Vidal', codigo: 'SOC-008', comision_id: comisionesDePrueba[1].id, fecha_alta: '2026-03-17', estado: 'activo' },
    { id: '20000000-0000-4000-8000-000000000009', nombre: 'Teo Navarro', codigo: 'SOC-009', comision_id: comisionesDePrueba[2].id, fecha_alta: '2026-03-18', estado: 'activo' },
    { id: '20000000-0000-4000-8000-000000000010', nombre: 'Ari Vega', codigo: 'SOC-010', comision_id: comisionesDePrueba[3].id, fecha_alta: '2026-03-19', estado: 'activo' },
    { id: '20000000-0000-4000-8000-000000000011', nombre: 'Kai Molina', codigo: 'SOC-011', comision_id: comisionesDePrueba[5].id, fecha_alta: '2026-03-20', fecha_baja: '2026-05-04', baja_escuchada: true, estado: 'baja' },
  ],
  reportes_basurales: [
    { id: '30000000-0000-4000-8000-000000000001', fecha: '2026-11-08', ubicacion: 'Lateral norte del terreno escolar', descripcion: 'Se observaron bolsas y envases cerca del alambrado.', estado_terreno: 'sucio', estado: 'pendiente', foto_url: '', comision_id: comisionesDePrueba[1].id },
    { id: '30000000-0000-4000-8000-000000000002', fecha: '2026-11-10', ubicacion: 'Esquina del patio exterior', descripcion: 'Después de la jornada de limpieza quedó parcialmente despejado.', estado_terreno: 'parcialmente_limpio', estado: 'en_revision', foto_url: '', comision_id: comisionesDePrueba[5].id },
    { id: '30000000-0000-4000-8000-000000000003', fecha: '2026-10-19', ubicacion: 'Borde oeste del terreno', descripcion: 'Zona despejada durante la campaña comunitaria.', estado_terreno: 'limpio', estado: 'resuelto', foto_url: '', comision_id: comisionesDePrueba[1].id },
  ],
  movimientos: [
    { id: '40000000-0000-4000-8000-000000000001', fecha: '2026-10-05', tipo: 'ingreso', concepto: 'Aporte por recuperación de cartón', monto: 18500, comprobante: 'Recibo ficticio R-001', estado: 'vigente' },
    { id: '40000000-0000-4000-8000-000000000002', fecha: '2026-10-12', tipo: 'egreso', concepto: 'Compra de bolsas resistentes', monto: 7200, comprobante: 'Factura ficticia F-017', estado: 'vigente' },
    { id: '40000000-0000-4000-8000-000000000003', fecha: '2026-11-02', tipo: 'ingreso', concepto: 'Recuperación de latas', monto: 6400, comprobante: 'Recibo ficticio R-002', estado: 'vigente' },
    { id: '40000000-0000-4000-8000-000000000004', fecha: '2026-11-04', tipo: 'egreso', concepto: 'Materiales para cartelería', monto: 3900, comprobante: 'Factura ficticia F-021', estado: 'anulado' },
  ],
}
