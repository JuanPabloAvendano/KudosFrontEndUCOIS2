import { afterEach, describe, expect, it, vi } from 'vitest'
import { escucharAvisos, leerAviso, type Aviso } from '@/push/avisos'

/** Socket falso: guarda los manejadores para disparar abrir, mensaje y cierre desde la prueba. */
class SocketFalso {
  onopen: (() => void) | null = null
  onmessage: ((evento: MessageEvent) => void) | null = null
  onclose: (() => void) | null = null
  cerrado = false
  constructor(readonly url: string) {}
  close() {
    this.cerrado = true
  }
}

describe('avisos push', () => {
  afterEach(() => vi.useRealTimers())

  it('arma el texto con el autor y la categoría del evento, o muestra el mensaje tal cual', () => {
    expect(leerAviso('{"autor":"Ana","categoria":"Liderazgo"}').texto).toBe('Ana te dio un Kudo de Liderazgo')
    expect(leerAviso('{"autor":"Ana"}').texto).toBe('Ana te dio un Kudo')
    expect(leerAviso('Hola').texto).toBe('Hola')
    expect(leerAviso(' ').texto).toBe('Recibiste un Kudo')
  })

  it('avisa cada mensaje y, si el canal se cae, pide otra URL y se reconecta', async () => {
    vi.useFakeTimers()
    const sockets: SocketFalso[] = []
    const avisos: Aviso[] = []
    let pedidas = 0
    const cerrar = escucharAvisos(async () => `wss://push/${++pedidas}`, (a) => avisos.push(a),
      (url) => {
        const socket = new SocketFalso(url)
        sockets.push(socket)
        return socket as unknown as WebSocket
      })
    await vi.waitFor(() => expect(sockets).toHaveLength(1))

    sockets[0]!.onmessage?.({ data: '{"autor":"Luis"}' } as MessageEvent)
    sockets[0]!.onclose?.()
    await vi.advanceTimersByTimeAsync(2_000)

    expect(avisos.map((a) => a.texto)).toEqual(['Luis te dio un Kudo'])
    expect(sockets.map((s) => s.url)).toEqual(['wss://push/1', 'wss://push/2'])
    cerrar()
    expect(sockets[1]!.cerrado).toBe(true)
  })
})
