'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { getAttribution, trackLeadEvent, sendLeadToCapi, trackFormStart, trackFormSubmit } from '@/lib/tracking';
import { createClient } from '@/lib/supabase/client';
import { getAnonId, getVisitas } from '@/components/VisitTracker';

interface Props {
  empreendimento: string;
  propertyId?: string | null;
  propertySlug?: string | null;
  // Redireciona o WhatsApp pra outro número (ex.: imóvel de terceiro sob
  // administração) — o lead continua indo pro dashboard normalmente.
  whatsapp?: string;
  waMessage?: string;
}

const WHATSAPP = '5548991642332';
const KEY_LEAD = 'sa_lead';

export default function FormContato({ empreendimento, propertyId, propertySlug, whatsapp, waMessage }: Props) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [faixaInvestimento, setFaixaInvestimento] = useState('');
  const [prazoCompra, setPrazoCompra] = useState('');
  const [entradaDisponivel, setEntradaDisponivel] = useState('');
  const [hp, setHp] = useState(''); // honeypot: usuário real nunca vê, bot preenche → server responde 400
  const [status, setStatus] = useState<'idle' | 'enviando' | 'ok' | 'erro'>('idle');
  const startedRef = useRef(false);
  const funilParams = { empreendimento: propertySlug || empreendimento, content_name: empreendimento, form_type: 'contact_form' as const };

  function markStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackFormStart(funilParams);
  }

  function buildWaLink() {
    const saudacao = waMessage || `Olá Stiven! Me cadastrei sobre o ${empreendimento}. Pode me enviar as condições?`;
    const detalhes = [
      nome && `Nome: ${nome}`,
      telefone && `Telefone: ${telefone}`,
      faixaInvestimento && `Faixa de investimento: ${faixaInvestimento}`,
      prazoCompra && `Quando pretende comprar: ${prazoCompra}`,
      entradaDisponivel && `Entrada disponível: ${entradaDisponivel}`,
    ].filter(Boolean);
    const texto = detalhes.length ? `${saudacao}\n\n${detalhes.join('\n')}` : saudacao;
    return `https://wa.me/${whatsapp || WHATSAPP}?text=${encodeURIComponent(texto)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !telefone || !faixaInvestimento || !prazoCompra || !entradaDisponivel) return;
    setStatus('enviando');
    let leadId: string | null = null;
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
      const json = await res.json();
      leadId = json?.id ?? null;
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, whatsapp: telefone.replace(/\D/g, ''), property_name: empreendimento, email: email || null }),
      }).catch(() => {});
      const eventId = crypto.randomUUID();
      trackLeadEvent(empreendimento, eventId, { email: email || null, telefone, nome }, { empreendimento: propertySlug || null, position: 'contact_form' });
      sendLeadToCapi({ event_id: eventId, nome, telefone, email: email || null, content_name: empreendimento });
      trackFormSubmit(funilParams);
    } catch {
      waTab?.close();
      setStatus('erro');
      return;
    }
    try {
      if (leadId) {
        localStorage.setItem(KEY_LEAD, JSON.stringify({ id: leadId, nome }));
        const supabase = createClient();
        const visitas = getVisitas();
        if (visitas.length) {
          await supabase.from('lead_eventos').insert(
            visitas.map((v) => ({ lead_id: leadId, anon_id: getAnonId(), tipo: 'visita', slug: v.slug, created_at: v.ts }))
          );
        }
        await supabase.from('lead_eventos').insert({ lead_id: leadId, anon_id: getAnonId(), tipo: 'interesse', slug: propertySlug || empreendimento });
      }
    } catch {}
    setStatus('ok');
    const link = buildWaLink();
    if (waTab) waTab.location.href = link;
    else window.open(link, '_blank', 'noopener,noreferrer');
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
          href={buildWaLink()}
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
        onFocus={markStarted}
        required
        style={inputStyle}
        aria-label="Seu nome"
      />
      <input
        type="tel"
        placeholder="Telefone / WhatsApp"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        onFocus={markStarted}
        required
        style={inputStyle}
        aria-label="Telefone ou WhatsApp"
      />
      <input
        type="email"
        placeholder="E-mail (opcional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onFocus={markStarted}
        style={inputStyle}
        aria-label="E-mail"
      />
      <select
        value={faixaInvestimento}
        onChange={(e) => setFaixaInvestimento(e.target.value)}
        onFocus={markStarted}
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
        onFocus={markStarted}
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
        onFocus={markStarted}
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
      <p style={{ fontSize: 11, color: '#a1a1aa', marginTop: 10, textAlign: 'center', lineHeight: 1.5 }}>
        Usamos seus dados só para retornar seu contato sobre {empreendimento} pelo WhatsApp ou e-mail.{' '}
        <Link href="/politica-de-privacidade" style={{ color: '#71717a', textDecoration: 'underline' }}>
          Política de Privacidade
        </Link>
        .
      </p>
    </form>
  );
}
