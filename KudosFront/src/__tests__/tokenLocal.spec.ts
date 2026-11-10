import { describe, expect, it } from 'vitest'
import { exportPKCS8, exportSPKI, generateKeyPair, importSPKI, jwtVerify } from 'jose'
import { firmarTokenLocal } from '@/auth/tokenLocal'

describe('token local', () => {
  it('lleva los claims que el back lee y lo valida la llave pública', async () => {
    const { privateKey, publicKey } = await generateKeyPair('RS256', { extractable: true })
    const privada = (await exportPKCS8(privateKey)).replace(/\n/g, '\\n')
    const publica = await importSPKI(await exportSPKI(publicKey), 'RS256')

    const token = await firmarTokenLocal({ oid: 'oid-1', nombre: 'Ana', correo: 'ana@uco.edu.co', rol: 'DOCENTE' },
      privada, 'api://kudos-local')
    const { payload } = await jwtVerify(token, publica, { audience: 'api://kudos-local' })

    expect(payload).toMatchObject({ oid: 'oid-1', name: 'Ana', emails: ['ana@uco.edu.co'], roles: ['DOCENTE'] })
    expect(payload.phone_number).toBeUndefined()
    expect(payload.exp).toBeGreaterThan(payload.iat ?? 0)
  })
})
