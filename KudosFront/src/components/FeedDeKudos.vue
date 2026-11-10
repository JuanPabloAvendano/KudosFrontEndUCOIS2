<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSesion } from '@/stores/sesion'
import AvisoDeError from './AvisoDeError.vue'
import type { Categoria, Kudo } from '@/tipos'

const sesion = useSesion()
const kudos = ref<Kudo[]>([])
const cursor = ref<string | null>(null)
const categorias = ref<Map<number, string>>(new Map())
const cargando = ref(false)
const error = ref<unknown>(null)

async function cargar(reiniciar: boolean) {
  cargando.value = true
  error.value = null
  try {
    if (categorias.value.size === 0) {
      const lista: Categoria[] = await sesion.api.categorias()
      categorias.value = new Map(lista.map((c) => [c.id, c.nombre]))
    }
    const pagina = await sesion.api.feed(reiniciar ? null : cursor.value)
    kudos.value = reiniciar ? pagina.elementos : [...kudos.value, ...pagina.elementos]
    cursor.value = pagina.siguienteCursor
  } catch (e) {
    error.value = e
  } finally {
    cargando.value = false
  }
}

const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

onMounted(() => cargar(true))
defineExpose({ recargar: () => cargar(true) })
</script>

<template>
  <section class="feed">
    <div class="cabeza">
      <h2>Feed</h2>
      <button type="button" class="secundario" :disabled="cargando" @click="cargar(true)">Recargar</button>
    </div>
    <AvisoDeError v-if="error" :error="error" />
    <p v-if="!cargando && !error && kudos.length === 0" class="vacio">Aún no hay Kudos. Publica el primero.</p>
    <article v-for="k in kudos" :key="k.id" class="kudo">
      <header>
        <strong>{{ sesion.nombreDe(k.autorId) }}</strong> → <strong>{{ sesion.nombreDe(k.destinatarioId) }}</strong>
        <span class="categoria">{{ categorias.get(k.categoriaId) ?? `Categoría ${k.categoriaId}` }}</span>
      </header>
      <p>{{ k.contenido }}</p>
      <ul v-if="k.adjuntos.length" class="adjuntos">
        <li v-for="a in k.adjuntos" :key="a.id">
          <a :href="a.enlace" target="_blank" rel="noopener">Ver adjunto ({{ a.tipo }}, {{ Math.ceil(a.tamano / 1024) }} KB)</a>
        </li>
      </ul>
      <time :datetime="k.fecha">{{ formatoFecha.format(new Date(k.fecha)) }}</time>
    </article>
    <button v-if="cursor" type="button" class="secundario" :disabled="cargando" @click="cargar(false)">
      {{ cargando ? 'Cargando…' : 'Cargar más' }}
    </button>
  </section>
</template>

<style scoped>
.feed { display: grid; gap: 10px; }
.cabeza { display: flex; justify-content: space-between; align-items: center; }
h2 { margin: 0; font-size: 1.25rem; }
.kudo { border: 1px solid var(--linea); border-radius: 12px; padding: 12px; background: var(--panel); display: grid; gap: 4px; }
.kudo p { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.categoria { margin-left: 6px; font-size: .8rem; padding: 2px 8px; border-radius: 999px; background: var(--acento-suave); }
time { color: var(--suave); font-size: .8rem; }
.adjuntos { margin: 0; padding-left: 18px; }
.vacio { color: var(--suave); }
.secundario { font: inherit; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--linea); background: var(--panel); color: var(--tinta); cursor: pointer; }
</style>
