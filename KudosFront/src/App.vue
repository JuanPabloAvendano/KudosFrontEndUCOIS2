<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import SelectorDeIdentidad from './components/SelectorDeIdentidad.vue'
import CuentaEntra from './components/CuentaEntra.vue'
import FormularioKudo from './components/FormularioKudo.vue'
import FeedDeKudos from './components/FeedDeKudos.vue'
import AvisoDeError from './components/AvisoDeError.vue'
import { MODO_LOCAL, useSesion } from './stores/sesion'
import { escucharAvisos } from './push/avisos'

const AVISO_VISIBLE_MS = 6_000

const sesion = useSesion()
const feed = ref<InstanceType<typeof FeedDeKudos> | null>(null)
const aviso = ref<string | null>(null)
const recargar = () => feed.value?.recargar()

let cerrarPush: (() => void) | undefined

onMounted(() => {
  if (!MODO_LOCAL && !sesion.errorDeInicio) {
    cerrarPush = escucharAvisos(async () => (await sesion.api.conexionPush()).url, (nuevo) => {
      aviso.value = nuevo.texto
      setTimeout(() => (aviso.value = null), AVISO_VISIBLE_MS)
      recargar()
    })
  }
})
onBeforeUnmount(() => cerrarPush?.())
</script>

<template>
  <header class="barra">
    <h1>UCO Kudos</h1>
    <SelectorDeIdentidad v-if="MODO_LOCAL" @cambio="recargar" />
    <CuentaEntra v-else />
  </header>
  <p v-if="aviso" class="aviso" role="status">🎉 {{ aviso }}</p>
  <main class="contenido">
    <AvisoDeError v-if="sesion.errorDeInicio" class="tarjeta" :error="sesion.errorDeInicio" />
    <FormularioKudo class="tarjeta" @publicado="recargar" />
    <FeedDeKudos ref="feed" />
  </main>
</template>

<style scoped>
.barra { display: grid; gap: 12px; padding: 16px; border-bottom: 1px solid var(--linea); }
h1 { margin: 0; font-size: 1.5rem; }
.aviso { position: sticky; top: 0; z-index: 1; margin: 0; padding: 12px 16px; background: var(--panel); border-bottom: 1px solid var(--linea); font-weight: 700; }
.contenido { display: grid; gap: 20px; padding: 16px; max-width: 1000px; margin: 0 auto; }
.tarjeta { border: 1px solid var(--linea); border-radius: 12px; padding: 14px; background: var(--panel); }
@media (min-width: 820px) {
  .barra { grid-template-columns: 1fr minmax(0, 360px); align-items: center; }
  .contenido { grid-template-columns: minmax(0, 340px) minmax(0, 1fr); align-items: start; }
}
</style>
