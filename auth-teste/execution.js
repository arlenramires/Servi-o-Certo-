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
    const [eventsResult,ratingsResult,contractsResult,etaResult,adjustmentResult,progressResult,scheduleResult]=await Promise.all([
      api.from('service_execution_events').select('actor_id,event_type,created_at').eq('request_id',request.id).order('created_at',{ascending:true}),
      api.from('service_ratings').select('reviewer_id,reviewee_id,score,comment,created_at').eq('request_id',request.id).order('created_at',{ascending:true}),
      api.from('service_contracts').select('id,version').eq('request_id',request.id).order('version',{ascending:false}).limit(1),
      api.from('provider_arrival_estimates').select('estimated_arrival_at,updated_at').eq('request_id',request.id).maybeSingle(),
      api.from('service_completion_adjustments').select('description,status,provider_response,created_at,responded_at').eq('request_id',request.id).maybeSingle(),
      api.from('service_progress_updates').select('progress_percent,note,created_at').eq('request_id',request.id).order('created_at',{ascending:true}),
      api.from('service_schedule_changes').select('id,proposed_by,proposed_for,reason,status,created_at,decided_at').eq('request_id',request.id).order('created_at',{ascending:true})
    ]);
    if(ticket!==serial||context.generation!==getContext().generation||getContext().selected?.id!==request.id)return;
    const events=check(eventsResult)||[],ratings=check(ratingsResult)||[],contracts=check(contractsResult)||[],eta=check(etaResult),adjustment=check(adjustmentResult),updates=check(progressResult)||[],scheduleChanges=check(scheduleResult)||[],latest=contracts[0];
    const decisions=latest?(check(await api.from('service_contract_decisions').select('actor_id,decision').eq('contract_id',latest.id))||[]):[];
    if(ticket!==serial)return;
    const bilateral=decisions.filter(d=>d.decision==='aceito').length===2&&!decisions.some(d=>d.decision==='recusado');
    const onWay=events.some(e=>e.event_type==='a_caminho'),arrived=events.some(e=>e.event_type==='chegou_local'),arrivalConfirmed=events.some(e=>e.event_type==='chegada_confirmada_cliente'),started=events.some(e=>e.event_type==='iniciado'),requested=events.some(e=>e.event_type==='conclusao_solicitada'),confirmed=events.some(e=>e.event_type==='conclusao_confirmada');
    const preStart=!bilateral?'Aguardando aceite das duas partes no acordo.':arrivalConfirmed?'Cliente confirmou a chegada. O prestador pode iniciar o serviço.':arrived?(context.profile.role==='cliente'?'Prestador informou que chegou. Confirme somente se ele estiver no local.':'Chegada informada. Aguardando confirmação do cliente.'):onWay?'Prestador está a caminho.':'Acordo aceito pelas duas partes. O prestador pode informar o deslocamento.';
    const progress=requested?(adjustment?.status==='pendente'?'Cliente solicitou um ajuste antes da confirmação.':adjustment?.status==='respondido'?'Prestador respondeu ao ajuste. Aguardando confirmação do cliente.':'Prestador informou a conclusão. Aguardando confirmação do cliente.'):'Serviço em andamento.';
    el('execution').replaceChildren(node('p',request.status==='aceito'?preStart:request.status==='em_andamento'?progress:request.status==='concluido'?'Conclusão confirmada pelo cliente. Nenhum pagamento ou repasse foi marcado por esta ação.':'Execução indisponível.','notice'));
    const scheduleStatus=change=>change.status==='pendente'?(change.proposed_by===context.user.id?'aguardando decisão da outra parte':'aguardando sua decisão'):change.status==='aceito'?'aceito pela outra parte':'recusado pela outra parte';
    for(const change of scheduleChanges)el('execution').append(node('p','Reagendamento '+(change.proposed_by===context.user.id?'proposto por você':'proposto pela outra parte')+' para '+new Date(change.proposed_for).toLocaleString('pt-BR')+' — '+change.reason+' ('+scheduleStatus(change)+').','notice'));
    const pendingSchedule=scheduleChanges.find(change=>change.status==='pendente');
    if(request.status==='aceito'&&!onWay){
      if(!pendingSchedule){
        const dateLabel=node('label','Nova data proposta'),date=document.createElement('input'),reasonLabel=node('label','Motivo do reagendamento'),reason=document.createElement('textarea'),button=node('button','Propor reagendamento','secondary');
        date.type='datetime-local';date.setAttribute('aria-label','Nova data proposta');reason.setAttribute('aria-label','Motivo do reagendamento');reason.maxLength=500;reason.rows=2;button.type='button';
        button.onclick=()=>{const proposed=new Date(date.value);if(!date.value||Number.isNaN(proposed.getTime())){message(friendly({code:'RA001'}));return;}action('propose_service_reschedule',request,'Reagendamento enviado para decisão do cliente.',{p_proposed_for:proposed.toISOString(),p_reason:reason.value.trim()});};
        dateLabel.append(date);reasonLabel.append(reason);el('execution').append(dateLabel,reasonLabel,button);
      }
      if(pendingSchedule&&pendingSchedule.proposed_by!==context.user.id){
        for(const [decision,label] of [['aceito','Aceitar nova data'],['recusado','Recusar nova data']]){
          const button=node('button',label,decision==='aceito'?'':'secondary');button.type='button';button.onclick=async()=>{try{check(await api.rpc('decide_service_reschedule',{p_change_id:pendingSchedule.id,p_decision:decision}));message(decision==='aceito'?'Nova data aceita e aplicada ao serviço.':'Nova data recusada. O horário anterior foi mantido.');await onChanged();}catch(error){message(friendly(error));}};el('execution').append(button);
        }
      }
    }
    for(const update of updates)el('execution').append(node('p',update.progress_percent+'% — '+update.note,'notice'));
    if(context.profile.role==='prestador'&&request.status==='aceito'&&bilateral&&!onWay&&!pendingSchedule){const b=node('button','Estou a caminho','secondary');b.onclick=()=>action('mark_provider_arrival',request,'Deslocamento informado ao cliente.',{p_event:'a_caminho'});el('execution').append(b);}
    if(request.status==='aceito'&&onWay&&!arrived){
      if(eta)el('execution').append(node('p','Previsão informada: '+new Date(eta.estimated_arrival_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+'.','notice'));
      if(context.profile.role==='prestador'){
        const label=node('label','Previsão de chegada'),select=document.createElement('select'),button=node('button',eta?'Atualizar previsão':'Informar previsão','secondary');
        select.setAttribute('aria-label','Previsão de chegada');for(const minutes of [10,20,30,45,60,90])select.add(new Option(minutes+' minutos',String(minutes)));
        button.type='button';button.onclick=()=>action('set_provider_eta',request,'Previsão de chegada atualizada para o cliente.',{p_minutes:Number(select.value)});
        label.append(select);el('execution').append(label,button);
      }
    }
    if(context.profile.role==='prestador'&&request.status==='aceito'&&bilateral&&onWay&&!arrived){const b=node('button','Cheguei ao local','secondary');b.onclick=()=>action('mark_provider_arrival',request,'Chegada registrada para o cliente.',{p_event:'chegou_local'});el('execution').append(b);}
    if(context.profile.role==='cliente'&&request.status==='aceito'&&bilateral&&arrived&&!arrivalConfirmed){const b=node('button','Confirmar chegada do prestador');b.onclick=()=>action('confirm_provider_arrival',request,'Chegada confirmada. O prestador já pode iniciar o serviço.');el('execution').append(b);}
    if(context.profile.role==='prestador'&&request.status==='aceito'&&bilateral&&arrivalConfirmed){const b=node('button','Iniciar serviço');b.onclick=()=>action('start_service',request,'Início registrado. Nenhum pagamento foi movimentado.');el('execution').append(b);}
    if(context.profile.role==='prestador'&&request.status==='em_andamento'&&started&&!requested){
      const latestProgress=updates.reduce((value,item)=>Math.max(value,item.progress_percent),0),choices=[25,50,75,90].filter(value=>value>latestProgress);
      if(choices.length){
        const percentLabel=node('label','Andamento do serviço'),select=document.createElement('select'),noteLabel=node('label','Resumo do andamento'),input=document.createElement('textarea'),button=node('button','Registrar andamento','secondary');
        select.setAttribute('aria-label','Andamento do serviço');for(const value of choices)select.add(new Option(value+'%',String(value)));
        input.setAttribute('aria-label','Resumo do andamento');input.maxLength=500;input.rows=2;button.type='button';
        button.onclick=()=>action('add_service_progress_update',request,'Andamento registrado e visível ao cliente.',{p_progress_percent:Number(select.value),p_note:input.value.trim()});
        percentLabel.append(select);noteLabel.append(input);el('execution').append(percentLabel,noteLabel,button);
      }
      const b=node('button','Solicitar confirmação de conclusão');b.onclick=()=>action('request_service_completion',request,'Conclusão solicitada ao cliente.');el('execution').append(b);
    }
    if(adjustment){
      el('execution').append(node('p','Ajuste solicitado: '+adjustment.description,'notice'));
      if(adjustment.status==='respondido')el('execution').append(node('p','Resposta do prestador: '+adjustment.provider_response,'notice'));
      if(context.profile.role==='prestador'&&request.status==='em_andamento'&&adjustment.status==='pendente'){
        const label=node('label','Como o ajuste foi atendido'),input=document.createElement('textarea'),button=node('button','Registrar ajuste realizado','secondary');
        input.setAttribute('aria-label','Como o ajuste foi atendido');input.maxLength=500;input.rows=2;button.type='button';
        button.onclick=()=>action('respond_completion_adjustment',request,'Resposta registrada. O cliente já pode revisar novamente.',{p_response:input.value.trim()});
        label.append(input);el('execution').append(label,button);
      }
    }
    if(context.profile.role==='cliente'&&request.status==='em_andamento'&&requested&&!confirmed){
      if(!adjustment){
        const label=node('label','Ajuste necessário antes da conclusão'),input=document.createElement('textarea'),button=node('button','Solicitar ajuste','secondary');
        input.setAttribute('aria-label','Ajuste necessário antes da conclusão');input.maxLength=500;input.rows=2;button.type='button';
        button.onclick=()=>action('request_completion_adjustment',request,'Ajuste solicitado ao prestador antes da conclusão.',{p_description:input.value.trim()});
        label.append(input);el('execution').append(label,button);
      }
      if(!adjustment||adjustment.status==='respondido'){const b=node('button','Confirmar serviço concluído');b.onclick=()=>action('confirm_service_completion',request,'Conclusão confirmada. Pagamento e repasse continuam separados.');el('execution').append(b);}
    }
    el('ratings').replaceChildren();for(const r of ratings)el('ratings').append(node('p',(r.reviewer_id===context.user.id?'Sua avaliação':'Avaliação da outra parte')+': '+r.score+'/5'+(r.comment?' — '+r.comment:'')));
    const mine=ratings.some(r=>r.reviewer_id===context.user.id);el('ratingForm').hidden=request.status!=='concluido'||mine;
  }
  el('ratingForm').onsubmit=async event=>{event.preventDefault();const context=getContext(),request=context.selected;if(!request)return;el('saveRating').disabled=true;try{
    check(await api.rpc('rate_completed_service',{p_request_id:request.id,p_score:Number(el('ratingScore').value),p_comment:el('ratingComment').value.trim()||null}));message('Avaliação registrada e protegida contra alteração.');await onChanged();
  }catch(error){message(friendly(error));}finally{el('saveRating').disabled=false;}};
  return {load,reset};
}
