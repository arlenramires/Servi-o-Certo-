import {parseMoneyToCents,formatCents} from './money.js';

export function createInspectionsPanel({api,getContext,message,friendly,onChanged}) {
  const el=id=>document.getElementById(id),check=r=>{if(r.error)throw r.error;return r.data;};
  const node=(tag,value,className)=>{const n=document.createElement(tag);n.textContent=value;if(className)n.className=className;return n;};
  let serial=0,request=null;
  function reset(){++serial;request=null;el('inspectionSection').hidden=true;el('inspections').replaceChildren();el('inspectionForm').hidden=true;el('inspectionForm').reset();}
  async function load(nextRequest,hasQuotes){
    const ticket=++serial,context=getContext();request=nextRequest;el('inspectionSection').hidden=false;
    const rows=check(await api.from('service_inspections').select('id,request_id,provider_id,purpose,scheduled_for,fee_cents,status,decided_by,created_at,decided_at').eq('request_id',request.id).order('created_at',{ascending:true}))||[];
    if(ticket!==serial||context.generation!==getContext().generation||getContext().selected?.id!==request.id)return;
    const inspection=rows[0]||null;
    el('inspectionForm').hidden=!!inspection||hasQuotes||context.profile.role!=='prestador'||request.status!=='aceito';
    el('inspections').replaceChildren();
    if(!inspection){el('inspections').append(node('p',hasQuotes?'O orçamento já foi iniciado; não há vistoria prévia registrada.':'Nenhuma vistoria prévia proposta.'));return;}
    const article=node('article','','service');article.dataset.inspection=inspection.id;
    article.append(node('h4',formatCents(inspection.fee_cents)),node('p',inspection.purpose),node('small','Data proposta: '+new Date(inspection.scheduled_for).toLocaleString('pt-BR')));
    const status=inspection.status==='proposta'?'Aguardando decisão do cliente':inspection.status==='recusada'?'Recusada pelo cliente':'Aceita pelo cliente — pagamento e confirmação ainda pendentes';
    article.append(node('small',status));
    if(context.profile.role==='cliente'&&inspection.status==='proposta'&&request.status==='aceito'){
      for(const [decision,label] of [['aceita_pendente_pagamento','Aceitar proposta de vistoria'],['recusada','Recusar proposta de vistoria']]){
        const button=node('button',label,decision==='recusada'?'secondary':'');button.type='button';button.onclick=async()=>{
          article.querySelectorAll('button').forEach(b=>b.disabled=true);
          try{check(await api.rpc('decide_service_inspection',{p_inspection_id:inspection.id,p_decision:decision}));message(decision==='recusada'?'Vistoria recusada e decisão registrada.':'Proposta aceita. A vistoria só será confirmada após integração de pagamento em sandbox.');await onChanged();}
          catch(error){message(friendly(error));}finally{article.querySelectorAll('button').forEach(b=>b.disabled=false);}
        };article.append(button);
      }
    }
    el('inspections').append(article);
  }
  el('inspectionForm').onsubmit=async event=>{event.preventDefault();const context=getContext(),current=request;if(!current||context.profile?.role!=='prestador')return;el('proposeInspection').disabled=true;try{
    const fee=parseMoneyToCents(el('inspectionFee').value),purpose=el('inspectionPurpose').value.trim(),raw=el('inspectionScheduled').value,scheduled=raw?new Date(raw):null;
    if(fee===null)return message('Informe um valor positivo com até duas casas decimais.');
    if(purpose.length<20)return message('Explique a finalidade da vistoria com pelo menos 20 caracteres.');
    if(!scheduled||Number.isNaN(scheduled.valueOf())||scheduled<=new Date())return message('Escolha uma data futura para a vistoria.');
    check(await api.rpc('propose_service_inspection',{p_request_id:current.id,p_fee_cents:fee,p_scheduled_for:scheduled.toISOString(),p_purpose:purpose}));el('inspectionForm').reset();message('Proposta de vistoria enviada. Nenhuma cobrança ou confirmação foi criada.');await onChanged();
  }catch(error){message(friendly(error));}finally{el('proposeInspection').disabled=false;}};
  return {load,reset};
}
