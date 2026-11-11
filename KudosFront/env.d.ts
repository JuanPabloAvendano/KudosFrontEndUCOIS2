/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** «local»: firma el token en el navegador con la llave de desarrollo (sin Entra). Otro valor: Entra con MSAL. */
  readonly VITE_MODO_AUTENTICACION: string
  /** Llave privada RSA de desarrollo (PKCS#8, PEM). Solo para correr en local. */
  readonly VITE_JWT_LOCAL_LLAVE_PRIVADA: string
  /** Audiencia que espera el back (KUDOS_JWT_AUDIENCIA). Solo modo local. */
  readonly VITE_JWT_AUDIENCIA: string
  /** Base de la API: la URL de API Management en producción; vacío = «/api» (proxy de Vite en local). */
  readonly VITE_API_URL?: string
  /** Autoridad de Entra: https://login.microsoftonline.com/<tenant-id>. */
  readonly VITE_ENTRA_AUTORIDAD: string
  /** Client ID de la app SPA (kudos-front). */
  readonly VITE_ENTRA_CLIENTE: string
  /** Scope delegado de la API (api://<client-id-de-kudos-api>/Kudos.Usar). */
  readonly VITE_ENTRA_SCOPE: string
  /** Redirect URI registrada en kudos-front, exactamente igual (con o sin «/» final). */
  readonly VITE_ENTRA_REDIRECCION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
