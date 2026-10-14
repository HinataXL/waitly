import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { bodyLimit } from 'hono/body-limit'
import { MockWaitlistRepository, WaitlistService } from './services/waitlist'

type Bindings = { ALLOWED_ORIGINS?: string }

export function createApp(service = new WaitlistService(new MockWaitlistRepository())) {
  const app = new Hono<{ Bindings: Bindings }>()

  app.use('*', async (c, next) => {
    const origins = (c.env?.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173')
      .split(',').map((origin) => origin.trim()).filter(Boolean)
    return cors({
      origin: (origin) => origins.includes(origin) ? origin : '',
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      allowHeaders: ['Content-Type'],
      maxAge: 86400,
    })(c, next)
  })

  app.get('/health', (c) => c.json({ status: 'ok', service: 'waitly-api' }))

  app.use('/waitlist', bodyLimit({
    maxSize: 1024,
    onError: (c) => c.json({ success: false, error: 'El cuerpo de la solicitud es demasiado grande.' }, 413),
  }))

  app.post('/waitlist', async (c) => {
    if (!c.req.header('Content-Type')?.toLowerCase().includes('application/json')) {
      return c.json({ success: false, error: 'Envía el correo en formato JSON.' }, 415)
    }
    let body: unknown
    try {
      body = await c.req.json()
    } catch {
      return c.json({ success: false, error: 'El JSON de la solicitud no es válido.' }, 400)
    }
    const email = body && typeof body === 'object' && 'email' in body && typeof body.email === 'string'
      ? body.email.trim() : ''
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ success: false, error: 'Escribe un correo válido, por ejemplo hola@ejemplo.com.' }, 400)
    }
    const entry = await service.join(email)
    return c.json({ success: true, mode: 'mock', id: entry.id }, 201)
  })

  app.onError((_error, c) => c.json({ success: false, error: 'No pudimos procesar el registro. Inténtalo de nuevo.' }, 500))
  app.notFound((c) => c.json({ success: false, error: 'Ruta no encontrada.' }, 404))
  return app
}

export default createApp()
