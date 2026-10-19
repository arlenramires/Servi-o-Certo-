import {parseMoneyToCents,formatCents} from './money.js';

export function createExtrasPanel({api,getContext,message,friendly,onChanged}) {
  const el=id=>document.getElementById(id),check=r=>{if(r.error)throw r.error;return r.data;};
  const node=(tag,value,className)=>{const n=document.createElement(tag);n.textContent=value;if(className)n.className=className;return n;};
  let serial=0,request=null;
  function reset(){++serial;request=null;el('extrasSection').hidden=true;el('extras').replaceChildren();el('extraForm').hidden=true;el('extraForm').reset();}
  async function load(nextRequest){
    const ticket=++serial,context=getContext();request=nextRequest;el('extrasSection').hidden=false;
    const extras=check(await api.from('service_extras').select('id,request_id,provider_id,description,amount_cents,status,decided_by,created_at,decided_at').eq('request_id',request.id).order('created_at',{ascending:true}))||[];
    if(ticket!==serial||context.generation!==getContext().generation||getContext().selected?.id!==request.id)return;
    const pending=extras.some(x=>x.status==='proposto');
    el('extraForm').hidden=context.profile.role!=='prestador'||request.status!=='em_andamento'||pending;
    el('extras').replaceChildren();
    if(!extras.length)el('extras').append(node('p','Nenhum serviço extra proposto.'));
    for(const extra of extras){
      const article=node('article','','service');article.dataset.extra=extra.id;
      article.append(node('h4',formatCents(extra.amount_cents)),node('p',extra.description),node('small',extra.status==='proposto'?'Aguardando decisão do cliente':extra.status==='aceito'?'Aceito pelo cliente — sem cobrança automática':'Recusado pelo cliente'));
      if(context.profile.role==='cliente'&&extra.status==='proposto'&&request.status==='em_andamento'){
        for(const [decision,label] of [['aceito','Aceitar serviço extra'],['recusado','Recusar serviço extra']]){
          const button=node('button',label,decision==='aceito'?'':'secondary');button.type='button';button.onclick=async()=>{
            article.querySelectorAll('button').forEach(b=>b.disabled=true);
            try{check(await api.rpc('decide_service_extra',{p_extra_id:extra.id,p_decision:decision}));message(decision==='aceito'?'Extra aceito e registrado. Esta ação não realizou cobrança.':'Extra recusado e registrado.');await onChanged();}
            catch(error){message(friendly(error));}finally{article.querySelectorAll('button').forEach(b=>b.disabled=false);}
          };article.append(button);
        }
      }
      el('extras').append(article);
    }
  }
  el('extraForm').onsubmit=async event=>{event.preventDefault();const context=getContext(),current=request;if(!current||context.profile?.role!=='prestador')return;el('proposeExtra').disabled=true;try{
    const amount=parseMoneyToCents(el('extraAmount').value),description=el('extraDescription').value.trim();
    if(amount===null)return message('Informe um valor positivo com até duas casas decimais.');
    if(description.length<10)return message('Descreva o serviço extra com pelo menos 10 caracteres.');
    check(await api.rpc('propose_service_extra',{p_request_id:current.id,p_amount_cents:amount,p_description:description}));el('extraForm').reset();message('Serviço extra enviado para decisão do cliente. Nenhuma cobrança foi criada.');await onChanged();
  }catch(error){message(friendly(error));}finally{el('proposeExtra').disabled=false;}};
  return {load,reset};
}
