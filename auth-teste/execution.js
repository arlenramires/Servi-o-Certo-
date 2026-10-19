export function createExecutionPanel({api,getContext,message,friendly,onChanged}) {
  const el=id=>document.getElementById(id),check=r=>{if(r.error)throw r.error;return r.data;};
  const node=(tag,value,className)=>{const n=document.createElement(tag);n.textContent=value;if(className)n.className=className;return n;};
  let serial=0;
  function reset(){++serial;el('executionSection').hidden=true;el('execution').replaceChildren();el('ratingForm').hidden=true;el('ratingForm').reset();}
  async function action(rpc,request,success,args={}){
    try{check(await api.rpc(rpc,{p_request_id:request.id,...args}));message(success);await onChanged();}catch(error){message(friendly(error));}
  }
  async function load(request){
    const ticket=++serial,context=getContext();el('executionSection').hidden=false;
    const [eventsResult,ratingsResult,contractsResult]=await Promise.all([
      api.from('service_execution_events').select('actor_id,event_type,created_at').eq('request_id',request.id).order('created_at',{ascending:true}),
      api.from('service_ratings').select('reviewer_id,reviewee_id,score,comment,created_at').eq('request_id',request.id).order('created_at',{ascending:true}),
      api.from('service_contracts').select('id,version').eq('request_id',request.id).order('version',{ascending:false}).limit(1)
    ]);
    if(ticket!==serial||context.generation!==getContext().generation||getContext().selected?.id!==request.id)return;
    const events=check(eventsResult)||[],ratings=check(ratingsResult)||[],contracts=check(contractsResult)||[],latest=contracts[0];
    const decisions=latest?(check(await api.from('service_contract_decisions').select('actor_id,decision').eq('contract_id',latest.id))||[]):[];
    if(ticket!==serial)return;
    const bilateral=decisions.filter(d=>d.decision==='aceito').length===2&&!decisions.some(d=>d.decision==='recusado');
    const onWay=events.some(e=>e.event_type==='a_caminho'),arrived=events.some(e=>e.event_type==='chegou_local'),started=events.some(e=>e.event_type==='iniciado'),requested=events.some(e=>e.event_type==='conclusao_solicitada'),confirmed=events.some(e=>e.event_type==='conclusao_confirmada');
    const preStart=!bilateral?'Aguardando aceite das duas partes no acordo.':arrived?'Prestador informou que chegou ao local.':onWay?'Prestador está a caminho.':'Acordo aceito pelas duas partes. O prestador pode informar o deslocamento.';
    el('execution').replaceChildren(node('p',request.status==='aceito'?preStart:request.status==='em_andamento'?(requested?'Prestador informou a conclusão. Aguardando confirmação do cliente.':'Serviço em andamento.'):request.status==='concluido'?'Conclusão confirmada pelo cliente. Nenhum pagamento ou repasse foi marcado por esta ação.':'Execução indisponível.','notice'));
    if(context.profile.role==='prestador'&&request.status==='aceito'&&bilateral&&!onWay){const b=node('button','Estou a caminho','secondary');b.onclick=()=>action('mark_provider_arrival',request,'Deslocamento informado ao cliente.',{p_event:'a_caminho'});el('execution').append(b);}
    if(context.profile.role==='prestador'&&request.status==='aceito'&&bilateral&&onWay&&!arrived){const b=node('button','Cheguei ao local','secondary');b.onclick=()=>action('mark_provider_arrival',request,'Chegada registrada para o cliente.',{p_event:'chegou_local'});el('execution').append(b);}
    if(context.profile.role==='prestador'&&request.status==='aceito'&&bilateral&&arrived){const b=node('button','Iniciar serviço');b.onclick=()=>action('start_service',request,'Início registrado. Nenhum pagamento foi movimentado.');el('execution').append(b);}
    if(context.profile.role==='prestador'&&request.status==='em_andamento'&&started&&!requested){const b=node('button','Solicitar confirmação de conclusão');b.onclick=()=>action('request_service_completion',request,'Conclusão solicitada ao cliente.');el('execution').append(b);}
    if(context.profile.role==='cliente'&&request.status==='em_andamento'&&requested&&!confirmed){const b=node('button','Confirmar serviço concluído');b.onclick=()=>action('confirm_service_completion',request,'Conclusão confirmada. Pagamento e repasse continuam separados.');el('execution').append(b);}
    el('ratings').replaceChildren();for(const r of ratings)el('ratings').append(node('p',(r.reviewer_id===context.user.id?'Sua avaliação':'Avaliação da outra parte')+': '+r.score+'/5'+(r.comment?' — '+r.comment:'')));
    const mine=ratings.some(r=>r.reviewer_id===context.user.id);el('ratingForm').hidden=request.status!=='concluido'||mine;
  }
  el('ratingForm').onsubmit=async event=>{event.preventDefault();const context=getContext(),request=context.selected;if(!request)return;el('saveRating').disabled=true;try{
    check(await api.rpc('rate_completed_service',{p_request_id:request.id,p_score:Number(el('ratingScore').value),p_comment:el('ratingComment').value.trim()||null}));message('Avaliação registrada e protegida contra alteração.');await onChanged();
  }catch(error){message(friendly(error));}finally{el('saveRating').disabled=false;}};
  return {load,reset};
}
