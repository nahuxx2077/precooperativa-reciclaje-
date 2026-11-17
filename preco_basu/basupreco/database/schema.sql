-- Esquema inicial para Supabase/PostgreSQL.
create extension if not exists pgcrypto;

create table if not exists public.comisiones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  descripcion text
);

create table if not exists public.socios (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nombre text not null,
  comision_id uuid not null references public.comisiones(id),
  fecha_alta date not null,
  fecha_baja date,
  baja_escuchada boolean not null default false,
  estado text not null default 'activo' check (estado in ('activo', 'baja')),
  created_at timestamptz not null default now(),
  constraint fecha_baja_coherente check (
    (estado = 'activo' and fecha_baja is null and baja_escuchada = false)
    or (estado = 'baja' and fecha_baja is not null and baja_escuchada = true)
  )
);

create table if not exists public.perfiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rol text not null check (rol in ('consejo', 'sindicatura', 'socio', 'docente_guia', 'vecino')),
  socio_id uuid references public.socios(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.reciclajes (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  tipo_residuo text not null check (tipo_residuo in ('papel', 'carton', 'plastico', 'latas')),
  kilos numeric(10, 2) not null check (kilos > 0),
  participantes integer not null check (participantes >= 0),
  frecuencia text not null check (frecuencia in ('siempre', 'a_veces', 'nunca')),
  cestos_instalados integer not null default 0 check (cestos_instalados >= 0),
  uso_cestos text not null check (uso_cestos in ('siempre', 'a_veces', 'nunca')),
  comision_id uuid not null references public.comisiones(id),
  estado text not null default 'vigente' check (estado in ('vigente', 'anulado')),
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.reportes_basurales (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  ubicacion text not null,
  descripcion text not null,
  estado_terreno text not null check (estado_terreno in ('limpio', 'parcialmente_limpio', 'sucio')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'en_revision', 'resuelto', 'cerrado')),
  foto_url text,
  comision_id uuid not null references public.comisiones(id),
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint foto_url_vacia_o_web check (foto_url is null or foto_url = '' or foto_url ~ '^https?://')
);

create table if not exists public.movimientos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  tipo text not null check (tipo in ('ingreso', 'egreso')),
  concepto text not null,
  monto numeric(12, 2) not null check (monto > 0),
  comprobante text,
  estado text not null default 'vigente' check (estado in ('vigente', 'anulado')),
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint comprobante_obligatorio_en_egreso check (
    tipo <> 'egreso' or (comprobante is not null and length(trim(comprobante)) > 0)
  )
);

create index if not exists reciclajes_fecha_idx on public.reciclajes(fecha desc);
create index if not exists reciclajes_tipo_residuo_idx on public.reciclajes(tipo_residuo);
create index if not exists reportes_estado_fecha_idx on public.reportes_basurales(estado, fecha desc);
create index if not exists movimientos_fecha_idx on public.movimientos(fecha desc);
create index if not exists socios_estado_idx on public.socios(estado);

-- Helper seguro para evaluar roles sin recursión en las políticas de perfiles.
create or replace function public.tiene_rol(roles_permitidos text[])
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.perfiles
    where user_id = auth.uid()
      and rol = any(roles_permitidos)
  );
$$;

revoke all on function public.tiene_rol(text[]) from public;
grant execute on function public.tiene_rol(text[]) to authenticated;

-- La baja lógica no puede reducir el padrón activo por debajo de nueve.
create or replace function public.verificar_minimo_socios_activos()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  socios_activos integer;
begin
  if old.estado = 'activo' and new.estado = 'baja' then
    perform pg_advisory_xact_lock(739281);
    select count(*) into socios_activos
    from public.socios
    where estado = 'activo' and id <> old.id;

    if socios_activos < 9 then
      raise exception 'La precooperativa debe conservar al menos 9 socios activos.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists socios_minimo_activos on public.socios;
create trigger socios_minimo_activos
before update of estado on public.socios
for each row execute function public.verificar_minimo_socios_activos();

-- El libro contable no permite reescribir asientos; sólo pasar de vigente a anulado.
create or replace function public.proteger_movimientos_contables()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if old.estado = 'anulado' then
    raise exception 'Un movimiento anulado no se puede modificar.';
  end if;
  if new.estado <> 'anulado'
    or new.fecha is distinct from old.fecha
    or new.tipo is distinct from old.tipo
    or new.concepto is distinct from old.concepto
    or new.monto is distinct from old.monto
    or new.comprobante is distinct from old.comprobante
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at then
    raise exception 'Un movimiento sólo puede anularse; para corregirlo, registrá uno nuevo.';
  end if;
  return new;
end;
$$;

drop trigger if exists movimientos_solo_anulacion on public.movimientos;
create trigger movimientos_solo_anulacion
before update on public.movimientos
for each row execute function public.proteger_movimientos_contables();

alter table public.comisiones enable row level security;
alter table public.socios enable row level security;
alter table public.perfiles enable row level security;
alter table public.reciclajes enable row level security;
alter table public.reportes_basurales enable row level security;
alter table public.movimientos enable row level security;

grant usage on schema public to authenticated;
grant select on public.comisiones to authenticated;
grant select, insert, update on public.socios to authenticated;
grant select, insert, update on public.reciclajes to authenticated;
grant select, insert, update on public.reportes_basurales to authenticated;
grant select, insert, update on public.movimientos to authenticated;
grant select on public.perfiles to authenticated;

drop policy if exists comisiones_lectura_integrantes on public.comisiones;
create policy comisiones_lectura_integrantes on public.comisiones
for select to authenticated
using (public.tiene_rol(array['consejo', 'sindicatura', 'socio', 'docente_guia', 'vecino']));

drop policy if exists perfiles_lectura_propio_o_consejo on public.perfiles;
create policy perfiles_lectura_propio_o_consejo on public.perfiles
for select to authenticated
using (user_id = auth.uid() or public.tiene_rol(array['consejo']));

drop policy if exists socios_lectura_integrantes on public.socios;
create policy socios_lectura_integrantes on public.socios
for select to authenticated
using (public.tiene_rol(array['consejo', 'sindicatura', 'socio', 'docente_guia', 'vecino']));
drop policy if exists socios_alta_consejo on public.socios;
create policy socios_alta_consejo on public.socios
for insert to authenticated with check (public.tiene_rol(array['consejo']));
drop policy if exists socios_cambio_consejo on public.socios;
create policy socios_cambio_consejo on public.socios
for update to authenticated
using (public.tiene_rol(array['consejo']))
with check (public.tiene_rol(array['consejo']));

drop policy if exists reciclajes_lectura_integrantes on public.reciclajes;
create policy reciclajes_lectura_integrantes on public.reciclajes
for select to authenticated
using (public.tiene_rol(array['consejo', 'sindicatura', 'socio', 'docente_guia', 'vecino']));
drop policy if exists reciclajes_alta_socios on public.reciclajes;
create policy reciclajes_alta_socios on public.reciclajes
for insert to authenticated
with check (created_by = auth.uid() and public.tiene_rol(array['consejo', 'socio']));
drop policy if exists reciclajes_cambio_consejo on public.reciclajes;
create policy reciclajes_cambio_consejo on public.reciclajes
for update to authenticated
using (public.tiene_rol(array['consejo']))
with check (public.tiene_rol(array['consejo']));

drop policy if exists reportes_lectura_integrantes on public.reportes_basurales;
create policy reportes_lectura_integrantes on public.reportes_basurales
for select to authenticated
using (public.tiene_rol(array['consejo', 'sindicatura', 'socio', 'docente_guia', 'vecino']));
drop policy if exists reportes_alta_integrantes on public.reportes_basurales;
create policy reportes_alta_integrantes on public.reportes_basurales
for insert to authenticated
with check (
  created_by = auth.uid()
  and public.tiene_rol(array['consejo', 'sindicatura', 'socio', 'docente_guia', 'vecino'])
);
drop policy if exists reportes_cambio_consejo on public.reportes_basurales;
create policy reportes_cambio_consejo on public.reportes_basurales
for update to authenticated
using (public.tiene_rol(array['consejo']))
with check (public.tiene_rol(array['consejo']));

drop policy if exists movimientos_lectura_consejo_sindicatura on public.movimientos;
create policy movimientos_lectura_consejo_sindicatura on public.movimientos
for select to authenticated
using (public.tiene_rol(array['consejo', 'sindicatura']));
drop policy if exists movimientos_alta_consejo on public.movimientos;
create policy movimientos_alta_consejo on public.movimientos
for insert to authenticated
with check (created_by = auth.uid() and public.tiene_rol(array['consejo']));
drop policy if exists movimientos_anulacion_consejo on public.movimientos;
create policy movimientos_anulacion_consejo on public.movimientos
for update to authenticated
using (public.tiene_rol(array['consejo']))
with check (public.tiene_rol(array['consejo']));
