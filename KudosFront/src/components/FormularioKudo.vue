<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSesion } from '@/stores/sesion'
import AvisoDeError from './AvisoDeError.vue'
import type { Categoria } from '@/tipos'

const emit = defineEmits<{ publicado: [] }>()
const sesion = useSesion()

const categorias = ref<Categoria[]>([])
const destinatarioId = ref('')
const categoriaId = ref<number | null>(null)
const contenido = ref('')
const adjunto = ref<File | null>(null)
const enviando = ref(false)
const error = ref<unknown>(null)
const exito = ref<string | null>(null)

onMounted(async () => {
  try {
    categorias.value = await sesion.api.categorias()
    categoriaId.value = categorias.value[0]?.id ?? null
  } catch (e) {
    error.value = e
  }
})

function elegirArchivo(evento: Event) {
  adjunto.value = (evento.target as HTMLInputElement).files?.[0] ?? null
}

async function publicar() {
  if (!destinatarioId.value || categoriaId.value === null) {
    return
  }
  enviando.value = true
  error.value = null
  exito.value = null
  try {
    const kudo = await sesion.api.publicar(destinatarioId.value, categoriaId.value, contenido.value, adjunto.value)
    exito.value = `Kudo publicado (${kudo.id.slice(0, 8)}…). Las notificaciones salen por detrás.`
    contenido.value = ''
    adjunto.value = null
    emit('publicado')
  } catch (e) {
    error.value = e
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <form class="formulario" @submit.prevent="publicar">
    <h2>Dar un Kudo</h2>
    <label for="destinatario">Para</label>
    <select id="destinatario" v-model="destinatarioId" required>
      <option disabled value="">Elige a quién reconoces</option>
      <option v-for="i in sesion.otras" :key="i.oid" :value="i.oid">{{ i.nombre }}</option>
    </select>
    <label for="categoria">Categoría</label>
    <select id="categoria" v-model="categoriaId" required>
      <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
    </select>
    <label for="contenido">Mensaje</label>
    <textarea id="contenido" v-model="contenido" rows="4" placeholder="¿Qué quieres agradecer?"></textarea>
    <label for="adjunto">Adjunto (opcional: imagen o PDF)</label>
    <input id="adjunto" type="file" accept="image/png,image/jpeg,image/gif,application/pdf" @change="elegirArchivo">
    <button type="submit" :disabled="enviando || !destinatarioId">{{ enviando ? 'Publicando…' : 'Publicar' }}</button>
    <p v-if="exito" class="exito" role="status">{{ exito }}</p>
    <AvisoDeError v-if="error" :error="error" />
  </form>
</template>

<style scoped>
.formulario { display: grid; gap: 8px; }
h2 { margin: 0 0 4px; font-size: 1.25rem; }
label { font-weight: 700; font-size: .9rem; }
select, textarea, input { font: inherit; padding: 8px; border-radius: 8px; border: 1px solid var(--linea); background: var(--panel); color: var(--tinta); }
textarea { resize: vertical; }
button { font: inherit; font-weight: 700; padding: 10px; border: 0; border-radius: 8px; background: var(--acento); color: var(--sobre-acento); cursor: pointer; }
button:disabled { opacity: .5; cursor: default; }
.exito { margin: 0; color: var(--verde); }
</style>
