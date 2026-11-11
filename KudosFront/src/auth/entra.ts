import { InteractionRequiredAuthError, PublicClientApplication, type AccountInfo } from '@azure/msal-browser'

/** Sesión iniciada con Microsoft Entra ID: la cuenta y cómo pedir el token de la API. */
export interface SesionEntra {
  cuenta: AccountInfo
  obtenerToken: () => Promise<string>
  salir: () => Promise<void>
}

export interface ConfiguracionEntra {
  autoridad: string
  cliente: string
  scope: string
  redireccion: string
}

/**
 * Inicia sesión con MSAL (código de autorización con PKCE, propio de una SPA). Si no hay cuenta, redirige a Entra y la
 * promesa no se resuelve: la página se va. El token se guarda en sessionStorage y se renueva en silencio.
 */
export async function iniciarEntra(configuracion: ConfiguracionEntra): Promise<SesionEntra> {
  const msal = new PublicClientApplication({
    auth: { clientId: configuracion.cliente, authority: configuracion.autoridad, redirectUri: configuracion.redireccion },
    cache: { cacheLocation: 'sessionStorage' },
  })
  await msal.initialize()
  const respuesta = await msal.handleRedirectPromise()
  const cuenta = respuesta?.account ?? msal.getAllAccounts()[0]
  const pedido = { scopes: [configuracion.scope] }
  if (!cuenta) {
    await msal.loginRedirect(pedido)
    return new Promise<SesionEntra>(() => {})
  }
  msal.setActiveAccount(cuenta)

  async function obtenerToken(): Promise<string> {
    try {
      return (await msal.acquireTokenSilent({ ...pedido, account: cuenta })).accessToken
    } catch (e) {
      if (e instanceof InteractionRequiredAuthError) {
        await msal.acquireTokenRedirect({ ...pedido, account: cuenta })
      }
      throw e
    }
  }

  return { cuenta, obtenerToken, salir: () => msal.logoutRedirect({ account: cuenta }) }
}

/** Id de la persona en Entra: el claim oid del token (el mismo que usa el back). */
export function idDeLaCuenta(cuenta: AccountInfo): string {
  const oid = cuenta.idTokenClaims?.oid
  return typeof oid === 'string' ? oid : cuenta.localAccountId
}
