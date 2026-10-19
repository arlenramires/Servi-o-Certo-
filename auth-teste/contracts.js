import {parseMoneyToCents,formatCents} from './money.js';
import {downloadAgreementReceipt} from './agreement-receipt.js';

export function createContractPanel({api,getContext,message,friendly}) {
  const el=id=>document.getElementById(id);
  const check=r=>{if(r.error)throw r.error;return r.data;};
  const node=(tag,value,className)=>{const n=document.createElement(tag);n.textContent=value;if(className)n.className=className;return n;};
  let serial=0,request=null,acceptedQuote=null,draftKey='';
  const inputValue=cents=>{const n=BigInt(cents);return String(n/100n)+','+String(n%100n).padStart(2,'0');};
  function reset() {
    ++serial;request=null;acceptedQuote=null;draftKey='';el('contractSection').hidden=true;
    el('contracts').replaceChildren();el('contractStages').replaceChildren();el('contractForm').reset();
  }
  function addStage(amount='') {
    if(el('contractStages').children.length>=20)return;
    const row=node('fieldset','','contract-stage');row.append(node('legend','Etapa do serviço'));
    for(const [key,label,max,value] of [
      ['title','Descrição da etapa',100,'Serviço completo'],['amount','Valor em reais',20,amount],['due','Condição da etapa',200,'Após conclusão']
    ]) {
      const wrapper=node('label',label),input=document.createElement('input');input.dataset.stage=key;input.required=true;input.maxLength=max;input.value=value;
      if(key==='amount')input.inputMode='decimal';else input.minLength=3;
      wrapper.append(input);row.append(wrapper);
    }
    const remove=node('button','Remover etapa','secondary');remove.type='button';remove.onclick=()=>{if(el('contractStages').children.length>1)row.remove();};row.append(remove);el('contractStages').append(row);
  }
  async function load(nextRequest,nextAcceptedQuote) {
    const ticket=++serial,context=getContext();request=nextRequest;acceptedQuote=nextAcceptedQuote;
    el('contractSection').hidden=true;
    const contracts=check(await api.from('service_contracts').select('id,request_id,quote_id,client_id,provider_id,version,document,content_hash,created_at').eq('request_id',request.id).order('version',{ascending:false}).limit(50))||[];
    contracts.sort((a,b)=>b.version-a.version);
    const decisions=contracts.length?(check(await api.from('service_contract_decisions').select('contract_id,actor_id,decision,created_at').in('contract_id',contracts.map(c=>c.id)))||[]):[];
    if(ticket!==serial||context.generation!==getContext().generation||getContext().selected?.id!==nextRequest.id)return;
    const latest=contracts[0],refused=latest&&decisions.some(d=>d.contract_id===latest.id&&d.decision==='recusado');
    el('contractSection').hidden=false;
    const canPropose=context.profile.role==='prestador'&&acceptedQuote&&(!latest||refused)&&request.status==='aceito';
    el('contractForm').hidden=!canPropose;
    if(canPropose&&draftKey!==request.id+':'+(latest?.version||0)) {
      el('contractForm').reset();el('contractStages').replaceChildren();addStage(inputValue(acceptedQuote.amount_cents));draftKey=request.id+':'+(latest?.version||0);
    }
    el('contracts').replaceChildren();
    if(!contracts.length)el('contracts').append(node('p',acceptedQuote?'O prestador pode propor o acordo com base no orçamento aceito.':'Primeiro é necessário aceitar um orçamento.'));
    for(const c of contracts) {
      const doc=c.document,own=decisions.find(d=>d.contract_id===c.id&&d.actor_id===context.user.id);
      const entries=decisions.filter(d=>d.contract_id===c.id),rejected=entries.some(d=>d.decision==='recusado');
      const article=node('article','','service');article.dataset.contract=c.id;
      article.append(node('h4','Acordo — versão '+c.version),node('p',doc.scope),node('p','Valor total: '+formatCents(doc.amount_cents)),
        node('small','Cliente: '+(doc.client.name||'Nome não informado')+' · Prestador: '+(doc.provider.name||'Nome não informado')),
        node('p','Início: '+new Date(doc.starts_at).toLocaleString('pt-BR')+'\nFim previsto: '+new Date(doc.ends_at).toLocaleString('pt-BR')),
        node('p',doc.responsibilities));
      const stages=document.createElement('ol');for(const s of doc.stages)stages.append(node('li',s.title+' — '+formatCents(s.amount_cents)+' · '+s.due_description));article.append(stages);
      for(const [id,label] of [[c.client_id,'Cliente'],[c.provider_id,'Prestador']]) {
        const receipt=entries.find(d=>d.actor_id===id);
        article.append(node('small',label+': '+(receipt?(receipt.decision==='aceito'?'aceitou':'recusou')+' em '+new Date(receipt.created_at).toLocaleString('pt-BR'):'aguardando decisão')));
      }
      const bilaterallyAccepted=[c.client_id,c.provider_id].every(id=>entries.some(d=>d.actor_id===id&&d.decision==='aceito'));
      article.append(node('p',rejected?'Esta versão foi recusada. Uma nova versão exige novos aceites.':bilaterallyAccepted?'Acordo aceito por ambas as partes. Pagamento e execução são etapas seguintes.':'Leia o acordo e registre sua decisão.','muted'));
      if(bilaterallyAccepted) {
        const receipt=node('button','Baixar comprovante do acordo','secondary');receipt.type='button';
        receipt.onclick=()=>{try{downloadAgreementReceipt(c,entries);message('Comprovante gerado. Guarde o arquivo em local seguro.');}catch(error){message(error.message);}};
        article.append(receipt,node('small','O arquivo registra a versão, o hash e os dois aceites; não comprova pagamento nem substitui assinatura certificada.'));
      }
      if(c.id===latest?.id&&!own&&!rejected&&request.status==='aceito') {
        const label=node('label','','check'),checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.setAttribute('aria-label','Li esta versão e concordo');
        label.append(checkbox,node('span','Li esta versão e concordo com escopo, valores, prazos e etapas.'));article.append(label);
        const accept=node('button','Aceitar esta versão'),refuse=node('button','Recusar esta versão','secondary');accept.type=refuse.type='button';accept.disabled=true;
        checkbox.onchange=()=>{accept.disabled=!checkbox.checked;};
        for(const [button,decision] of [[accept,'aceito'],[refuse,'recusado']])button.onclick=async()=>{
          accept.disabled=refuse.disabled=checkbox.disabled=true;
          try {
            check(await api.rpc('decide_service_contract',{p_contract_id:c.id,p_content_hash:c.content_hash,p_decision:decision}));
            if(context.generation!==getContext().generation||getContext().selected?.id!==nextRequest.id)return;
            await load(nextRequest,nextAcceptedQuote);message(decision==='aceito'?'Seu aceite desta versão foi registrado.':'Versão recusada. O prestador pode propor uma nova versão.');
          }catch(error){message(friendly(error));}
          finally{checkbox.disabled=false;accept.disabled=!checkbox.checked;refuse.disabled=false;}
        };
        article.append(accept,refuse);
      }
      el('contracts').append(article);
    }
  }
  el('addContractStage').onclick=()=>addStage();
  el('contractForm').onsubmit=async event=>{
    event.preventDefault();const context=getContext(),current=request,quote=acceptedQuote;
    if(!current||!quote||context.profile?.role!=='prestador')return;
    const stages=[];
    for(const row of el('contractStages').children) {
      const amount_cents=parseMoneyToCents(row.querySelector('[data-stage="amount"]').value);
      if(amount_cents===null)return message('Informe um valor válido em cada etapa.');
      stages.push({title:row.querySelector('[data-stage="title"]').value.trim(),amount_cents,due_description:row.querySelector('[data-stage="due"]').value.trim()});
    }
    if(stages.reduce((sum,s)=>sum+BigInt(s.amount_cents),0n)!==BigInt(quote.amount_cents))return message('A soma das etapas deve ser igual ao orçamento aceito.');
    const starts=new Date(el('contractStarts').value),ends=new Date(el('contractEnds').value);
    if(!Number.isFinite(+starts)||!Number.isFinite(+ends)||ends<=starts)return message('Confira as datas de início e fim.');
    el('proposeContract').disabled=true;
    try {
      check(await api.rpc('propose_service_contract',{p_request_id:current.id,p_starts_at:starts.toISOString(),p_ends_at:ends.toISOString(),p_responsibilities:el('contractResponsibilities').value.trim(),p_stages:stages}));
      if(context.generation!==getContext().generation||getContext().selected?.id!==current.id)return;
      draftKey='';await load(current,quote);message('Nova versão do acordo registrada. Cada parte deve ler e dar seu aceite.');
    }catch(error){message(friendly(error));}finally{el('proposeContract').disabled=false;}
  };
  return {load,reset};
}
