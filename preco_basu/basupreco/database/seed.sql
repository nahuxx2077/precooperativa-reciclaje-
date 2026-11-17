-- Registros inventados para demostración; no son información de personas reales.
insert into public.comisiones (id, nombre, descripcion) values
  ('00000000-0000-4000-8000-000000000001', 'Recolección y separación', 'Puntos de separación y acopio'),
  ('00000000-0000-4000-8000-000000000002', 'Limpieza y cuidado del entorno', 'Campañas de limpieza'),
  ('00000000-0000-4000-8000-000000000003', 'Comunicación y difusión', 'Concientización comunitaria'),
  ('00000000-0000-4000-8000-000000000004', 'Técnica', 'Apoyo técnico'),
  ('00000000-0000-4000-8000-000000000005', 'Administración', 'Registro administrativo'),
  ('00000000-0000-4000-8000-000000000006', 'Acción comunitaria', 'Participación con vecinos')
on conflict (id) do nothing;

insert into public.socios (id, codigo, nombre, comision_id, fecha_alta, fecha_baja, baja_escuchada, estado) values
  ('20000000-0000-4000-8000-000000000001', 'SOC-001', 'Alex Ríos', '00000000-0000-4000-8000-000000000001', '2026-03-10', null, false, 'activo'),
  ('20000000-0000-4000-8000-000000000002', 'SOC-002', 'Sol Benítez', '00000000-0000-4000-8000-000000000002', '2026-03-11', null, false, 'activo'),
  ('20000000-0000-4000-8000-000000000003', 'SOC-003', 'Noa Fernández', '00000000-0000-4000-8000-000000000003', '2026-03-12', null, false, 'activo'),
  ('20000000-0000-4000-8000-000000000004', 'SOC-004', 'Luz Acosta', '00000000-0000-4000-8000-000000000004', '2026-03-13', null, false, 'activo'),
  ('20000000-0000-4000-8000-000000000005', 'SOC-005', 'Tiziano Luna', '00000000-0000-4000-8000-000000000005', '2026-03-14', null, false, 'activo'),
  ('20000000-0000-4000-8000-000000000006', 'SOC-006', 'Uma Paredes', '00000000-0000-4000-8000-000000000006', '2026-03-15', null, false, 'activo'),
  ('20000000-0000-4000-8000-000000000007', 'SOC-007', 'Ivo Sosa', '00000000-0000-4000-8000-000000000001', '2026-03-16', null, false, 'activo'),
  ('20000000-0000-4000-8000-000000000008', 'SOC-008', 'Mora Vidal', '00000000-0000-4000-8000-000000000002', '2026-03-17', null, false, 'activo'),
  ('20000000-0000-4000-8000-000000000009', 'SOC-009', 'Teo Navarro', '00000000-0000-4000-8000-000000000003', '2026-03-18', null, false, 'activo'),
  ('20000000-0000-4000-8000-000000000010', 'SOC-010', 'Ari Vega', '00000000-0000-4000-8000-000000000004', '2026-03-19', null, false, 'activo'),
  ('20000000-0000-4000-8000-000000000011', 'SOC-011', 'Kai Molina', '00000000-0000-4000-8000-000000000006', '2026-03-20', '2026-05-04', true, 'baja')
on conflict (id) do nothing;

insert into public.reciclajes
  (id, fecha, tipo_residuo, kilos, participantes, frecuencia, cestos_instalados, uso_cestos, comision_id, estado)
values
  ('10000000-0000-4000-8000-000000000001', '2026-11-03', 'papel', 18.5, 12, 'siempre', 3, 'siempre', '00000000-0000-4000-8000-000000000001', 'vigente'),
  ('10000000-0000-4000-8000-000000000002', '2026-11-07', 'plastico', 24, 9, 'a_veces', 2, 'a_veces', '00000000-0000-4000-8000-000000000001', 'vigente'),
  ('10000000-0000-4000-8000-000000000003', '2026-11-12', 'carton', 31.2, 15, 'siempre', 4, 'siempre', '00000000-0000-4000-8000-000000000001', 'vigente'),
  ('10000000-0000-4000-8000-000000000004', '2026-10-24', 'latas', 8.4, 7, 'a_veces', 1, 'a_veces', '00000000-0000-4000-8000-000000000001', 'vigente')
on conflict (id) do nothing;

insert into public.reportes_basurales
  (id, fecha, ubicacion, descripcion, estado_terreno, estado, comision_id)
values
  ('30000000-0000-4000-8000-000000000001', '2026-11-08', 'Lateral norte del terreno escolar', 'Se observaron bolsas y envases cerca del alambrado.', 'sucio', 'pendiente', '00000000-0000-4000-8000-000000000002'),
  ('30000000-0000-4000-8000-000000000002', '2026-11-10', 'Esquina del patio exterior', 'Después de la jornada de limpieza quedó parcialmente despejado.', 'parcialmente_limpio', 'en_revision', '00000000-0000-4000-8000-000000000006'),
  ('30000000-0000-4000-8000-000000000003', '2026-10-19', 'Borde oeste del terreno', 'Zona despejada durante la campaña comunitaria.', 'limpio', 'resuelto', '00000000-0000-4000-8000-000000000002')
on conflict (id) do nothing;

insert into public.movimientos
  (id, fecha, tipo, concepto, monto, comprobante, estado)
values
  ('40000000-0000-4000-8000-000000000001', '2026-10-05', 'ingreso', 'Aporte por recuperación de cartón', 18500, 'Recibo ficticio R-001', 'vigente'),
  ('40000000-0000-4000-8000-000000000002', '2026-10-12', 'egreso', 'Compra de bolsas resistentes', 7200, 'Factura ficticia F-017', 'vigente'),
  ('40000000-0000-4000-8000-000000000003', '2026-11-02', 'ingreso', 'Recuperación de latas', 6400, 'Recibo ficticio R-002', 'vigente'),
  ('40000000-0000-4000-8000-000000000004', '2026-11-04', 'egreso', 'Materiales para cartelería', 3900, 'Factura ficticia F-021', 'anulado')
on conflict (id) do nothing;
