'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function RedefinirSenhaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!token) {
      setErro('Token invalido. Solicite um novo link.')
    }
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (novaSenha !== confirmar) {
      setErro('As senhas nao coincidem')
      return
    }

    setLoading(true)
    setErro('')

    try {
      const res = await fetch('/api/auth/redefinir-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha })
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.error || 'Erro ao redefinir senha')
        return
      }

      setSucesso(true)
      setTimeout(() => router.push('/dashboard/login'), 3000)
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
            Nova senha
          </h1>
          <p style={{ color: '#a7adb4', fontSize: '14px', margin: 0 }}>
            Escolha uma senha forte para o seu painel
          </p>
        </div>

        <div style={{
          background: '#202327',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #2a2d32'
        }}>
          {sucesso ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>OK</div>
              <h2 style={{ color: '#fff', fontSize: '18px', margin: '0 0 12px' }}>
                Senha redefinida!
              </h2>
              <p style={{ color: '#a7adb4', fontSize: '14px', margin: '0 0 24px' }}>
                Redirecionando para o login...
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
                Ir para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#a7adb4', fontSize: '13px', marginBottom: '8px' }}>
                  Nova senha
                </label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimo 8 caracteres"
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
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                  required
                  placeholder="Repita a senha"
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
                disabled={loading || !token}
                style={{
                  width: '100%',
                  background: (loading || !token) ? '#8a6d35' : '#c9a24b',
                  color: '#121315',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: (loading || !token) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Salvando...' : 'Salvar nova senha'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'#121315'}} />}>
      <RedefinirSenhaForm />
    </Suspense>
  )
}
