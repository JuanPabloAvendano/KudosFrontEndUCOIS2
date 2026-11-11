<script setup lang="ts">
import { useSesion } from '@/stores/sesion'

const sesion = useSesion()
</script>

<template>
  <div class="cuenta">
    <span>Entraste como <strong>{{ sesion.yo.nombre }}</strong></span>
    <button type="button" @click="sesion.salir()">Salir</button>
  </div>
</template>

<style scoped>
.cuenta { display: flex; gap: 12px; align-items: center; justify-content: space-between; }
button { font: inherit; padding: 6px 12px; border-radius: 8px; border: 1px solid var(--linea); background: var(--panel); color: var(--tinta); }
</style>
