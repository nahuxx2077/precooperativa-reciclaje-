<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ingresar } from '@/stores/app'
import { usaSupabase } from '@/lib/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const cargando = ref(false)
const error = ref('')
const exito = ref('')

async function submit() {
  error.value = ''
  exito.value = ''
  cargando.value = true
  try {
    await ingresar(email.value.trim(), password.value)
    exito.value = 'Sesión iniciada.'
    await router.replace('/')
  } catch (cause) {
    error.value = `No se pudo iniciar sesión: ${cause.message || 'revisá tus datos e intentá nuevamente.'}`
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <section class="auth-card">
    <p class="eyebrow">Acceso de integrantes</p>
    <h1>Ingresar</h1>
    <p v-if="!usaSupabase" class="notice notice-info">
      El modo de prueba no requiere cuenta. Elegí un rol en el selector superior.
    </p>
    <template v-else>
      <p>Usá la cuenta que el Consejo habilitó para vos.</p>
      <form class="stack-form" @submit.prevent="submit">
        <label>
          Correo electrónico
          <input v-model.trim="email" type="email" autocomplete="username" required>
        </label>
        <label>
          Contraseña
          <input v-model="password" type="password" autocomplete="current-password" required>
        </label>
        <p v-if="error" class="notice notice-error" role="alert">{{ error }}</p>
        <p v-if="exito" class="notice notice-success" role="status">{{ exito }}</p>
        <button class="button" type="submit" :disabled="cargando">
          {{ cargando ? 'Ingresando…' : 'Ingresar' }}
        </button>
      </form>
      <p class="form-help">Las cuentas se crean y se asignan desde Supabase por una persona administradora.</p>
    </template>
  </section>
</template>
