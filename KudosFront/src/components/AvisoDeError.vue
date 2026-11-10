<script setup lang="ts">
import { computed } from 'vue'
import { ErrorDeApi } from '@/api/cliente'

const props = defineProps<{ error: unknown }>()

/** Mensajes por código de regla del back (422) para que el miembro sepa qué corregir. */
const MENSAJES: Record<string, string> = {
  DESTINATARIO_NO_EXISTE: 'Esa persona aún no ha entrado a UCO Kudos. Pídele que entre una vez y vuelve a intentarlo.',
  AUTORRECONOCIMIENTO: 'No puedes darte un Kudo a ti mismo.',
  CONTENIDO_VACIO: 'Escribe un mensaje para tu Kudo.',
  CATEGORIA_NO_EXISTE: 'La categoría elegida no existe.',
  CATEGORIA_INACTIVA: 'La categoría elegida ya no está activa.',
  ADJUNTO_MUY_GRANDE: 'El archivo supera el tamaño permitido.',
  ADJUNTO_VACIO: 'El archivo está vacío.',
  TIPO_DE_ADJUNTO_NO_PERMITIDO: 'Ese archivo no es una imagen o un PDF válido.',
  CURSOR_INVALIDO: 'No se pudo cargar la página siguiente; recarga el feed.',
}

const detalle = computed(() => {
  const e = props.error
  if (e instanceof ErrorDeApi) {
    const { status, codigo, detail, title } = e.problema
    const texto = (codigo && MENSAJES[codigo]) ?? detail ?? title ?? 'Error desconocido'
    return { titulo: `Error ${status}${codigo ? ` · ${codigo}` : ''}`, texto, correlacion: e.correlationId }
  }
  return { titulo: 'No se pudo conectar', texto: e instanceof Error ? e.message : String(e), correlacion: null }
})
</script>

<template>
  <div class="aviso" role="alert">
    <strong>{{ detalle.titulo }}</strong>
    <p>{{ detalle.texto }}</p>
    <small v-if="detalle.correlacion">correlationId: <code>{{ detalle.correlacion }}</code></small>
  </div>
</template>

<style scoped>
.aviso { border: 1px solid var(--rojo); background: var(--rojo-suave); border-radius: 10px; padding: 10px 12px; }
.aviso p { margin: 4px 0; }
code { font-size: 12px; word-break: break-all; }
</style>
