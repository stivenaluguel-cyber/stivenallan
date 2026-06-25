'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    try {
      const res = await fetch('/api/auth/esqueci-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (res.ok) {
        setEnviado(true)
      } else {
        const data = await res.json()
        setErro(data.error || 'Erro ao enviar email')
      }
    } catch {
      setErro('Erro de conexao. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#121315',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      padding: '16px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: '#c9a24b',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '24px', fontWeight: '800', color: '#121315'
          }}>
            SA
          </div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 0 4px' }}>
            Esqueci minha senha
          </h1>
          <p style={{ color: '#a7adb4', fontSize: '14px', margin: 0 }}>
            Enviaremos um link de redefinicao para seu email
          </p>
        </div>

        <div style={{
          background: '#202327',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #2a2d32'
        }}>
          {enviado ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                [EMAIL]
              </div>
              <h2 style={{ color: '#fff', fontSize: '18px', margin: '0 0 12px' }}>
                Email enviado!
              </h2>
              <p style={{ color: '#a7adb4', fontSize: '14px', margin: '0 0 24px' }}>
                Verifique sua caixa de entrada. O link expira em 1 hora.
              </p>
              <Link
                href="/dashboard/login"
                style={{
                  display: 'block',
                  background: '#c9a24b',
                  color: '#121315',
                  borderRadius: '10px',
                  padding: '14px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '15px'
                }}
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#a7adb4', fontSize: '13px', marginBottom: '8px' }}>
                  Email cadastrado
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  style={{
                    width: '100%',
                    background: '#121315',
                    border: '1px solid #2a2d32',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {erro && (
                <div style={{
                  background: '#3d1515',
                  border: '1px solid #7f2020',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#ff6b6b',
                  fontSize: '13px',
                  marginBottom: '16px'
                }}>
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? '#8a6d35' : '#c9a24b',
                  color: '#121315',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Enviando...' : 'Enviar link de redefinicao'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link
                  href="/dashboard/login"
                  style={{ color: '#a7adb4', fontSize: '13px', textDecoration: 'none' }}
                >
                  Voltar ao login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
