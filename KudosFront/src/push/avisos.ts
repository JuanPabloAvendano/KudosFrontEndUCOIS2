/** Aviso que llega por el canal push cuando a la persona le dan un Kudo. */
export interface Aviso {
  texto: string
}

const ESPERA_INICIAL_MS = 2_000
const ESPERA_MAXIMA_MS = 60_000

/** Convierte el mensaje de la Logic App (los datos del evento KudoPublicado) en un texto para mostrar. */
export function leerAviso(datos: string): Aviso {
  try {
    const evento = JSON.parse(datos) as { autor?: unknown; categoria?: unknown }
    if (typeof evento.autor === 'string') {
      const categoria = typeof evento.categoria === 'string' ? ` de ${evento.categoria}` : ''
      return { texto: `${evento.autor} te dio un Kudo${categoria}` }
    }
  } catch {
    // No es JSON: se muestra tal cual.
  }
  return { texto: datos.trim() || 'Recibiste un Kudo' }
}

/**
 * Abre el WebSocket de Web PubSub con la URL que da el back y avisa cada mensaje. Si se cae (la URL vence o se va la
 * red), pide una URL nueva y reintenta con espera creciente. Devuelve la función para cerrar el canal.
 */
export function escucharAvisos(obtenerUrl: () => Promise<string>, alRecibir: (aviso: Aviso) => void,
  crearSocket: (url: string) => WebSocket = (url) => new WebSocket(url)): () => void {
  let cerrado = false
  let espera = ESPERA_INICIAL_MS
  let socket: WebSocket | null = null
  let temporizador: ReturnType<typeof setTimeout> | undefined

  function reintentar() {
    if (!cerrado) {
      temporizador = setTimeout(conectar, espera)
      espera = Math.min(espera * 2, ESPERA_MAXIMA_MS)
    }
  }

  async function conectar() {
    try {
      socket = crearSocket(await obtenerUrl())
    } catch {
      reintentar()
      return
    }
    socket.onopen = () => {
      espera = ESPERA_INICIAL_MS
    }
    socket.onmessage = (evento: MessageEvent) => alRecibir(leerAviso(String(evento.data)))
    socket.onclose = reintentar
  }

  void conectar()
  return () => {
    cerrado = true
    clearTimeout(temporizador)
    socket?.close()
  }
}
