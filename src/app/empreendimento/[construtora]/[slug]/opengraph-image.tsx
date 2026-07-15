import { ImageResponse } from 'next/og';
import { EMPREENDIMENTOS, getEmpreendimento } from '@/lib/empreendimentos';
import { createClient } from '@/lib/supabase/server';

export const alt = 'Empreendimento — Stiven Allan';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ construtora: string; slug: string }>;
}) {
  const { construtora, slug } = await params;
  const emp = getEmpreendimento(construtora, slug);
  if (emp) return [{ id: 'og', size, contentType }];

  try {
    const supabase = await createClient();
    const { data: dbProp } = await supabase
      .from('properties')
      .select('id')
      .eq('slug', slug)
      .eq('construtora_slug', construtora)
      .maybeSingle();
    if (dbProp) return [{ id: 'og', size, contentType }];
  } catch {
    // sem registro: cai no fallback padrão do Next (og estático do layout)
  }
  return [];
}

export default async function Image({
  params,
}: {
  params: Promise<{ construtora: string; slug: string }>;
}) {
  const { construtora, slug } = await params;
  const emp = getEmpreendimento(construtora, slug);

  let nome = emp?.nome;
  let cidade = emp?.cidade;
  let uf = emp?.uf;
  let imagem = emp?.imagem;

  if (!emp) {
    const supabase = await createClient();
    const { data: dbProp } = await supabase
      .from('properties')
      .select('nome, cidade, uf, cover_image_url')
      .eq('slug', slug)
      .eq('construtora_slug', construtora)
      .maybeSingle();
    nome = dbProp?.nome;
    cidade = dbProp?.cidade;
    uf = dbProp?.uf;
    imagem = dbProp?.cover_image_url ?? undefined;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          backgroundColor: '#1a1a1a',
          position: 'relative',
        }}
      >
        {imagem ? (
          <img
            src={imagem}
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : null}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.35) 100%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            padding: '64px',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#E5C77B',
              fontWeight: 600,
            }}
          >
            Financiamento Direto da Construtora
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 60,
              fontWeight: 700,
              color: '#FAFAF8',
              lineHeight: 1.1,
            }}
          >
            {nome ?? 'Stiven Allan'}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              color: '#D6D6D0',
            }}
          >
            {cidade ? `${cidade}${uf ? '/' + uf : ''} — Stiven Allan` : 'Stiven Allan'}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
