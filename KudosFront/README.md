# UCO Kudos · Front (prueba local)

Front básico en Vue 3 + TypeScript + Vite + Pinia para probar kudos-service sin Entra, API Management ni Azure.
Permite entrar como tres personas de prueba, dar un Kudo (con categoría y adjunto opcional) y ver el feed paginado.

## Cómo funciona en local
- **Gateway:** el servidor de Vite reenvía `/api` al back y le agrega la cabecera secreta, como haría API Management.
  El secreto queda en el servidor de Vite (variables sin `VITE_`), no en el navegador.
- **Token:** en modo `local` el navegador firma un JWT con una llave RSA de desarrollo y los mismos claims que manda
  Entra (`oid`, `name`, `emails`, `phone_number`, `roles`). El back confía en la llave pública por una variable de
  Spring Boot; no hay código especial en el back.
- **Sin Azure:** la auditoría falla en silencio (solo deja un aviso en el log) y el relevo se apaga. Los **adjuntos**
  necesitan Blob Storage real: sin él, publicar con archivo responde 500.

## Pasos (los haces tú)
1. Genera la llave de desarrollo (fuera del repositorio):
   ```bash
   openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out privada.pem
   openssl pkey -in privada.pem -pubout -out publica.pem
   ```
2. Ten PostgreSQL y Redis corriendo en tu máquina (por ejemplo, desde tu Docker Desktop o tu `compose.yaml`).
3. Arranca el back desde IntelliJ con estas variables de entorno (Run → Edit Configurations → Environment variables):

   | Variable | Valor local |
   |---|---|
   | `KUDOS_DB_URL` · `KUDOS_DB_USUARIO` · `KUDOS_DB_CLAVE` | los de tu PostgreSQL local |
   | `KUDOS_REDIS_HOST` · `KUDOS_REDIS_PUERTO` · `KUDOS_REDIS_CLAVE` · `KUDOS_REDIS_TLS` · `KUDOS_REDIS_TIEMPO_LIMITE` | `localhost` · `6379` · vacío · `false` · `2s` |
   | `KUDOS_JWT_ISSUER_URI` | vacío |
   | `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_PUBLICKEYLOCATION` | `file:/ruta/a/publica.pem` |
   | `KUDOS_JWT_AUDIENCIA` | `api://kudos-local` |
   | `KUDOS_GATEWAY_CABECERA` · `KUDOS_GATEWAY_SECRETO` | `X-Kudos-Gateway` · el secreto que elijas |
   | `KUDOS_CLAIM_ID` · `_NOMBRE` · `_CORREO` · `_TELEFONO` · `_ROLES` | `oid` · `name` · `emails` · `phone_number` · `roles` |
   | `KUDOS_MULTIPART_MAXIMO_ARCHIVO` · `KUDOS_MULTIPART_MAXIMO_PETICION` | `1MB` · `2MB` |
   | `KUDOS_TAMANO_MAXIMO_ADJUNTO` · `KUDOS_TIPOS_DE_ADJUNTO_PERMITIDOS` · `KUDOS_VIGENCIA_ENLACE_ADJUNTO` | `512KB` · `PNG,JPEG,GIF,PDF` · `10m` |
   | `KUDOS_TTL_DEL_FEED` · `KUDOS_TAMANO_DE_PAGINA` · `KUDOS_TAMANO_MAXIMO_DE_PAGINA` · `KUDOS_LOTE_DEL_RELEVO` | `30s` · `10` · `50` · `20` |
   | `KUDOS_RELEVO_HABILITADO` · `KUDOS_RELEVO_INTERVALO` | `false` · `5s` |
   | `KUDOS_BLOB_*`, `KUDOS_TABLA_*`, `KUDOS_EVENT_GRID_*` | cualquier URL con forma válida (no se usan sin Azure) |

4. En este proyecto copia `.env.example` como `.env.local`, pon el mismo secreto del gateway y pega la llave privada en
   `VITE_JWT_LOCAL_LLAVE_PRIVADA` en una sola línea (con `\n` en los saltos).
5. `npm install` y `npm run dev`; abre http://localhost:5173.
6. Entra primero como Luis (así existe como destinatario) y luego como Ana para mandarle un Kudo.

## Modo Entra (producción y prueba local con login real)
Con `VITE_MODO_AUTENTICACION` distinto de `local`, el front inicia sesión con Microsoft Entra ID (MSAL, código con PKCE),
pide el token con el scope `Kudos.Usar` y llama a API Management (`VITE_API_URL`), que valida el token y agrega la
cabecera del gateway. Los destinatarios salen de `GET /api/usuarios` (personas que ya entraron una vez) y los avisos en
tiempo real llegan por WebSocket con la URL de `GET /api/push/conexion` (Azure Web PubSub). Variables en `.env.example`.

## Comandos
- `npm run dev` · servidor local con el proxy al back.
- `npm run build` · revisión de tipos (`vue-tsc`) y compilación.
- `npm test` · pruebas con Vitest (cliente de la API, token local y canal push).

## Verificado (9-nov)
Con el back real, PostgreSQL 18 y Redis 8 locales y el proxy de Vite: categorías 200, feed 200, publicar 201, el Kudo
aparece en el feed, autorreconocimiento 422 con su mensaje y llamada directa sin gateway 403. `vue-tsc` y `vite build`
sin errores; 5 de 5 pruebas.
