# Waitly

Monorepo npm: frontend Vite + React + TypeScript y API Hono en Cloudflare Workers.

```text
waitly/
├── frontend/     # SPA y Worker de assets estáticos
└── backend/      # Hono y servicio de waitlist
```

## Desarrollo

Requiere Node.js >= 22.12 y npm.

```sh
cd waitly
npm install
npm run dev
```

Frontend: http://127.0.0.1:5173. API: http://127.0.0.1:8787.
También puedes usar `npm run dev:frontend` o `npm run dev:backend` por separado.
El frontend usa 127.0.0.1:8787 en desarrollo. Para cambiarlo, copia
`frontend/.env.example` a `frontend/.env.local` y ajusta `VITE_API_URL`.

## API

- `GET /health`: `{ "status": "ok", "service": "waitly-api" }`.
- `POST /waitlist`: JSON `{ "email": "hola@ejemplo.com" }`.
- Éxito: HTTP 201, `{ "success": true, "mode": "mock", "id": "…" }`.
- Errores: 400 para email/JSON inválido, 413 para cuerpo > 1 KB,
  415 para contenido que no es JSON y 500 para fallo del servicio.

`ALLOWED_ORIGINS` en `backend/wrangler.jsonc` es una lista separada por comas
de orígenes completos (sin slash final). CORS permite localhost y 127.0.0.1
en el puerto 5173. CORS no reemplaza autenticación ni protección contra abuso.

## Persistencia futura con D1

`backend/src/services/waitlist.ts` define `WaitlistRepository` y `WaitlistService`.
`MockWaitlistRepository` retorna un resultado exitoso sin guardar correos.
Para D1: agrega el binding DB en Wrangler, genera tipos con `wrangler types`,
crea una migración con email único, implementa `WaitlistRepository` usando
consultas parametrizadas y proporciona el adaptador desde los bindings del request.
Las rutas y el formulario pueden conservar su contrato; cambia `mode` a `persisted`
cuando los registros sean reales. Define antes la política de duplicados y retención.

## Verificación

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

## Despliegue

1. `npm run deploy --workspace backend` publica `waitly-api` (requiere cuenta Cloudflare).
2. Configura `VITE_API_URL` en `frontend/.env.local` con la URL HTTPS de la API.
3. Agrega el origen público del frontend a `ALLOWED_ORIGINS` y vuelve a desplegar la API.
4. `npm run deploy --workspace frontend` construye y publica `waitly` como Worker de assets.

La variable Vite se integra durante build. En producción no se usa localhost
como fallback: si falta la URL, el formulario muestra que no está disponible.
`npm run dev:worker --workspace frontend` permite revisar el build con Wrangler.

## Configuración de referencia

`example-1` no estaba presente en la carpeta recibida. Se incluyó la configuración
estándar de Vite/React/TypeScript, ESLint flat config y Wrangler JSONC para assets.
Se puede reconciliar con el ejemplo cuando esté disponible.
