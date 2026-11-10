import type { Categoria, Kudo, KudoPublicado, Pagina, Problema } from '@/tipos'

/** Error de la API con el problem+json del back y el correlationId para buscarlo en el log. */
export class ErrorDeApi extends Error {
  constructor(readonly problema: Problema, readonly correlationId: string | null) {
    super(problema.detail ?? problema.title ?? `Error ${problema.status}`)
  }
}

export type ObtenerToken = () => Promise<string>

/** Convierte una respuesta fallida en un {@link Problema}, aunque el cuerpo no sea JSON (p. ej., un 403 vacío). */
export async function leerProblema(respuesta: Response): Promise<Problema> {
  const texto = await respuesta.text()
  try {
    const cuerpo = JSON.parse(texto) as Partial<Problema>
    return { ...cuerpo, status: respuesta.status }
  } catch {
    return { status: respuesta.status, title: respuesta.statusText || undefined, detail: texto || undefined }
  }
}

/** Cliente de kudos-service: cada llamada lleva el token y un X-Correlation-Id nuevo. */
export function crearCliente(obtenerToken: ObtenerToken, base = '/api') {
  async function llamar<T>(ruta: string, init: RequestInit = {}): Promise<T> {
    const correlationId = crypto.randomUUID()
    const cabeceras = new Headers(init.headers)
    cabeceras.set('Authorization', `Bearer ${await obtenerToken()}`)
    cabeceras.set('X-Correlation-Id', correlationId)
    const respuesta = await fetch(`${base}${ruta}`, { ...init, headers: cabeceras })
    if (!respuesta.ok) {
      throw new ErrorDeApi(await leerProblema(respuesta), respuesta.headers.get('X-Correlation-Id') ?? correlationId)
    }
    return (await respuesta.json()) as T
  }

  return {
    categorias: () => llamar<Categoria[]>('/categorias'),

    feed: (cursor?: string | null, tamano = 10) => {
      const parametros = new URLSearchParams({ tamano: String(tamano) })
      if (cursor) {
        parametros.set('cursor', cursor)
      }
      return llamar<Pagina<Kudo>>(`/kudos?${parametros}`)
    },

    publicar: (destinatarioId: string, categoriaId: number, contenido: string, adjunto?: File | null) => {
      const formulario = new FormData()
      formulario.set('destinatarioId', destinatarioId)
      formulario.set('categoriaId', String(categoriaId))
      formulario.set('contenido', contenido)
      if (adjunto) {
        formulario.set('adjunto', adjunto)
      }
      return llamar<KudoPublicado>('/kudos', { method: 'POST', body: formulario })
    },
  }
}

export type ClienteKudos = ReturnType<typeof crearCliente>
