import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  EMPREENDIMENTOS,
  getEmpreendimento,
  precoLabel,
  statusLabel,
  type Empreendimento,
} from '@/lib/empreendimentos';
import { createClient } from '@/lib/supabase/server';
import { PropertyCardImage } from '@/components/PropertyCardImage';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
import FormContato from './FormContato';
import Image from 'next/image';
import PropertyPageTemplate, { type PropertyData } from '@/components/PropertyPageTemplate';
export const dynamic = 'force-dynamic';

const SITE_URL = 'https://stivenallan.com.br';
const WHATSAPP = '5548991642332';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ construtora: string; slug: string }>;
}

export async function generateStaticParams() {
  return EMPREENDIMENTOS.map((e) => ({
    construtora: e.construtoraSlug,
    slug: e.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { construtora, slug } = await params;
  const emp = getEmpreendimento(construtora, slug);
  if (!emp) {
    try {
      const supabaseDb = await createClient();
      const { data: dbProp } = await supabaseDb
        .from('properties')
        .select('*')
        .eq('slug', slug)
        .eq('construtora_slug', construtora)
        .maybeSingle();
      if (dbProp && dbProp.oculto !== true && dbProp.ativo !== false) {
        const dTitle = dbProp.nome + ' — apartamentos em ' + dbProp.cidade + ' com financiamento direto';
        const dTitleBrand = dTitle + ' | Stiven Allan';
        const dDesc =
          dbProp.nome + (dbProp.bairro ? ' em ' + dbProp.bairro + ', ' : ' em ') +
          dbProp.cidade + '/' + dbProp.uf + '. ' + (dbProp.descricao_curta || dbProp.descricao || '');
        const dUrl = SITE_URL + '/empreendimento/' + dbProp.construtora_slug + '/' + dbProp.slug;
        return {
          title: dTitle,
          description: dDesc,
          alternates: { canonical: dUrl },
          openGraph: {
            title: dTitleBrand,
            description: dDesc,
            url: dUrl,
            siteName: 'Stiven Allan',
            locale: 'pt_BR',
            type: 'website',
            // images omitido de propósito: Next.js resolve automaticamente via
            // opengraph-image.tsx (next/og) desta rota, que já usa cover_image_url.
          },
          twitter: { card: 'summary_large_image', title: dTitleBrand, description: dDesc },
        };
      }
    } catch {
      // sem registro no banco: cai no fallback abaixo
    }
    return { title: 'Empreendimento não encontrado' };
  }
  try {
  const title = emp.nome + ' — apartamentos em ' + emp.cidade + ' com financiamento direto';
  const description =
    emp.nome + ' em ' + emp.bairro + ', ' + emp.cidade + '/' + emp.uf +
    '. ' + emp.descricao;
  const url = SITE_URL + '/empreendimento/' + emp.construtoraSlug + '/' + emp.slug;
    const titleBrand = title + ' | Stiven Allan';
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
          title: titleBrand,
      description,
      url,
      siteName: 'Stiven Allan',
      locale: 'pt_BR',
      type: 'website',
      // images omitido de propósito: Next.js resolve automaticamente via
      // opengraph-image.tsx (next/og) desta rota, que já usa emp.imagem.
    },
            twitter: { card: 'summary_large_image', title: titleBrand, description },
  };
  } catch {
  const fb = emp.nome + ' — ' + emp.cidade + ' | Stiven Allan';
  return { title: fb, openGraph: { title: fb }, twitter: { card: 'summary_large_image', title: fb } };
}
}

function waLink(emp: Empreendimento): string {
  const msg =
    'Olá, Stiven! Tenho interesse no empreendimento ' + emp.nome +
    ' (' + emp.cidade + '/' + emp.uf + '). Pode me passar mais informações?';
  return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg);
}

export default async function EmpreendimentoPage({ params }: PageProps) {
  const { construtora, slug } = await params;
  const emp = getEmpreendimento(construtora, slug);
  if (!emp) {
    // Slug sem página estática: tenta renderizar via PropertyPageTemplate lendo properties.
    try {
      const supabaseDb = await createClient();
      const { data: dbProp } = await supabaseDb
        .from('properties')
        .select('*')
        .eq('slug', slug)
        .eq('construtora_slug', construtora)
        .maybeSingle();
      if (dbProp && dbProp.oculto !== true && dbProp.ativo !== false) {
        return <PropertyPageTemplate data={dbProp as unknown as PropertyData} relacionados={false} />;
      }
    } catch {
      // tabela/coluna ausente ou erro de conexão: cai no notFound abaixo
    }
    notFound();
  }

  // Supabase: busca dados complementares (book_pdf_url, id) sem quebrar se tabela não existir
  let supabaseId: string | null = null;
  let bookPdfUrl: string | null = null;
  let coverImageUrl: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('properties')
      .select('id, book_pdf_url, cover_image_url')
      .eq('slug', slug)
      .eq('construtora_slug', construtora)
      .maybeSingle();
    if (data) {
      supabaseId = data.id ?? null;
      bookPdfUrl = data.book_pdf_url ?? null;
      coverImageUrl = data.cover_image_url ?? null;
    }
  } catch {
    // tabela ainda não existe ou erro de conexão — continua com dados locais
  }

  const cidadeSlug = emp.cidade
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-') + '-sc';
  const cidadeHref = '/lancamentos/' + cidadeSlug;
  const temFotos = (emp.imagens?.length ?? 0) > 0;
  // Hero image: prefer Supabase cover_image_url, fallback to local imagens[0]
  const heroSrc = coverImageUrl || (temFotos ? emp.imagens?.[0] : null);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Residence',
    name: emp.nome,
    description: emp.descricao,
    url: SITE_URL + '/empreendimento/' + emp.construtoraSlug + '/' + emp.slug,
    ...(heroSrc ? { image: heroSrc } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: emp.cidade,
      addressRegion: emp.uf,
      addressCountry: 'BR',
      streetAddress: emp.bairro,
    },
    ...(emp.exibirPreco && emp.precoAPartirDe
      ? {
          offers: {
            '@type': 'Offer',
            price: emp.precoAPartirDe,
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  };

  return (
    <main style={{ background: '#f5f1ea', color: '#1a1a1a', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav
        aria-label="Trilha de navegação"
        style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 0', fontSize: 14 }}
      >
        <Link href="/" style={{ color: '#8a6d3b', textDecoration: 'none' }}>Início</Link>
        <span style={{ margin: '0 8px', color: '#b9a98f' }}>›</span>
        <Link href={cidadeHref} style={{ color: '#8a6d3b', textDecoration: 'none' }}>
          Lançamentos em {emp.cidade}
        </Link>
        <span style={{ margin: '0 8px', color: '#b9a98f' }}>›</span>
        <span style={{ color: '#1a1a1a' }}>{emp.nome}</span>
      </nav>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        {heroSrc ? (
          <PropertyCardImage
            src={heroSrc}
            alt={'Foto do empreendimento ' + emp.nome + ' em ' + emp.cidade + '/' + emp.uf}
            aspectRatio="video"
            className="rounded-2xl"
            priority
          />
        ) : (
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: 16,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #e7dfd2 0%, #d8cbb6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ textAlign: 'center', color: '#8a6d3b', padding: 24 }}>
              <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{emp.nome}</p>
              <p style={{ fontSize: 14, margin: '6px 0 0', letterSpacing: 1 }}>
                Fotos em breve
              </p>
            </div>
          </div>
        )}
        {heroSrc && (emp.imagens?.length ?? 0) > 1 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 12,
              marginTop: 12,
            }}
          >
            {(emp.imagens ?? []).slice(heroSrc === emp.imagens?.[0] ? 1 : 0).map((img, i) => (
              <div
                key={i}
                style={{
                  position: 'relative',
                  aspectRatio: '4 / 3',
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: '#e7dfd2',
                }}
              >
                <Image
                  src={img}
                  alt={'Foto ' + (i + 2) + ' do empreendimento ' + emp.nome}
                  fill
                  sizes="140px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {emp.videoUrl && (
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 20px 24px' }}>
          <h2 style={{ fontSize: 22, margin: '0 0 16px' }}>Vídeo do empreendimento</h2>
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: 16,
              overflow: 'hidden',
              background: '#000',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            }}
          >
            <iframe
              src={emp.videoUrl}
              title={`Vídeo – ${emp.nome}`}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
            />
          </div>
        </section>
      )}

      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 20px 64px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 360px',
          gap: 40,
          alignItems: 'start',
        }}
      >
        <div>
          <p style={{ color: '#8a6d3b', letterSpacing: 2, fontSize: 13, textTransform: 'uppercase', margin: 0 }}>
            {emp.construtoraNome}
          </p>
          <h1 style={{ fontSize: 40, lineHeight: 1.1, margin: '8px 0 4px' }}>{emp.nome}</h1>
          <p style={{ color: '#5a5246', fontSize: 16, margin: '0 0 16px' }}>
            {emp.bairro}, {emp.cidade}/{emp.uf}
          </p>
          <p style={{ fontStyle: 'italic', color: '#3a342b', fontSize: 18, margin: '0 0 24px' }}>
            "{emp.frase}"
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: '#2a2620' }}>{emp.descricao}</p>

          <h2 style={{ fontSize: 22, margin: '32px 0 12px' }}>Diferenciais</h2>
          <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
            {(emp.diferenciais ?? []).map((d, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 16, color: '#2a2620' }}>
                <span style={{ color: '#d9803f', fontWeight: 700 }}>✓</span>
                {d}
              </li>
            ))}
          </ul>
        </div>

        <aside
          style={{
            position: 'sticky',
            top: 24,
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          }}
        >
          <p style={{ fontSize: 13, color: '#8a6d3b', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
            Financiamento direto
          </p>
          <p style={{ fontSize: 26, fontWeight: 700, margin: '6px 0 4px', color: '#1a1a1a' }}>
            {precoLabel(emp)}
          </p>
          <p style={{ fontSize: 14, color: '#5a5246', margin: '0 0 20px' }}>
            Condições negociadas direto com a construtora, sem aprovação bancária.
          </p>
          <a
            href={waLink(emp)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              textAlign: 'center',
              background: '#d9803f',
              color: '#1a1a1a',
              fontWeight: 700,
              padding: '14px 20px',
              borderRadius: 10,
              textDecoration: 'none',
              marginBottom: 16,
            }}
          >
            Tenho interesse (WhatsApp)
          </a>
          {emp.catalogoUrl && (
            <a
              href={emp.catalogoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                textAlign: 'center',
                background: 'transparent',
                color: '#8a6d3b',
                fontWeight: 600,
                padding: '12px 20px',
                borderRadius: 10,
                border: '1px solid #d8c7a8',
                textDecoration: 'none',
                margin: '12px 0 0',
              }}
            >
              ↓ Baixar catálogo (PDF)
            </a>
          )}
          {bookPdfUrl && supabaseId && (
            <div style={{ marginTop: 12 }}>
              <LeadCaptureModal
                propertyId={supabaseId}
                propertyName={emp.nome}
                bookPdfUrl={bookPdfUrl}
              />
            </div>
          )}
          <p style={{ fontSize: 13, color: '#8a6d3b', textAlign: 'center', margin: '16px 0 8px' }}>
            ou deixe seu contato
          </p>
          <FormContato empreendimento={emp.nome} propertyId={supabaseId} />
        </aside>
      </section>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 48px' }}>
        <Link href={cidadeHref} style={{ color: '#8a6d3b', textDecoration: 'none', fontSize: 15 }}>
          ← Voltar para lançamentos em {emp.cidade}
        </Link>
      </div>
    </main>
  );
}
