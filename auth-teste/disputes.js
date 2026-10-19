const labels={escopo:'Escopo',qualidade:'Qualidade',prazo:'Prazo',conduta:'Conduta',outro:'Outro'};

export function createDisputesPanel({api,getContext,message,friendly,onChanged}) {
  const el=id=>document.getElementById(id),check=r=>{if(r.error)throw r.error;return r.data;};
  const node=(tag,value,className)=>{const n=document.createElement(tag);n.textContent=value;if(className)n.className=className;return n;};
  let serial=0,request=null,dispute=null;
  function reset(){++serial;request=null;dispute=null;el('disputesSection').hidden=true;el('disputes').replaceChildren();for(const id of ['disputeForm','disputeResponseForm']){el(id).hidden=true;el(id).reset();}}
  async function load(nextRequest){
    const ticket=++serial,context=getContext();request=nextRequest;el('disputesSection').hidden=false;
    const rows=check(await api.from('service_disputes').select('id,request_id,opened_by,category,description,status,response_by,response_body,created_at,responded_at').eq('request_id',request.id).order('created_at',{ascending:true}))||[];
    if(ticket!==serial||context.generation!==getContext().generation||getContext().selected?.id!==request.id)return;
    dispute=rows[0]||null;el('disputeForm').hidden=!!dispute||!['em_andamento','concluido'].includes(request.status);
    el('disputeResponseForm').hidden=!dispute||dispute.status!=='aberta'||dispute.opened_by===context.user.id;
    el('disputes').replaceChildren();
    if(!dispute){el('disputes').append(node('p',request.status==='aceito'?'A contestação fica disponível após o início do serviço.':'Nenhuma contestação registrada.'));return;}
    const article=node('article','','service');article.dataset.dispute=dispute.id;
    article.append(node('h4',labels[dispute.category]||dispute.category),node('small',dispute.opened_by===context.user.id?'Aberta por você':'Aberta pela outra parte'),node('p',dispute.description));
    if(dispute.status==='respondida')article.append(node('h5','Resposta da outra parte'),node('p',dispute.response_body),node('small','Manifestação registrada; ainda não há decisão administrativa.'));
    else article.append(node('small','Aguardando manifestação da outra parte.'));
    el('disputes').append(article);
  }
  el('disputeForm').onsubmit=async event=>{event.preventDefault();const context=getContext(),current=request;if(!current||!context.user)return;el('openDispute').disabled=true;try{
    const category=el('disputeCategory').value,description=el('disputeDescription').value.trim();
    if(!category||description.length<20)return message('Descreva a contestação com pelo menos 20 caracteres.');
    check(await api.rpc('open_service_dispute',{p_request_id:current.id,p_category:category,p_description:description}));el('disputeForm').reset();message('Contestação registrada para manifestação da outra parte. Nenhuma decisão ou cobrança foi realizada.');await onChanged();
  }catch(error){message(friendly(error));}finally{el('openDispute').disabled=false;}};
  el('disputeResponseForm').onsubmit=async event=>{event.preventDefault();if(!dispute)return;el('respondDispute').disabled=true;try{
    const response=el('disputeResponse').value.trim();if(response.length<20)return message('Escreva uma resposta com pelo menos 20 caracteres.');
    check(await api.rpc('respond_service_dispute',{p_dispute_id:dispute.id,p_response:response}));el('disputeResponseForm').reset();message('Manifestação registrada. A contestação ainda depende de análise administrativa.');await onChanged();
  }catch(error){message(friendly(error));}finally{el('respondDispute').disabled=false;}};
  return {load,reset};
}
