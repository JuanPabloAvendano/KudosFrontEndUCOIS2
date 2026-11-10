/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** «local»: firma el token en el navegador con la llave de desarrollo (sin Entra). */
  readonly VITE_MODO_AUTENTICACION: string
  /** Llave privada RSA de desarrollo (PKCS#8, PEM). Solo para correr en local. */
  readonly VITE_JWT_LOCAL_LLAVE_PRIVADA: string
  /** Audiencia que espera el back (KUDOS_JWT_AUDIENCIA). */
  readonly VITE_JWT_AUDIENCIA: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
