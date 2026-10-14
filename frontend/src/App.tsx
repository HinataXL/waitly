import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { joinWaitlist } from './api'

type State = { status: 'idle' | 'loading' | 'success' | 'error'; message: string }

export default function App() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>({ status: 'idle', message: '' })
  const inputRef = useRef<HTMLInputElement>(null)
  const pending = useRef(false)
  const [invalid, setInvalid] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current) return
    const value = email.trim()
    if (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setInvalid(true)
      setState({ status: 'error', message: 'Escribe un correo válido, por ejemplo hola@ejemplo.com.' })
      inputRef.current?.focus()
      return
    }
    setInvalid(false)
    pending.current = true
    setState({ status: 'loading', message: 'Procesando tu registro…' })
    try {
      const result = await joinWaitlist(value)
      setState({ status: 'success', message: result.mode === 'mock'
        ? '¡Prueba completada! Tu correo fue validado. Esta demo todavía no guarda registros.'
        : '¡Ya estás en la lista! Tu registro se completó.' })
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Inténtalo de nuevo.' })
    } finally {
      pending.current = false
    }
  }

  return (
    <div className="page">
      <header className="header">
        <a className="brand" href="#inicio" aria-label="Waitly, inicio"><span className="brand-mark" aria-hidden="true">w</span>waitly<span className="brand-dot">.</span></a>
        <span className="course-label">Un proyecto para aprender <span>↗</span></span>
      </header>
      <main id="inicio">
        <section className="hero" aria-labelledby="headline">
          <div className="intro">
            <p className="eyebrow"><span aria-hidden="true" /> DEL CÓDIGO A LA NUBE</p>
            <h1 id="headline">Las grandes ideas<br />empiezan con<br /><span>un primer paso.</span></h1>
            <p className="description">El tuyo empieza aquí. Explora Cloudflare Workers con el curso de Platzi y construye algo que puedas compartir con el mundo.</p>
            <div className="course"><span className="course-icon" aria-hidden="true">↗</span><div><strong>Cloudflare Workers</strong><span>Proyecto del curso de Platzi</span></div></div>
          </div>
          <div className="signup">
            <div className="signup-top"><span>LISTA DE ESPERA</span><span className="demo-badge">DEMO</span></div>
            <h2>Tu lugar empieza aquí.</h2>
            <p>Deja tu correo y prueba el primer paso de esta experiencia.</p>
            <form onSubmit={submit} noValidate aria-busy={state.status === 'loading'}>
              <label htmlFor="email">Tu correo electrónico</label>
              <input ref={inputRef} id="email" name="email" type="email" autoComplete="email" placeholder="hola@ejemplo.com" required maxLength={254} value={email}
                disabled={state.status === 'loading'} aria-invalid={invalid} aria-describedby={invalid ? 'form-status' : 'email-help'}
                onChange={(event) => { setEmail(event.target.value); setInvalid(false); setState({ status: 'idle', message: '' }) }} />
              <button type="submit" disabled={state.status === 'loading' || state.status === 'success'}>
                {state.status === 'loading' ? <><span className="spinner" aria-hidden="true" />Registrando…</> : state.status === 'success' ? <>Prueba completada <span aria-hidden="true">✓</span></> : <>Unirme a la lista <span aria-hidden="true">→</span></>}
              </button>
              <div id="form-status" className={`status ${state.status}`} role="status" aria-live="polite" aria-atomic="true">{state.message}</div>
              <p id="email-help" className="fine-print">Modo demo: validamos tu correo, pero todavía no lo guardamos ni enviamos mensajes.</p>
            </form>
            <div className="signup-bottom"><span aria-hidden="true">✦</span> Una idea pequeña. Un gran comienzo.</div>
          </div>
        </section>
        <div className="closing"><span className="closing-line" /><p>Aprende. Construye. Lánzalo.</p><span className="closing-line" /></div>
      </main>
      <footer><span>Waitly © {new Date().getFullYear()}</span><span>Hecho para aprender, listo para crecer.</span></footer>
    </div>
  )
}
