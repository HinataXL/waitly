export async function joinWaitlist(email: string): Promise<{ mode: 'mock' | 'persisted' }> {
  const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8787' : '')
  if (!baseUrl) throw new Error('El registro aún no está disponible. Inténtalo más tarde.')
  let response: Response
  try {
    response = await fetch(`${baseUrl.replace(/\/$/, '')}/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(10000),
    })
  } catch {
    throw new Error('No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.')
  }
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
      ? body.error : 'No pudimos procesar el registro. Inténtalo de nuevo.'
    throw new Error(message)
  }
  if (!body || typeof body !== 'object' || !('success' in body) || body.success !== true ||
      !('mode' in body) || (body.mode !== 'mock' && body.mode !== 'persisted')) {
    throw new Error('No pudimos confirmar el registro. Inténtalo de nuevo.')
  }
  return { mode: body.mode }
}
