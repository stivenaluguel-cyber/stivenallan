'use client';

import { useState } from 'react';

interface Props {
  empreendimento: string;
}

export default function FormContato({ empreendimento }: Props) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'enviando' | 'ok' | 'erro'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !telefone) return;
    setStatus('enviando');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          telefone,
          email: email || null,
          mensagem: 'Interesse no empreendimento ' + empreendimento,
          canal_preferido: 'whatsapp',
          pagina_origem: typeof window !== 'undefined' ? window.location.pathname : null,
        }),
      });
      if (!res.ok) throw new Error('falha');
      setStatus('ok');
      setNome('');
      setTelefone('');
      setEmail('');
    } catch {
      setStatus('erro');
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #ddd4c5',
    background: '#faf7f1',
    fontSize: 15,
    marginBottom: 10,
    boxSizing: 'border-box',
  };

  if (status === 'ok') {
    return (
      <p style={{ fontSize: 14, color: '#2a7d4f', textAlign: 'center', margin: 0 }}>
        Recebido! Em breve o Stiven entra em contato.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Seu nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
        style={inputStyle}
        aria-label="Seu nome"
      />
      <input
        type="tel"
        placeholder="Telefone / WhatsApp"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        required
        style={inputStyle}
        aria-label="Telefone ou WhatsApp"
      />
      <input
        type="email"
        placeholder="E-mail (opcional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
        aria-label="E-mail"
      />
      <button
        type="submit"
        disabled={status === 'enviando'}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 8,
          border: 'none',
          background: '#1a1a1a',
          color: '#f5f1ea',
          fontWeight: 700,
          fontSize: 15,
          cursor: 'pointer',
          opacity: status === 'enviando' ? 0.6 : 1,
        }}
      >
        {status === 'enviando' ? 'Enviando...' : 'Quero ser contatado'}
      </button>
      {status === 'erro' && (
        <p style={{ fontSize: 13, color: '#c0392b', marginTop: 8, textAlign: 'center' }}>
          Não foi possível enviar. Tente pelo WhatsApp.
        </p>
      )}
    </form>
  );
}
