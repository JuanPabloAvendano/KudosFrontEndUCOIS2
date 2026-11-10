/** Contratos del back (kudos-service). */

export interface Categoria {
  id: number
  nombre: string
}

export interface Adjunto {
  id: string
  tipo: string
  tamano: number
  enlace: string
}

export interface Kudo {
  id: string
  autorId: string
  destinatarioId: string
  categoriaId: number
  contenido: string
  fecha: string
  adjuntos: Adjunto[]
}

export interface Pagina<T> {
  elementos: T[]
  siguienteCursor: string | null
}

export interface KudoPublicado {
  id: string
  fecha: string
}

/** Respuesta de error application/problem+json (RFC 9457). */
export interface Problema {
  status: number
  title?: string
  detail?: string
  codigo?: string
}

/** Rol institucional (los siete del enunciado). */
export type Rol =
  | 'ADMINISTRADOR_SISTEMA'
  | 'RECTOR'
  | 'COORDINADOR_ACADEMICO'
  | 'COORDINADOR_FACULTAD'
  | 'COORDINADOR_PROGRAMA'
  | 'DOCENTE'
  | 'ESTUDIANTE'

/** Persona de prueba con la que se firma el token local. */
export interface Identidad {
  oid: string
  nombre: string
  correo: string
  telefono?: string
  rol: Rol
}
