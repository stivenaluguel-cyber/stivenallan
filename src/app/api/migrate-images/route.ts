import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const images = [
  { slug: 'monte-leone-centro-criciuma-sc', url: 'https://estilofontana.com.br/images/2025/08/28/f-ml-voo-passaro-ef-web-68b0986133a09.jpg' },
  { slug: 'lavis-residencial-centro-criciuma-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/lavis-residencial-6926d1adaa325.jpg' },
  { slug: 'aguas-de-marano-frente-mar-balneario-picarras-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/aguas-de-marano-residencial-65a583e5c68f2.jpg' },
  { slug: 'fidenza-residencial-cruzeiro-do-sul-criciuma-sc', url: 'https://estilofontana.com.br/images/2024/09/02/f-f-fachada-frontal-r05-ef-web-66d61ccec113e.jpg' },
  { slug: 'tremezzo-residencial-centro-criciuma-sc', url: 'https://lh3.googleusercontent.com/d/1zwMSHa-Ja6MGdlC2lq9fxQU7plgxHBLo' },
  { slug: 'parco-savello-santa-barbara-criciuma-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/parco-savello-residencial-6644aab323ce3.jpg' },
  { slug: 'thiene-centro-criciuma-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/thiene-residencial-64be6b2174a61.jpg' },
  { slug: 'avezzano-centro-sideropolis-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/avezzano-residencial-61a626507d294.jpg' },
  { slug: 'bellante-comerciario-criciuma-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/bellante-residencial-642b0899097e5.jpg' },
  { slug: 'bosco-del-montello-centro-criciuma-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/bosco-del-montello-residencial-613a4794e8ddd.jpg' },
  { slug: 'calalzo-di-cadore-michel-criciuma-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/calalzo-di-cadore-residencial-64a2c669b3bc6.JPG' },
  { slug: 'calliano-centro-criciuma-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/calliano-residencial-5f903109ab6a9.jpg' },
  { slug: 'campos-da-montanha-bom-jardim-da-serra-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/campos-da-montanha-residencial-6297ada80ea83.jpg' },
  { slug: 'castellano-centro-icara-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/castellano-residencial-600076ae1e9e9.jpg' },
  { slug: 'due-fratelli-centro-criciuma-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/due-fratelli-residencial-5f889c789761e.jpg' },
  { slug: 'mar-di-arienzo-centro-balneario-rincao-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-arienzo-residencial-69d2e834c59ea.jpg' },
  { slug: 'mar-di-atrani-centro-balneario-rincao-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-atrani-residencial-675c232fef052.jpg' },
  { slug: 'mar-di-licata-mar-grosso-laguna-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-licata-residencial-655b9b64e5d33.jpg' },
  { slug: 'mar-di-nizza-mar-grosso-laguna-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-di-nizza-residencial-64e74bef1ceb6.jpg' },
  { slug: 'mar-positano-centro-balneario-rincao-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/mar-positano-residencial-676db4dfc93f5.jpg' },
  { slug: 'pavia-rio-maina-criciuma-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/pavia-residencial-636b9e731f40c.jpg' },
  { slug: 'pianezze-centro-icara-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/pianezze-residencial-69b2b42d573df.JPG' },
  { slug: 'pineto-centro-criciuma-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/pineto-residencial-68249cd5dfc70.jpg' },
  { slug: 'rocca-pietore-centro-sideropolis-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/rocca-pietore-residencial-5f99ae8db7681.jpg' },
  { slug: 'villaggio-verde-residenziale-grande-prospera-criciuma-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/villaggio-verde-residenziale-646388473855e.JPG' },
  { slug: 'villammare-residencial-balneario-rincao-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/villammare-residencial-68ff86c8ba6ce.jpg' },
  { slug: 'piazza-castello-centro-icara-sc', url: 'https://estilofontana.com.br/images/empreendimento/slideshows/piazza-castello-residencial-5f8dcbdd18ee4.jpg' },
]

export async function GET() {
  const results: { slug: string; status: string; publicUrl?: string }[] = []

  for (const img of images) {
    try {
      const res = await fetch(img.url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      if (!res.ok) { results.push({ slug: img.slug, status: `fetch_error_${res.status}` }); continue }

      const buffer = await res.arrayBuffer()
      const ext = img.url.toLowerCase().includes('.jpg') || img.url.toLowerCase().includes('.jpeg') ? 'jpg' : 'jpg'
      const path = `capas/${img.slug}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('imoveis')
        .upload(path, buffer, { contentType: 'image/jpeg', upsert: true })

      if (uploadError) { results.push({ slug: img.slug, status: `upload_error: ${uploadError.message}` }); continue }

      const { data: { publicUrl } } = supabase.storage.from('imoveis').getPublicUrl(path)

      const { error: updateError } = await supabase
        .from('properties')
        .update({ cover_image_url: publicUrl })
        .eq('slug', img.slug)

      if (updateError) { results.push({ slug: img.slug, status: `db_error: ${updateError.message}`, publicUrl }); continue }

      results.push({ slug: img.slug, status: 'ok', publicUrl })
    } catch (e) {
      results.push({ slug: img.slug, status: `exception: ${String(e)}` })
    }
  }

  return NextResponse.json({ total: results.length, results })
}
