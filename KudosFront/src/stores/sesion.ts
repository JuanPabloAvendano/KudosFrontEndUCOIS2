import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { crearCliente } from '@/api/cliente'
import { firmarTokenLocal } from '@/auth/tokenLocal'
import type { Identidad } from '@/tipos'

/** Personas de prueba para el modo local (ids fijos para poder mandarse Kudos entre ellas). */
export const IDENTIDADES: Identidad[] = [
  { oid: '0b7f1a52-4c1e-4a7e-9a10-5c3a0d2e1f01', nombre: 'Ana Restrepo', correo: 'ana.restrepo@uco.edu.co',
    telefono: '+573001112233', rol: 'ESTUDIANTE' },
  { oid: '0b7f1a52-4c1e-4a7e-9a10-5c3a0d2e1f02', nombre: 'Luis Gómez', correo: 'luis.gomez@uco.edu.co',
    rol: 'DOCENTE' },
  { oid: '0b7f1a52-4c1e-4a7e-9a10-5c3a0d2e1f03', nombre: 'Marta Ochoa', correo: 'marta.ochoa@uco.edu.co',
    telefono: '+573004445566', rol: 'COORDINADOR_PROGRAMA' },
]

/** Quién está usando la aplicación y el cliente de la API con su token. */
export const useSesion = defineStore('sesion', () => {
  const identidad = ref<Identidad>(IDENTIDADES[0]!)
  const otras = computed(() => IDENTIDADES.filter((i) => i.oid !== identidad.value.oid))

  const obtenerToken = () => {
    if (import.meta.env.VITE_MODO_AUTENTICACION !== 'local') {
      return Promise.reject(new Error('Solo está disponible el modo local; MSAL con Entra llega después'))
    }
    return firmarTokenLocal(identidad.value, import.meta.env.VITE_JWT_LOCAL_LLAVE_PRIVADA,
      import.meta.env.VITE_JWT_AUDIENCIA)
  }

  const api = crearCliente(obtenerToken)

  function nombreDe(oid: string): string {
    return IDENTIDADES.find((i) => i.oid === oid)?.nombre ?? `${oid.slice(0, 8)}…`
  }

  return { identidad, otras, api, nombreDe }
})
