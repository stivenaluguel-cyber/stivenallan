import Link from 'next/link'
import Image from 'next/image'

const PLACEHOLDER_PROPERTIES = [
  {
    id: '1',
    nome: 'Empreendimento Premium',
    slug: 'empreendimento-premium-criciuma-sc',
    construtora: 'Construtora Exemplo',
    bairro: 'Centro',
    cidade: 'Criciúma',
    uf: 'SC',
    status: 'lançamento',
    tipo: 'apartamento',
    dorms_min: 2,
    dorms_max: 3,
    area_min: 65,
    area_max: 95,
    preco_a_partir: 320000,
    thumb_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2',
    nome: 'Residencial Vitória',
    slug: 'residencial-vitoria-criciuma-sc',
    construtora: 'Construtora RNI',
    bairro: 'Próspera',
    cidade: 'Criciúma',
    uf: 'SC',
    status: 'em_obras',
    tipo: 'casa',
    dorms_min: 3,
    dorms_max: 3,
    area_min: 120,
    area_max: 160,
    preco_a_partir: 480000,
    thumb_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '3',
    nome: 'Grand Michel',
    slug: 'grand-michel-criciuma-sc',
    construtora: 'Construtora Sul',
    bairro: 'Michel',
    cidade: 'Criciúma',
    uf: 'SC',
    status: 'lançamento',
    tipo: 'apartamento',
    dorms_min: 2,
    dorms_max: 4,
    area_min: 78,
    area_max: 180,
    preco_a_partir: 420000,
    thumb_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
  },
]

const STATUS_LABELS: Record<string, string> = {
  lancamento: 'Lançamento',
  em_obras: 'Em Obras',
  pronto: 'Pronto',
}

const STATUS_COLORS: Record<string, string> = {
  lancamento: 'bg-[#c9a24b] text-[#1a1305]',
  em_obras: 'bg-blue-600 text-white',
  pronto: 'bg-[#1f9d55] text-white',
}

export default function FeaturedProperties() {
  return (
    <div className="grid md:grid-cols-3 gap-7">
      {PLACEHOLDER_PROPERTIES.map((emp) => (
        <Link
          key={emp.id}
          href={'/empreendimento/' + emp.construtora.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '') + '/' + emp.slug}
          className="bg-[#202327] border border-[#2c3035] rounded-2xl overflow-hidden hover:-translate-y-1.5 hover:border-[#c9a24b] hover:shadow-xl transition-all duration-300 cursor-pointer group"
        >
          <div className="relative h-52 overflow-hidden">
            <Image
              src={emp.thumb_url}
              alt={emp.nome + ' - ' + emp.tipo + ' em ' + emp.bairro + ', ' + emp.cidade}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <span className={'absolute top-3 left-3 text-xs font-bold px-3 py-1.5 rounded-full ' + (STATUS_COLORS[emp.status] || 'bg-gray-700 text-white')}>
              {STATUS_LABELS[emp.status] || emp.status}
            </span>
          </div>
          <div className="p-5">
            <p className="text-[#a7adb4] text-xs mb-1">{emp.construtora}</p>
            <h3 className="font-bold text-lg mb-1 group-hover:text-[#c9a24b] transition-colors">{emp.nome}</h3>
            <p className="text-[#a7adb4] text-sm mb-4">{emp.bairro}, {emp.cidade}</p>
            <div className="flex gap-4 text-sm text-[#a7adb4] border-t border-[#2c3035] pt-4 mb-4">
              <span>{emp.dorms_min === emp.dorms_max ? emp.dorms_min : emp.dorms_min + ' a ' + emp.dorms_max} dorm.</span>
              <span>{emp.area_min === emp.area_max ? emp.area_min : emp.area_min + ' a ' + emp.area_max}m²</span>
            </div>
            <div className="text-[#e2c275] font-extrabold text-lg">
              {emp.preco_a_partir ? 'A partir de R$ ' + emp.preco_a_partir.toLocaleString('pt-BR') : 'Sob consulta'}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
