<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { IDENTIDADES, useSesion } from '@/stores/sesion'

const emit = defineEmits<{ cambio: [] }>()
const sesion = useSesion()
const { identidad } = storeToRefs(sesion)

function elegir(evento: Event) {
  const oid = (evento.target as HTMLSelectElement).value
  identidad.value = IDENTIDADES.find((i) => i.oid === oid) ?? identidad.value
  emit('cambio')
}
</script>

<template>
  <div class="selector">
    <label for="identidad">Entrar como</label>
    <select id="identidad" :value="identidad.oid" @change="elegir">
      <option v-for="i in IDENTIDADES" :key="i.oid" :value="i.oid">{{ i.nombre }} · {{ i.rol }}</option>
    </select>
    <small>Modo local: el token se firma en este navegador con la llave de desarrollo.</small>
  </div>
</template>

<style scoped>
.selector { display: grid; gap: 4px; }
label { font-weight: 700; }
select { font: inherit; padding: 8px; border-radius: 8px; border: 1px solid var(--linea); background: var(--panel); color: var(--tinta); }
small { color: var(--suave); }
</style>
