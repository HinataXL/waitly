import { describe, expect, it } from 'vitest'
import { createApp } from './index'
import { WaitlistService } from './services/waitlist'

const post = (body: unknown, origin = 'http://localhost:5173') => new Request('http://localhost/waitlist', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body),
})

describe('Waitly API', () => {
  it('reports health', async () => {
    const response = await createApp().request('/health')
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok', service: 'waitly-api' })
  })

  it('validates and trims before calling the repository', async () => {
    let saved = ''
    const app = createApp(new WaitlistService({ add: async (email) => {
      saved = email
      return { id: 'demo', email, createdAt: '2026-10-12' }
    } }))
    const response = await app.request(post({ email: ' hola@ejemplo.com ' }))
    expect(response.status).toBe(201)
    expect(saved).toBe('hola@ejemplo.com')
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173')
  })

  it.each([{}, null, { email: 123 }, { email: 'no-email' }, { email: 'a@b' }, { email: 'a'.repeat(255) + '@b.com' }])('rejects invalid input %j', async (body) => {
    expect((await createApp().request(post(body))).status).toBe(400)
  })

  it('rejects malformed JSON', async () => {
    const response = await createApp().request('/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })
    expect(response.status).toBe(400)
  })

  it('handles preflight and excludes unknown origins', async () => {
    const response = await createApp().request('/waitlist', { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'POST' } })
    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173')
    expect((await createApp().request(post({ email: 'a@b.com' }, 'https://unknown.example'))).headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('returns a recoverable error when persistence fails', async () => {
    const app = createApp(new WaitlistService({ add: async () => { throw new Error('DB unavailable') } }))
    const response = await app.request(post({ email: 'a@b.com' }))
    expect(response.status).toBe(500)
    expect(await response.json()).toMatchObject({ success: false })
  })

  it('rejects oversized requests', async () => {
    expect((await createApp().request(post({ email: 'a'.repeat(2000) }))).status).toBe(413)
  })
})
