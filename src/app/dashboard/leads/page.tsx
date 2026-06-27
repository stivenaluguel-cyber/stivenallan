'use client'
import { useState, useEffect, useCallback } from 'react'


const D = {
  bg: '#F3F2EE', surface: '#FAFAF7', ink: '#161512',
  bronze: '#D24E22', orange: '#FF6A3D', muted: '#6B655B',
  line: 'rgba(26,24,21,0.08)', green: '#22c55e', red: '#ef4444', blue: '#3b82f6',
}
const fmt = (n: number) => 'R$\u00a0' + Math.round(n).toLocaleString('pt-BR')


type Lead = {
  id: string; nome?: string; whatsapp: string; estagio_funil: string
  lead_score: number; requer_atencao: boolean; origem?: string
  orcamento_max?: number; perfil?: string; email?: string
}


const ESTAGIOS = [
  { key: 'primeiro_contato', label: 'Novo Contato', cor: '#6b7280' },
  { key: 'qualificado', label: 'Qualificado', cor: '#3b82f6' },
  { key: 'interessado', label: 'Interessado', cor: '#8b5cf6' },
  { key: 'proposta_enviada', label: 'Proposta Enviada', cor: '#f59e0b' },
  { key: 'visita_agendada', label: 'Visita Agendada', cor: '#ec4899' },
  { key: 'negociacao', label: 'Em Negociação', cor: '#D24E22' },
  { key: 'fechado', label: 'Fechado', cor: '#22c55e' },
]


const ORIGENS = ['Instagram', 'Indicacao', 'Portal', 'Anuncio', 'Evento', 'Site', 'Whatsapp', 'Outro']


function NovoLeadModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [origem, setOrigem] = useState('Instagram')
  const [orcamento, setOrcamento] = useState('')
  const [estagio, setEstagio] = useState('primeiro_contato')
  const [saving, setSaving] = useState(false)
