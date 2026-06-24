'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : authError.message)
        return
      }

      if (data.session) {
        // Salvar token no cookie para o middleware
        document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in}; SameSite=Lax`
        router.push('/admin')
        router.refresh()
      }
    } catch {
      setError('Erro ao conectar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#121315] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-[#f4f4f4] tracking-tight">
            STIVENALLAN
          </h1>
          <p className="text-[#a7adb4] text-sm mt-1">Painel Administrativo</p>
        </div>

        {/* Card */}
        <div className="bg-[#202327] border border-[#2c3035] rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6 text-center">Entrar</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-[#a7adb4] mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-[#1a1c1f] border border-[#2c3035] rounded-xl px-4 py-3 text-[#f4f4f4] placeholder:text-[#4a5058] focus:outline-none focus:border-[#c9a24b] transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-[#a7adb4] mb-1.5">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-[#1a1c1f] border border-[#2c3035] rounded-xl px-4 py-3 text-[#f4f4f4] placeholder:text-[#4a5058] focus:outline-none focus:border-[#c9a24b] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c9a24b] text-[#1a1305] font-bold py-3.5 rounded-xl hover:bg-[#e2c275] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-[#a7adb4] text-xs text-center mt-6">
            Acesso exclusivo para Stiven Allan
          </p>
        </div>
      </div>
    </div>
  )
}
