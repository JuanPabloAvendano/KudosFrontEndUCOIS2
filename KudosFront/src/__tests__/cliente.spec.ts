import { afterEach, describe, expect, it, vi } from 'vitest'
import { crearCliente, ErrorDeApi, leerProblema } from '@/api/cliente'

describe('cliente de kudos-service', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('manda el token, un correlationId y el formulario multipart al publicar', async () => {
    const fetchFalso = vi.fn().mockResolvedValue(new Response('{"id":"k1","fecha":"2026-11-10T15:00:00Z"}', { status: 201 }))
    vi.stubGlobal('fetch', fetchFalso)

    const respuesta = await crearCliente(async () => 'token-1').publicar('dest', 3, 'Gracias', null)

    expect(respuesta.id).toBe('k1')
    const [url, init] = fetchFalso.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/kudos')
    expect(init.method).toBe('POST')
    const cabeceras = new Headers(init.headers)
    expect(cabeceras.get('Authorization')).toBe('Bearer token-1')
    expect(cabeceras.get('X-Correlation-Id')).toMatch(/^[0-9a-f-]{36}$/)
    const cuerpo = init.body as FormData
    expect(cuerpo.get('destinatarioId')).toBe('dest')
    expect(cuerpo.get('categoriaId')).toBe('3')
    expect(cuerpo.has('adjunto')).toBe(false)
  })

  it('pide el feed con cursor y tamaño', async () => {
    const fetchFalso = vi.fn().mockResolvedValue(new Response('{"elementos":[],"siguienteCursor":null}'))
    vi.stubGlobal('fetch', fetchFalso)

    await crearCliente(async () => 't').feed('abc', 5)

    expect(fetchFalso.mock.calls[0]?.[0]).toBe('/api/kudos?tamano=5&cursor=abc')
  })

  it('convierte un 422 en ErrorDeApi con su código y el correlationId del back', async () => {
    const problema = '{"status":422,"title":"Regla del negocio incumplida","codigo":"AUTORRECONOCIMIENTO"}'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(problema, {
      status: 422, headers: { 'X-Correlation-Id': 'corr-9' } })))

    const error = await crearCliente(async () => 't').categorias().catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ErrorDeApi)
    expect((error as ErrorDeApi).problema.codigo).toBe('AUTORRECONOCIMIENTO')
    expect((error as ErrorDeApi).correlationId).toBe('corr-9')
  })

  it('entiende errores sin cuerpo JSON, como el 403 del gateway', async () => {
    const problema = await leerProblema(new Response('', { status: 403, statusText: 'Forbidden' }))

    expect(problema).toEqual({ status: 403, title: 'Forbidden', detail: undefined })
  })
})
