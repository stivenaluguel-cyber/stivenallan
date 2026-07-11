'use client';

import { useState } from 'react';
import { getAttribution, trackLeadEvent, sendLeadToCapi } from '@/lib/tracking';

interface Props {
  empreendimento: string;
  propertyId?: string | null;
  propertySlug?: string | null;
}

const WHATSAPP = '5548991642332';

export default function FormContato({ empreendimento, propertyId, propertySlug }: Props) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [faixaInvestimento, setFaixaInvestimento] = useState('');
  const [prazoCompra, setPrazoCompra] = useState('');
  const [entradaDisponivel, setEntradaDisponivel] = useState('');
  const [hp, setHp] = useState(''); // honeypot: usuário real nunca vê, bot preenche → server responde 400
  const [status, setStatus] = useState<'idle' | 'enviando' | 'ok' | 'erro'>('idle');

  const waLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    `Olá Stiven! Me cadastrei sobre o ${empreendimento}. Pode me enviar as condições?`
  )}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !telefone || !faixaInvestimento || !prazoCompra || !entradaDisponivel) return;
    setStatus('enviando');
    // Aba aberta ainda dentro do gesto de clique — Safari bloqueia window.open() chamado após um await
    const waTab = window.open('', '_blank');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          telefone,
          email: email || null,
          mensagem: 'Interesse no empreendimento ' + empreendimento,
          property_id: propertyId || null,
          property_slug: propertySlug || null,
          canal_preferido: 'whatsapp',
          pagina_origem: typeof window !== 'undefined' ? window.location.pathname : null,
          faixa_investimento: faixaInvestimento,
          prazo_compra: prazoCompra,
          entrada_disponivel: entradaDisponivel,
          hp_url: hp,
          ...getAttribution(),
        }),
      });
      if (!res.ok) { waTab?.close(); throw new Error('falha'); }
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, whatsapp: telefone.replace(/\D/g, ''), property_name: empreendimento, email: email || null }),
      }).catch(() => {});
      const eventId = crypto.randomUUID();
      trackLeadEvent(empreendimento, eventId);
      sendLeadToCapi({ event_id: eventId, nome, telefone, email: email || null, content_name: empreendimento });
      setStatus('ok');
      if (waTab) waTab.location.href = waLink;
      else window.open(waLink, '_blank', 'noopener,noreferrer');
    } catch {
      waTab?.close();
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

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    color: '#1a1a1a',
    appearance: 'auto',
  };

  if (status === 'ok') {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: '#2a7d4f', margin: '0 0 12px' }}>
          Recebido! Continue no WhatsApp para receber as condições.
        </p>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            background: '#1a1a1a',
            color: '#f5f1ea',
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
            boxSizing: 'border-box',
          }}
        >
          Continuar no WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Honeypot invisível: bots preenchem, humanos não veem. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: 1,
          height: 1,
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <input
          type="text"
          name="hp_url"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
        />
      </div>
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
      <select
        value={faixaInvestimento}
        onChange={(e) => setFaixaInvestimento(e.target.value)}
        required
        style={selectStyle}
        aria-label="Faixa de investimento"
      >
        <option value="" disabled>
          Faixa de investimento
        </option>
        <option value="Até R$ 600 mil">Até R$ 600 mil</option>
        <option value="R$ 600 mil a R$ 1 milhão">R$ 600 mil a R$ 1 milhão</option>
        <option value="R$ 1 a 2 milhões">R$ 1 a 2 milhões</option>
        <option value="Acima de R$ 2 milhões">Acima de R$ 2 milhões</option>
      </select>
      <select
        value={prazoCompra}
        onChange={(e) => setPrazoCompra(e.target.value)}
        required
        style={selectStyle}
        aria-label="Quando pretende comprar"
      >
        <option value="" disabled>
          Quando pretende comprar?
        </option>
        <option value="Imediato">Imediato</option>
        <option value="3 a 6 meses">3 a 6 meses</option>
        <option value="6 a 12 meses">6 a 12 meses</option>
        <option value="Apenas pesquisando">Apenas pesquisando</option>
      </select>
      <select
        value={entradaDisponivel}
        onChange={(e) => setEntradaDisponivel(e.target.value)}
        required
        style={selectStyle}
        aria-label="Entrada disponível"
      >
        <option value="" disabled>
          Entrada disponível
        </option>
        <option value="Até 20% do valor">Até 20% do valor</option>
        <option value="20% a 50%">20% a 50%</option>
        <option value="Mais de 50%">Mais de 50%</option>
        <option value="Prefiro falar no WhatsApp">Prefiro falar no WhatsApp</option>
      </select>
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
