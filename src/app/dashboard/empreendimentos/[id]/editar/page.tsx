'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Diferencial { icone: string; titulo: string; descricao: string; }

interface EmpreendimentoForm {
  nome: string; construtora: string; cidade: string; bairro: string;
  endereco: string; tipo: string; status: string; descricao_curta: string;
  descricao_completa: string; imagem_principal: string; video_url: string;
  preco_a_partir: string; preco_a_partir_de: string; preco_ate: string;
  dormitorios_min: string; dormitorios_max: string; suites: string; vagas: string;
  area_privativa_m2: string; area_total_m2: string; diferenciais: Diferencial[];
}

const defaultForm: EmpreendimentoForm = {
  nome: '', construtora: '', cidade: '', bairro: '', endereco: '', tipo: 'lancamento',
  status: 'lancamento', descricao_curta: '', descricao_completa: '',
  imagem_principal: '', video_url: '', preco_a_partir: '', preco_a_partir_de: '',
  preco_ate: '', dormitorios_min: '', dormitorios_max: '', suites: '', vagas: '',
  area_privativa_m2: '', area_total_m2: '',
  diferenciais: [{ icone: '🏊', titulo: 'Piscina', descricao: '' }],
};

export default function EditarEmpreendimento() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<EmpreendimentoForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('empreendimentos');
    if (stored) {
      const list = JSON.parse(stored);
      const item = list.find((e: { id: string }) => e.id === id);
      if (item) setForm({ ...defaultForm, ...item });
    }
    setLoading(false);
  }, [id]);

  const setField = (k: keyof EmpreendimentoForm, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  const updDif = (idx: number, k: keyof Diferencial, v: string) =>
    setForm(f => {
      const d = [...f.diferenciais];
      d[idx] = { ...d[idx], [k]: v };
      return { ...f, diferenciais: d };
    });

  const addDif = () =>
    setForm(f => ({ ...f, diferenciais: [...f.diferenciais, { icone: '⭐', titulo: '', descricao: '' }] }));

  const remDif = (idx: number) =>
    setForm(f => ({ ...f, diferenciais: f.diferenciais.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    if (!form.nome.trim()) { setError('Nome do empreendimento é obrigatório.'); return; }
    setSaving(true); setError('');
    try {
      const stored = localStorage.getItem('empreendimentos');
      const list = stored ? JSON.parse(stored) : [];
      const idx = list.findIndex((e: { id: string }) => e.id === id);
      if (idx >= 0) list[idx] = { ...list[idx], ...form };
      else list.push({ ...form, id });
      localStorage.setItem('empreendimentos', JSON.stringify(list));
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/empreendimentos'), 1200);
    } catch {
      setError('Erro ao salvar. Tente novamente.');
    } finally { setSaving(false); }
  };

  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 12, padding: 24,
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 20,
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5,
  };
  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1.5px solid #e5e7eb', fontSize: 14, color: '#111827',
    background: '#f9fafb', boxSizing: 'border-box',
    outline: 'none', marginBottom: 0,
  };
  const row: React.CSSProperties = { display: 'grid', gap: 16, marginBottom: 16 };
  const h2: React.CSSProperties = {
    fontSize: 15, fontWeight: 700, marginBottom: 16, marginTop: 0, color: '#D24E22',
    paddingBottom: 8, borderBottom: '2px solid #FFF3EC',
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, textAlign: 'center', color: '#6b7280' }}>
        Carregando empreendimento...
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px 64px' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => router.push('/dashboard/empreendimentos')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D24E22', fontSize: 22, lineHeight: 1 }}
            aria-label="Voltar"
          >←</button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
              Editar Empreendimento
            </h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>
              {form.nome || 'Sem nome'}
            </p>
          </div>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#DC2626', fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#16A34A', fontSize: 14 }}>
            ✅ Salvo com sucesso! Redirecionando...
          </div>
        )}

        {/* Informações Básicas */}
        <div style={card}>
          <h2 style={h2}>📋 Informações Básicas</h2>
          <div style={{ ...row, gridTemplateColumns: '1fr 1fr' }}>
            <div><label style={lbl}>Nome do Empreendimento *</label><input style={inp} value={form.nome} onChange={e => setField('nome', e.target.value)} placeholder="Ex: Residencial Aurora" /></div>
            <div><label style={lbl}>Construtora</label><input style={inp} value={form.construtora} onChange={e => setField('construtora', e.target.value)} placeholder="Ex: MRV, Cyrela..." /></div>
          </div>
          <div style={{ ...row, gridTemplateColumns: '1fr 1fr' }}>
            <div><label style={lbl}>Cidade</label><input style={inp} value={form.cidade} onChange={e => setField('cidade', e.target.value)} placeholder="Ex: Criciúma" /></div>
            <div><label style={lbl}>Bairro</label><input style={inp} value={form.bairro} onChange={e => setField('bairro', e.target.value)} placeholder="Ex: Centro" /></div>
          </div>
          <div style={{ marginBottom: 16 }}><label style={lbl}>Endereço</label><input style={inp} value={form.endereco} onChange={e => setField('endereco', e.target.value)} placeholder="Rua, número..." /></div>
          <div style={{ ...row, gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label style={lbl}>Tipo</label>
              <select style={inp} value={form.tipo} onChange={e => setField('tipo', e.target.value)}>
                <option value="lancamento">Lançamento</option>
                <option value="em_construcao">Em Construção</option>
                <option value="pronto">Pronto para Morar</option>
                <option value="terreno">Terreno</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Status</label>
              <select style={inp} value={form.status} onChange={e => setField('status', e.target.value)}>
                <option value="lancamento">Lançamento</option>
                <option value="em_construcao">Em Construção</option>
                <option value="breve_lancamento">Breve Lançamento</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div style={card}>
          <h2 style={h2}>📝 Descrição</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Descrição Curta</label>
            <input style={inp} value={form.descricao_curta} onChange={e => setField('descricao_curta', e.target.value)} placeholder="Resumo em 1 linha..." />
          </div>
          <div>
            <label style={lbl}>Descrição Completa</label>
            <textarea rows={5} style={{ ...inp, resize: 'vertical' } as React.CSSProperties} value={form.descricao_completa} onChange={e => setField('descricao_completa', e.target.value)} placeholder="Descreva o empreendimento em detalhes..." />
          </div>
        </div>

        {/* Imagens e Vídeo */}
        <div style={card}>
          <h2 style={h2}>🖼️ Imagens e Vídeo</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>URL da Imagem Principal</label>
            <input style={inp} value={form.imagem_principal} onChange={e => setField('imagem_principal', e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label style={lbl}>URL do Vídeo (YouTube/Vimeo)</label>
            <input style={inp} value={form.video_url} onChange={e => setField('video_url', e.target.value)} placeholder="https://youtube.com/..." />
          </div>
        </div>

        {/* Tipologia */}
        <div style={card}>
          <h2 style={h2}>🏠 Tipologia</h2>
          <div style={{ ...row, gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {([['Dormitórios (mín)', 'dormitorios_min'], ['Dormitórios (máx)', 'dormitorios_max'], ['Suítes', 'suites'], ['Vagas', 'vagas']] as [string, keyof EmpreendimentoForm][]).map(([label, field]) => (
              <div key={field}>
                <label style={lbl}>{label}</label>
                <input type="number" style={inp} value={form[field] as string} onChange={e => setField(field, e.target.value)} min="0" />
              </div>
            ))}
          </div>
          <div style={{ ...row, gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {([['Área Privativa (m²)', 'area_privativa_m2'], ['Área Total (m²)', 'area_total_m2'], ['Preço a partir (R$)', 'preco_a_partir_de'], ['Preço até (R$)', 'preco_ate']] as [string, keyof EmpreendimentoForm][]).map(([label, field]) => (
              <div key={field}>
                <label style={lbl}>{label}</label>
                <input type="number" style={inp} value={form[field] as string} onChange={e => setField(field, e.target.value)} min="0" />
              </div>
            ))}
          </div>
        </div>

        {/* Diferenciais */}
        <div style={card}>
          <h2 style={h2}>⭐ Diferenciais</h2>
          {form.diferenciais.map((d, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '56px 1fr 2fr auto', gap: 8, marginBottom: 12, alignItems: 'start' }}>
              <div>
                <label style={{ ...lbl, fontSize: 11 }}>Ícone</label>
                <input style={{ ...inp, textAlign: 'center' } as React.CSSProperties} value={d.icone} onChange={e => updDif(idx, 'icone', e.target.value)} />
              </div>
              <div>
                <label style={{ ...lbl, fontSize: 11 }}>Título</label>
                <input style={inp} value={d.titulo} onChange={e => updDif(idx, 'titulo', e.target.value)} placeholder="Título" />
              </div>
              <div>
                <label style={{ ...lbl, fontSize: 11 }}>Descrição</label>
                <input style={inp} value={d.descricao} onChange={e => updDif(idx, 'descricao', e.target.value)} placeholder="Detalhe..." />
              </div>
              <div style={{ paddingTop: 20 }}>
                <button onClick={() => remDif(idx)} style={{ background: '#FEE2E2', border: 'none', borderRadius: 6, padding: '8px 12px', cursor: 'pointer', color: '#DC2626', fontSize: 14 }} aria-label="Remover diferencial">🗑️</button>
              </div>
            </div>
          ))}
          <button onClick={addDif} style={{ background: '#FFF3EC', border: '1.5px dashed #D24E22', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', color: '#D24E22', fontSize: 14, fontWeight: 600 }}>
            + Adicionar Diferencial
          </button>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={() => router.push('/dashboard/empreendimentos')}
            style={{ padding: '12px 24px', borderRadius: 8, border: '1.5px solid #D1D5DB', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '12px 28px', borderRadius: 8, border: 'none', background: saving ? '#F97316' : '#D24E22', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Salvando...' : '✓ Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
