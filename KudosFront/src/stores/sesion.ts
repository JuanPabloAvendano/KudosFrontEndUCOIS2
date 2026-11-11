import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { crearCliente } from '@/api/cliente'
import { idDeLaCuenta, iniciarEntra, type SesionEntra } from '@/auth/entra'
import { firmarTokenLocal } from '@/auth/tokenLocal'
import type { Identidad, UsuarioRegistrado } from '@/tipos'

/** Modo local: tokens firmados en el navegador con la llave de desarrollo. Si no, Entra con MSAL. */
export const MODO_LOCAL = import.meta.env.VITE_MODO_AUTENTICACION === 'local'

/** Personas de prueba para el modo local (ids fijos para poder mandarse Kudos entre ellas). */
export const IDENTIDADES: Identidad[] = [
  { oid: '0b7f1a52-4c1e-4a7e-9a10-5c3a0d2e1f01', nombre: 'Ana Restrepo', correo: 'ana.restrepo@uco.edu.co',
    telefono: '+573001112233', rol: 'ESTUDIANTE' },
  { oid: '0b7f1a52-4c1e-4a7e-9a10-5c3a0d2e1f02', nombre: 'Luis Gómez', correo: 'luis.gomez@uco.edu.co',
    rol: 'DOCENTE' },
  { oid: '0b7f1a52-4c1e-4a7e-9a10-5c3a0d2e1f03', nombre: 'Marta Ochoa', correo: 'marta.ochoa@uco.edu.co',
    telefono: '+573004445566', rol: 'COORDINADOR_PROGRAMA' },
]

const LOCALES: UsuarioRegistrado[] = IDENTIDADES.map((i) => ({ id: i.oid, nombre: i.nombre }))

/** Quién está usando la aplicación, a quién puede reconocer y el cliente de la API con su token. */
export const useSesion = defineStore('sesion', () => {
  const identidad = ref<Identidad>(IDENTIDADES[0]!)
  const entra = shallowRef<SesionEntra | null>(null)
  const registrados = ref<UsuarioRegistrado[]>([])
  const errorDeInicio = ref<unknown>(null)

  const yo = computed<UsuarioRegistrado>(() => entra.value
    ? { id: idDeLaCuenta(entra.value.cuenta), nombre: entra.value.cuenta.name ?? entra.value.cuenta.username }
    : { id: identidad.value.oid, nombre: identidad.value.nombre })
  const usuarios = computed(() => (MODO_LOCAL ? LOCALES : registrados.value))
  const otras = computed(() => usuarios.value.filter((u) => u.id !== yo.value.id))

  const obtenerToken = () => {
    if (entra.value) {
      return entra.value.obtenerToken()
    }
    if (MODO_LOCAL) {
      return firmarTokenLocal(identidad.value, import.meta.env.VITE_JWT_LOCAL_LLAVE_PRIVADA,
        import.meta.env.VITE_JWT_AUDIENCIA)
    }
    return Promise.reject(new Error('La sesión con Entra no está iniciada'))
  }

  const api = crearCliente(obtenerToken, import.meta.env.VITE_API_URL || '/api')

  /** Inicia sesión con Entra (si no es modo local) y carga a las personas registradas. */
  async function iniciar() {
    try {
      if (!MODO_LOCAL) {
        entra.value = await iniciarEntra({
          autoridad: import.meta.env.VITE_ENTRA_AUTORIDAD,
          cliente: import.meta.env.VITE_ENTRA_CLIENTE,
          scope: import.meta.env.VITE_ENTRA_SCOPE,
          redireccion: import.meta.env.VITE_ENTRA_REDIRECCION,
        })
        await cargarUsuarios()
      }
    } catch (e) {
      errorDeInicio.value = e
    }
  }

  async function cargarUsuarios() {
    if (!MODO_LOCAL) {
      registrados.value = await api.usuarios()
    }
  }

  function nombreDe(id: string): string {
    return usuarios.value.find((u) => u.id === id)?.nombre ?? `${id.slice(0, 8)}…`
  }

  const salir = () => entra.value?.salir()

  return { identidad, yo, otras, api, errorDeInicio, iniciar, cargarUsuarios, nombreDe, salir }
})
