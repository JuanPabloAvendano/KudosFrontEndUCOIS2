<script setup lang="ts">
import { ref } from 'vue'
import SelectorDeIdentidad from './components/SelectorDeIdentidad.vue'
import FormularioKudo from './components/FormularioKudo.vue'
import FeedDeKudos from './components/FeedDeKudos.vue'

const feed = ref<InstanceType<typeof FeedDeKudos> | null>(null)
const recargar = () => feed.value?.recargar()
</script>

<template>
  <header class="barra">
    <h1>UCO Kudos</h1>
    <SelectorDeIdentidad @cambio="recargar" />
  </header>
  <main class="contenido">
    <FormularioKudo class="tarjeta" @publicado="recargar" />
    <FeedDeKudos ref="feed" />
  </main>
</template>

<style scoped>
.barra { display: grid; gap: 12px; padding: 16px; border-bottom: 1px solid var(--linea); }
h1 { margin: 0; font-size: 1.5rem; }
.contenido { display: grid; gap: 20px; padding: 16px; max-width: 1000px; margin: 0 auto; }
.tarjeta { border: 1px solid var(--linea); border-radius: 12px; padding: 14px; background: var(--panel); }
@media (min-width: 820px) {
  .barra { grid-template-columns: 1fr minmax(0, 360px); align-items: center; }
  .contenido { grid-template-columns: minmax(0, 340px) minmax(0, 1fr); align-items: start; }
}
</style>
