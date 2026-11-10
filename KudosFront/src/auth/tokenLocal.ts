import { importPKCS8, SignJWT } from 'jose'
import type { Identidad } from '@/tipos'

/**
 * Firma un JWT con los mismos claims que manda Entra External ID (oid, name, emails, phone_number, roles). Solo para
 * correr en local: el back confía en la llave pública de desarrollo.
 */
export async function firmarTokenLocal(identidad: Identidad, llavePrivadaPem: string, audiencia: string,
  minutos = 30): Promise<string> {
  const llave = await importPKCS8(llavePrivadaPem.replace(/\\n/g, '\n'), 'RS256')
  const claims: Record<string, unknown> = {
    oid: identidad.oid,
    name: identidad.nombre,
    emails: [identidad.correo],
    roles: [identidad.rol],
  }
  if (identidad.telefono) {
    claims.phone_number = identidad.telefono
  }
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setSubject(identidad.oid)
    .setAudience(audiencia)
    .setIssuedAt()
    .setExpirationTime(`${minutos}m`)
    .sign(llave)
}
