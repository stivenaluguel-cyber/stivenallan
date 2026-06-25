'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.error || 'Erro ao fazer login')
        return
      }

      router.push('/dashboard')
      router.refresh()
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
        {/* Logo */}
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
            SA Imoveis
          </h1>
          <p style={{ color: '#a7adb4', fontSize: '14px', margin: 0 }}>
            Acesse seu painel de controle
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{
          background: '#202327',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #2a2d32'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#a7adb4', fontSize: '13px', marginBottom: '8px' }}>
              Email
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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#a7adb4', fontSize: '13px', marginBottom: '8px' }}>
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              placeholder="Sua senha"
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
              padding: '12px 16px',
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
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Entrando...' : 'Entrar no painel'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link
              href="/dashboard/esqueci-senha"
              style={{ color: '#c9a24b', fontSize: '13px', textDecoration: 'none' }}
            >
              Esqueci minha senha
            </Link>
          </div>
        </form>

        <p style={{ textAlign: 'center', color: '#4a5058', fontSize: '12px', marginTop: '24px' }}>
          SA Imoveis Exclusivos - Painel Restrito
        </p>
      </div>
    </div>
  )
}
