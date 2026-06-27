'use client';
import { useState, useMemo } from 'react';

interface SimForm {
  valor_imovel: number; entrada: number; fgts: number;
  parcelas_qtd: number; reforcos_qtd: number; reforcos_valor: number;
  chaves_pct: number; prazo_obra_meses: number; indice: string;
  taxa_juros_am: number; cenario_repasse: boolean;
}

const TAXAS: Record<string, number> = { incc:0.5, igpm:0.4, ipca:0.35, sem:0 };
function fmt(v: number) { return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
function cor(v: number, m: number, t: number) { return t>0 ? v*Math.pow(1+t/100,m) : v; }

const def: SimForm = {
  valor_imovel:300000, entrada:60000, fgts:0, parcelas_qtd:36,
  reforcos_qtd:3, reforcos_valor:15000, chaves_pct:20,
  prazo_obra_meses:36, indice:'incc', taxa_juros_am:0, cenario_repasse:false,
};

export default function SimuladorPage() {
  const [f, setF] = useState<SimForm>(def);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);
  const sf = <K extends keyof SimForm>(k:K, v:SimForm[K]) => setF(p=>({...p,[k]:v}));

  const r = useMemo(()=>{
    const taxa = f.taxa_juros_am > 0 ? f.taxa_juros_am : TAXAS[f.indice];
    const chaves = f.valor_imovel*(f.chaves_pct/100);
    const tot_ref = f.reforcos_qtd*f.reforcos_valor;
    const parc_total = Math.max(0, f.valor_imovel-f.entrada-tot_ref-chaves);
    const parcela = f.parcelas_qtd>0 ? parc_total/f.parcelas_qtd : 0;
    const nominal = f.entrada+tot_ref+parc_total+chaves;
    const fator = f.parcelas_qtd>0 ? Math.pow(1+taxa/100,f.parcelas_qtd/2) : 1;
    const corr = f.entrada + f.reforcos_qtd*cor(f.reforcos_valor,12,taxa) + parc_total*fator + cor(chaves,f.prazo_obra_meses,taxa);
    return { chaves, tot_ref, parc_total, parcela, nominal, corr, taxa,
      pe:(f.entrada/f.valor_imovel)*100, pp:(parc_total/f.valor_imovel)*100,
      pr:(tot_ref/f.valor_imovel)*100, ok:Math.abs(nominal-f.valor_imovel)<10 };
  },[f]);

  const card:React.CSSProperties={background:'#fff',borderRadius:12,padding:24,boxShadow:'0 1px 4px rgba(0,0,0,0.07)',marginBottom:20};
  const inp:React.CSSProperties={width:'100%',padding:'9px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:14,background:'#f9fafb',boxSizing:'border-box',color:'#111827'};
  const lbl:React.CSSProperties={display:'block',fontSize:12,fontWeight:600,color:'#6b7280',marginBottom:4,textTransform:'uppercase'};
  const h2s:React.CSSProperties={fontSize:15,fontWeight:700,marginBottom:16,marginTop:0,color:'#D24E22',paddingBottom:8,borderBottom:'2px solid #FFF3EC'};

  const fluxo = useMemo(()=>{
    const taxa=f.taxa_juros_am>0?f.taxa_juros_am:TAXAS[f.indice];
    const chaves=f.valor_imovel*(f.chaves_pct/100);
    const tot_ref=f.reforcos_qtd*f.reforcos_valor;
    const parc_total=Math.max(0,f.valor_imovel-f.entrada-tot_ref-chaves);
    const parcela=f.parcelas_qtd>0?parc_total/f.parcelas_qtd:0;
    return [
      {mes:0,tipo:'entrada',desc:'Ato — Entrada/Sinal',val:f.entrada,valc:f.entrada},
      ...(f.fgts>0?[{mes:0,tipo:'fgts',desc:'FGTS (abatimento)',val:-f.fgts,valc:-f.fgts}]:[]),
      ...Array.from({length:f.reforcos_qtd},(_,i)=>({mes:(i+1)*12,tipo:'reforco',desc:'Reforço '+(i+1),val:f.reforcos_valor,valc:cor(f.reforcos_valor,(i+1)*12,taxa)})),
      {mes:1,tipo:'parcela',desc:'1ª parcela mensal',val:parcela,valc:cor(parcela,1,taxa)},
      ...(f.parcelas_qtd>2?[{mes:f.parcelas_qtd,tipo:'parcela',desc:'Última parcela',val:parcela,valc:cor(parcela,f.parcelas_qtd,taxa)}]:[]),
      {mes:f.prazo_obra_meses,tipo:'chaves',desc:'Parcela das chaves',val:chaves,valc:cor(chaves,f.prazo_obra_meses,taxa)},
    ].sort((a,b)=>a.mes-b.mes);
  },[f]);

  const TC:Record<string,string>={entrada:'#D24E22',fgts:'#16a34a',reforco:'#8b5cf6',parcela:'#3b82f6',chaves:'#f59e0b'};

  const save=()=>{
    const stored=JSON.parse(localStorage.getItem('simulacoes')||'[]');
    stored.unshift({...f,r,ts:new Date().toISOString()});
    localStorage.setItem('simulacoes',JSON.stringify(stored.slice(0,20)));
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };

  return (
    <div style={{minHeight:'100vh',background:'#f3f4f6',fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{maxWidth:900,margin:'0 auto',padding:'32px 16px 64px'}}>
        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:24,fontWeight:800,color:'#111827',margin:'0 0 4px'}}>Simulador de Financiamento Direto</h1>
          <p style={{fontSize:14,color:'#6b7280',margin:0}}>Parcelamento com a construtora — sem banco. Entrada + parcelas + reforços + chaves.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:20,alignItems:'start'}} className="sim-grid">
          <div>
            <div style={card}>
              <h2 style={h2s}>💰 Valores</h2>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
                <div><label style={lbl}>Valor do Imóvel (R$)</label><input style={inp} type="number" value={f.valor_imovel} onChange={e=>sf('valor_imovel',+e.target.value)} step={10000} /></div>
                <div><label style={lbl}>Entrada/Sinal (R$)</label><input style={inp} type="number" value={f.entrada} onChange={e=>sf('entrada',+e.target.value)} /></div>
                <div><label style={lbl}>FGTS na Entrada (R$)</label><input style={inp} type="number" value={f.fgts} onChange={e=>sf('fgts',+e.target.value)} /></div>
                <div><label style={lbl}>Parcela Chaves (%)</label><input style={inp} type="number" value={f.chaves_pct} onChange={e=>sf('chaves_pct',+e.target.value)} min={0} max={50} step={5} /></div>
              </div>
              <div style={{height:10,borderRadius:6,overflow:'hidden',display:'flex'}}>
                <div style={{width:r.pe+'%',background:'#D24E22'}} /><div style={{width:r.pp+'%',background:'#3b82f6'}} />
                <div style={{width:r.pr+'%',background:'#8b5cf6'}} /><div style={{width:f.chaves_pct+'%',background:'#f59e0b'}} />
              </div>
              <div style={{display:'flex',gap:10,marginTop:8,fontSize:11,flexWrap:'wrap'}}>
                {[['#D24E22','Entrada'],['#3b82f6','Parcelas'],['#8b5cf6','Reforços'],['#f59e0b','Chaves']].map(([c2,l])=>(
                  <span key={l} style={{display:'flex',alignItems:'center',gap:4,color:'#6b7280'}}><span style={{width:8,height:8,borderRadius:2,background:c2}}/>{l}</span>
                ))}
              </div>
            </div>
            <div style={card}>
              <h2 style={h2s}>📅 Parcelas Mensais</h2>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label style={lbl}>Qtd. Parcelas</label><input style={inp} type="number" value={f.parcelas_qtd} onChange={e=>sf('parcelas_qtd',+e.target.value)} min={1} max={240} /></div>
                <div><label style={lbl}>Parcela Mensal</label><input style={{...inp,background:'#f3f4f6',fontWeight:700}} value={fmt(r.parcela)} readOnly /></div>
              </div>
            </div>
            <div style={card}>
              <h2 style={h2s}>💫 Reforços / Intermediárias</h2>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label style={lbl}>Qtd. Reforços (anuais)</label><input style={inp} type="number" value={f.reforcos_qtd} onChange={e=>sf('reforcos_qtd',+e.target.value)} min={0} max={10} /></div>
                <div><label style={lbl}>Valor/Reforço (R$)</label><input style={inp} type="number" value={f.reforcos_valor} onChange={e=>sf('reforcos_valor',+e.target.value)} step={5000} /></div>
              </div>
            </div>
            <div style={card}>
              <h2 style={h2s}>📊 Correção e Prazo</h2>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label style={lbl}>Índice</label><select style={inp} value={f.indice} onChange={e=>sf('indice',e.target.value)}><option value="incc">INCC</option><option value="igpm">IGP-M</option><option value="ipca">IPCA</option><option value="sem">Sem correção</option></select></div>
                <div><label style={lbl}>Juros a.m. (%)</label><input style={inp} type="number" value={f.taxa_juros_am} onChange={e=>sf('taxa_juros_am',+e.target.value)} min={0} max={5} step={0.1} /></div>
                <div style={{gridColumn:'1/-1'}}><label style={lbl}>Prazo Obra (meses)</label><input style={inp} type="number" value={f.prazo_obra_meses} onChange={e=>sf('prazo_obra_meses',+e.target.value)} min={1} max={120} /></div>
              </div>
              <div style={{padding:'12px 16px',background:'#FFFBEB',border:'1px solid #FCD34D',borderRadius:8,marginTop:12}}>
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                  <input type="checkbox" checked={f.cenario_repasse} onChange={e=>sf('cenario_repasse',e.target.checked)} style={{accentColor:'#D24E22'}} />
                  <span style={{fontSize:13,fontWeight:600,color:'#92400e'}}>Quitar chaves via Caixa/FGTS na entrega — cenário opcional de repasse</span>
                </label>
                {f.cenario_repasse&&<p style={{fontSize:12,color:'#78350f',margin:'8px 0 0',lineHeight:1.5}}>⚠️ Saldo das chaves ({fmt(r.chaves)}) poderá ser quitado via FGTS/MCMV. Sujeito a análise de crédito. Não é o foco do plano direto.</p>}
              </div>
            </div>
          </div>
          <div style={{position:'sticky',top:72}}>
            <div style={{background:'#1a1a2e',color:'#fff',borderRadius:12,padding:24,borderTop:'3px solid #D24E22'}}>
              <div style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',marginBottom:16}}>Resumo · {fmt(f.valor_imovel)}</div>
              {[
                {l:'Entrada',v:f.entrada,sub:f.fgts>0?'+ '+fmt(f.fgts)+' FGTS':null,c:'#D24E22'},
                {l:'Parcela Mensal',v:r.parcela,sub:f.parcelas_qtd+'x',c:'#3b82f6'},
                {l:'Total Parcelas',v:r.parc_total,sub:null,c:'#3b82f6'},
                {l:'Reforços ('+f.reforcos_qtd+'x)',v:r.tot_ref,sub:fmt(f.reforcos_valor)+' cada',c:'#8b5cf6'},
                {l:'Parcela Chaves',v:r.chaves,sub:f.chaves_pct+'% do valor',c:'#f59e0b'},
              ].map(it=>(
                <div key={it.l} style={{borderBottom:'1px solid rgba(255,255,255,0.08)',paddingBottom:12,marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
                    <span style={{fontSize:12,color:'rgba(255,255,255,0.6)'}}>{it.l}</span>
                    <span style={{fontSize:16,fontWeight:700,color:it.c}}>{fmt(it.v)}</span>
                  </div>
                  {it.sub&&<div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:2}}>{it.sub}</div>}
                </div>
              ))}
              <div style={{borderTop:'2px solid rgba(255,255,255,0.15)',paddingTop:16,marginTop:4}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{fontSize:13,color:'rgba(255,255,255,0.7)'}}>Total nominal</span>
                  <span style={{fontSize:18,fontWeight:800,color:'#fff'}}>{fmt(r.nominal)}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>Estimativa corrigida ({f.indice})</span>
                  <span style={{fontSize:14,fontWeight:600,color:'#f59e0b'}}>{fmt(r.corr)}</span>
                </div>
                {!r.ok&&<div style={{marginTop:10,padding:'8px 10px',background:'#DC2626',borderRadius:6,fontSize:12}}>⚠️ Soma dos componentes difere do total — revise.</div>}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:16}}>
                <button onClick={()=>setShow(v=>!v)} style={{padding:'10px',borderRadius:8,border:'1px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.08)',color:'#fff',fontWeight:600,cursor:'pointer',fontSize:13}}>
                  {show?'▲ Ocultar':'▼ Ver'} Cronograma
                </button>
                <button onClick={save} style={{padding:'10px',borderRadius:8,border:'none',background:saved?'#16a34a':'#D24E22',color:'#fff',fontWeight:700,cursor:'pointer',fontSize:13}}>
                  {saved?'✅ Salvo!':'💾 Salvar Simulação'}
                </button>
              </div>
            </div>
          </div>
        </div>
        {show&&(
          <div style={card}>
            <h2 style={h2s}>📋 Cronograma</h2>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr style={{background:'#f9fafb',borderBottom:'2px solid #e5e7eb'}}>
                  {['Mês','Tipo','Descrição','Valor Nominal','Valor Corrigido'].map(h=>(
                    <th key={h} style={{padding:'10px 12px',textAlign:h.includes('Valor')?'right':'left',fontWeight:600,color:'#374151',fontSize:12}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {fluxo.map((it,i)=>(
                    <tr key={i} style={{borderBottom:'1px solid #f3f4f6'}}>
                      <td style={{padding:'9px 12px',color:'#6b7280'}}>{it.mes}</td>
                      <td style={{padding:'9px 12px'}}><span style={{display:'inline-block',padding:'2px 8px',borderRadius:999,background:TC[it.tipo]+'20',color:TC[it.tipo],fontWeight:700,fontSize:11,textTransform:'uppercase'}}>{it.tipo}</span></td>
                      <td style={{padding:'9px 12px',color:'#374151'}}>{it.desc}</td>
                      <td style={{padding:'9px 12px',textAlign:'right',fontWeight:600,color:it.val<0?'#16a34a':'#111827'}}>{fmt(Math.abs(it.val))}</td>
                      <td style={{padding:'9px 12px',textAlign:'right',color:'#6b7280'}}>{fmt(Math.abs(it.valc))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr style={{background:'#f9fafb',borderTop:'2px solid #e5e7eb',fontWeight:700}}>
                  <td colSpan={3} style={{padding:'10px 12px',color:'#374151'}}>TOTAL</td>
                  <td style={{padding:'10px 12px',textAlign:'right'}}>{fmt(r.nominal)}</td>
                  <td style={{padding:'10px 12px',textAlign:'right',color:'#f59e0b'}}>{fmt(r.corr)}</td>
                </tr></tfoot>
              </table>
            </div>
          </div>
        )}
        <style>{`@media(max-width:767px){.sim-grid{grid-template-columns:1fr!important;}}`}</style>
      </div>
    </div>
  );
}
