import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config.js';
import { parseMoneyToCents, formatCents } from './money.js';
import { createContractPanel } from './contracts.js';
import { createExecutionPanel } from './execution.js';
import { createCancellationPanel } from './cancellation.js';
import { createExtrasPanel } from './extras.js';
import { createDisputesPanel } from './disputes.js';
import { createInspectionsPanel } from './inspections.js';

const el = id => document.getElementById(id);
const api = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const callbackUrl = new URL(location.pathname, location.origin).href;
let user = null, profile = null, generation = 0, selected = null, conversationGeneration = 0;
let recovery = new URLSearchParams(location.hash.slice(1)).get('type') === 'recovery';
const labels = { aberto:'Buscando profissional', aceito:'Profissional aceitou', em_andamento:'Em andamento', concluido:'Concluído', cancelado:'Cancelado' };
const message = value => { el('status').textContent = value; };
const check = response => { if (response.error) throw response.error; return response.data; };
function friendly(error) {
  return ({ invalid_credentials:'E-mail ou senha incorretos.', email_not_confirmed:'Confirme seu e-mail antes de entrar.',
    over_email_send_rate_limit:'Aguarde antes de solicitar outro e-mail.', '23505':'Esta solicitação já foi enviada.',
    '42501':'Você não tem permissão para esta operação.', '23514':'Confira os dados informados.',
    SC001:'O acordo depende de um orçamento aceito e serviço apto para contratação.',
    SC002:'A versão atual precisa ser resolvida antes de propor outra.',
    SC003:'Esta versão já foi recusada ou substituída. Atualize o serviço.',
    SC004:'O documento mudou. Atualize e leia a versão correta antes do aceite.',
    SC005:'Confira datas, responsabilidades e valores das etapas.',
    SC006:'Sua decisão já foi registrada e não pode ser alterada nesta versão.',
    SE001:'Este serviço ainda não pode ser iniciado.',SE002:'O início depende do aceite do acordo pelas duas partes.',
    SE003:'O serviço precisa estar em andamento.',SE004:'Aguarde o prestador solicitar a confirmação de conclusão.',
    SE005:'A avaliação só é liberada após a conclusão.',SE006:'Confira a nota e o comentário.',
    SE007:'Sua avaliação já foi registrada e não pode ser alterada.',
    SE008:'O deslocamento só pode ser informado antes do início do serviço.',SE009:'Informe primeiro que está a caminho.',
    SE010:'Registre a chegada ao local antes de iniciar o serviço.',SE011:'Escolha uma previsão de chegada válida.',
    SE012:'A previsão só pode ser informada enquanto você está a caminho.',
    SE013:'A chegada só pode ser confirmada depois que o prestador informar que está no local.',
    SE014:'Aguarde o cliente confirmar a chegada antes de iniciar o serviço.',
    SE015:'Descreva o ajuste necessário com 10 a 500 caracteres.',
    SE016:'Aguarde o prestador responder ao ajuste solicitado.',
    SE017:'Registre a resposta ao ajuste com 10 a 500 caracteres.',
    SE018:'Este registro já foi feito e não pode ser alterado.',
    SP001:'Escolha um percentual e descreva o andamento com 10 a 500 caracteres.',
    SP002:'O andamento deve avançar e registros anteriores não podem ser alterados.',
    SP003:'O andamento só pode ser registrado durante a execução, antes da conclusão.',
    RA001:'Escolha uma data futura e informe um motivo com 10 a 500 caracteres.',
    RA002:'O reagendamento só pode ser decidido antes do deslocamento.',
    RA003:'A proposta ou decisão já registrada não pode ser alterada.',
    RA004:'Aguarde a decisão do reagendamento antes de iniciar o deslocamento.',
    RU001:'A urgência só pode ser alterada enquanto o pedido está aberto.',
    RS001:'Escolha um horário futuro.',RS002:'O horário só pode ser alterado enquanto o pedido está aberto.',
    RE001:'Descreva o serviço com 10 a 3000 caracteres.',RE002:'A descrição só pode ser alterada enquanto o pedido está aberto.',
    RL001:'Confira a cidade e a UF.',RL002:'A região só pode ser alterada enquanto o pedido está aberto.',
    RP001:'Escolha uma profissão disponível no catálogo.',RP002:'A profissão só pode ser alterada enquanto o pedido está aberto.' })[error?.code]
    || ({CN001:'Explique o motivo com pelo menos 10 caracteres.',CN002:'Este serviço não pode ser cancelado por este fluxo.'})[error?.code]
    || ({EX001:'Confira a descrição, o valor e a decisão do serviço extra.',EX002:'Este serviço não aceita extras nesta etapa.',
      EX003:'O extra pendente precisa ser decidido e decisões anteriores não podem ser alteradas.',EX004:'Aguarde o cliente decidir o serviço extra antes de solicitar a conclusão.'})[error?.code]
    || ({DP001:'Confira a categoria e escreva ao menos 20 caracteres.',DP002:'A contestação só pode ser aberta durante ou depois da execução.',
      DP003:'Esta contestação já foi registrada e não pode ser alterada.'})[error?.code]
    || ({VI001:'Confira finalidade, data e valor da vistoria.',VI002:'A vistoria precisa ser proposta antes do orçamento, enquanto o serviço está aceito.',
      VI003:'Esta proposta de vistoria já foi decidida e não pode ser alterada.'})[error?.code]
    || (error instanceof InputError ? error.message : 'Não foi possível concluir. Verifique sua conexão e tente novamente.');
}
class InputError extends Error {}
const contracts=createContractPanel({api,getContext:()=>({user,profile,selected,generation}),message,friendly});
const execution=createExecutionPanel({api,getContext:()=>({user,profile,selected,generation}),message,friendly,onChanged:()=>refresh()});
const cancellations=createCancellationPanel({api,getContext:()=>({user,profile,selected,generation}),message,friendly,onChanged:()=>refresh()});
const extras=createExtrasPanel({api,getContext:()=>({user,profile,selected,generation}),message,friendly,onChanged:()=>refresh()});
const disputes=createDisputesPanel({api,getContext:()=>({user,profile,selected,generation}),message,friendly,onChanged:()=>refresh()});
const inspections=createInspectionsPanel({api,getContext:()=>({user,profile,selected,generation}),message,friendly,onChanged:()=>refresh()});
function text(tag, value, className) { const node=document.createElement(tag); node.textContent=value; if(className)node.className=className; return node; }
async function busy(id, task) {
  el(id).disabled=true;
  try { await task(); } catch(error) { message(friendly(error)); } finally { el(id).disabled=false; }
}
function clearWorkspace() {
  profile=null; selected=null; ++conversationGeneration;
  contracts.reset();
  execution.reset();
  cancellations.reset();
  extras.reset();
  disputes.reset();
  inspections.reset();
  for(const id of ['workspace','clientPanel','providerPanel','providerApply','adminPanel','conversation']) el(id).hidden=true;
  for(const id of ['requests','opportunities','messages','quotes','applications','identity','profile']) el(id).replaceChildren();
  for(const id of ['password','newPassword','message','description','experience','quoteAmount','quoteDescription','scheduled']) el(id).value='';
  el('urgent').checked=false;
}
function authView() {
  el('authPanel').hidden=!!user||recovery;
  el('accountPanel').hidden=!user||recovery;
  el('recoveryPanel').hidden=!recovery;
}
async function loadAccount(nextUser) {
  const ticket=++generation;
  clearWorkspace(); user=nextUser; authView();
  if(!user || recovery)return;
  const accountId=user.id;
  el('identity').textContent=user.email||'';
  const result=await api.from('profiles').select('role,full_name,is_available').eq('id',accountId).maybeSingle();
  if(ticket!==generation)return;
  profile=check(result);
  if(!profile || !['cliente','prestador','administrador'].includes(profile.role)) {
    message('Perfil indisponível. O acesso aos serviços permanece bloqueado.'); return;
  }
  el('greeting').textContent=profile.full_name?'Olá, '+profile.full_name:'Sua conta';
  el('profile').textContent='Perfil: '+profile.role;
  el('workspace').hidden=false;
  el('clientPanel').hidden=profile.role!=='cliente';
  el('providerApply').hidden=profile.role!=='cliente';
  el('providerPanel').hidden=profile.role!=='prestador';
  el('adminPanel').hidden=profile.role!=='administrador';
  const professions=check(await api.from('professions').select('id,name').order('name'))||[];
  if(ticket!==generation)return;
  for(const id of ['profession','serviceProfession']) {
    el(id).replaceChildren(new Option('Selecione uma profissão',''));
    for(const p of professions)el(id).add(new Option(p.name,p.name));
  }
  if(profile.role==='cliente') {
    const applications=check(await api.from('provider_applications').select('profession,status').eq('user_id',accountId).order('created_at',{ascending:false}));
    if(ticket!==generation)return;
    el('applications').textContent=applications?.length?applications.map(a=>a.profession+' — '+a.status).join('; '):'Nenhuma solicitação enviada.';
  }
  if(profile.role==='prestador') {
    el('available').checked=profile.is_available;
    const area=check(await api.from('provider_service_areas').select('city,state').eq('provider_id',accountId).maybeSingle());
    if(ticket!==generation)return;
    if(area){ el('providerCity').value=area.city;el('providerState').value=area.state; }
  }
  await refresh(ticket);
}
async function refresh(ticket=generation) {
  if(!profile||!user||recovery)return;
  const [requestResult,unreadResult]=await Promise.all([
    api.from('service_requests').select('id,profession,description,status,created_at,city,state,scheduled_for,is_urgent,provider_id').order('created_at',{ascending:false}).limit(100),
    api.rpc('unread_service_message_counts')
  ]);
  const requests=check(requestResult)||[],unread=new Map((check(unreadResult)||[]).map(x=>[x.request_id,Number(x.unread_count)])),filter=el('requestFilter').value,sort=el('requestSort').value,
    query=el('requestSearch').value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR'),
    visibleRequests=requests.filter(r=>{
      const matchesStatus=filter==='all'||(filter==='active'&&['aberto','aceito','em_andamento'].includes(r.status))||(filter==='waiting'&&r.status==='aberto')||(filter==='servicing'&&['aceito','em_andamento'].includes(r.status))||(filter==='completed'&&r.status==='concluido')||(filter==='history'&&['concluido','cancelado'].includes(r.status))||(filter==='urgent'&&r.is_urgent)||(filter==='scheduled'&&r.scheduled_for)||(filter==='unread'&&(unread.get(r.id)||0)>0);
      const searchable=(r.profession+' '+r.description).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
      return matchesStatus&&(!query||searchable.includes(query));
    }).sort((a,b)=>sort==='oldest'?new Date(a.created_at)-new Date(b.created_at):sort==='urgent'?(Number(b.is_urgent)-Number(a.is_urgent)||new Date(b.created_at)-new Date(a.created_at)):sort==='schedule'?(Number(!a.scheduled_for)-Number(!b.scheduled_for)||(a.scheduled_for&&b.scheduled_for?new Date(a.scheduled_for)-new Date(b.scheduled_for):0)||new Date(b.created_at)-new Date(a.created_at)):new Date(b.created_at)-new Date(a.created_at)),
    activeCount=requests.filter(r=>['aberto','aceito','em_andamento'].includes(r.status)).length,
    waitingCount=requests.filter(r=>r.status==='aberto').length,
    servicingCount=requests.filter(r=>['aceito','em_andamento'].includes(r.status)).length,
    completedCount=requests.filter(r=>r.status==='concluido').length,
    historyCount=requests.filter(r=>['concluido','cancelado'].includes(r.status)).length,
    urgentCount=requests.filter(r=>r.is_urgent).length,
    scheduledCount=requests.filter(r=>r.scheduled_for).length,
    unreadCount=requests.filter(r=>(unread.get(r.id)||0)>0).length;
  if(ticket!==generation)return;
  const filterLabels={all:`Todos (${requests.length})`,active:`Ativos (${activeCount})`,waiting:`Aguardando profissional (${waitingCount})`,servicing:`Em atendimento (${servicingCount})`,completed:`Concluídos (${completedCount})`,history:`Histórico (${historyCount})`,urgent:`Urgentes (${urgentCount})`,scheduled:`Com horário preferido (${scheduledCount})`,unread:`Mensagens novas (${unreadCount})`};
  for(const option of el('requestFilter').options)option.textContent=filterLabels[option.value];
  el('requestSummary').textContent=`Exibindo ${visibleRequests.length} de ${requests.length} serviço${requests.length===1?'':'s'} · ${activeCount} ativo${activeCount===1?'':'s'} · ${historyCount} no histórico · ${unreadCount} com mensagens novas.`;
  el('requests').replaceChildren();
  if(!visibleRequests.length)el('requests').append(text('p',requests.length?(query?'Nenhum serviço corresponde à busca e ao filtro selecionado.':'Nenhum serviço nesta categoria.'):'Nenhum serviço registrado.'));
  for(const r of visibleRequests) {
    const card=text('article','','service');
    card.dataset.request=r.id;
    card.append(text('h3',r.profession),text('small',(labels[r.status]||r.status)+' · '+r.city+' / '+r.state),text('p',r.description));
    if(r.is_urgent)card.append(text('strong','Atendimento urgente'));
    if(profile.role==='cliente'&&r.status==='aberto'&&!r.provider_id) {
      const professionLabel=text('label','Profissão do pedido');professionLabel.htmlFor='request-profession-'+r.id;
      const requestProfession=document.createElement('select');requestProfession.id=professionLabel.htmlFor;
      for(const option of el('serviceProfession').options)if(option.value)requestProfession.add(new Option(option.textContent,option.value));
      requestProfession.value=r.profession;
      const saveProfession=text('button','Atualizar profissão','secondary');saveProfession.type='button';
      saveProfession.onclick=async()=>{saveProfession.disabled=true;try{
        const profession=requestProfession.value;if(!profession)throw new InputError('Escolha uma profissão disponível no catálogo.');
        check(await api.rpc('set_open_request_profession',{p_request_id:r.id,p_profession:profession}));
        message('Profissão do pedido atualizada. A busca considera agora a nova especialidade.');await refresh();
      }catch(error){message(friendly(error));}finally{saveProfession.disabled=false;}};
      const urgency=text('button',r.is_urgent?'Remover urgência':'Marcar como urgente','secondary');urgency.type='button';
      urgency.onclick=async()=>{urgency.disabled=true;try{
        const next=!r.is_urgent;check(await api.rpc('set_request_urgency',{p_request_id:r.id,p_urgent:next}));
        message(next?'Pedido marcado como urgente. Prestadores elegíveis verão a prioridade.':'Urgência removida. O pedido continua disponível normalmente.');await refresh();
      }catch(error){message(friendly(error));}finally{urgency.disabled=false;}};
      const scheduleLabel=text('label','Horário preferido');scheduleLabel.htmlFor='request-schedule-'+r.id;
      const schedule=document.createElement('input');schedule.type='datetime-local';schedule.id=scheduleLabel.htmlFor;
      if(r.scheduled_for){const date=new Date(r.scheduled_for);schedule.value=new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);}
      const saveSchedule=text('button','Atualizar horário','secondary');saveSchedule.type='button';
      saveSchedule.onclick=async()=>{saveSchedule.disabled=true;try{
        const next=schedule.value?new Date(schedule.value).toISOString():null;
        if(next&&new Date(next)<=new Date())throw new InputError('Escolha um horário futuro.');
        check(await api.rpc('set_open_request_schedule',{p_request_id:r.id,p_scheduled_for:next}));
        message(next?'Horário preferido atualizado. Prestadores elegíveis verão a nova preferência.':'Horário preferido removido. O pedido continua aberto.');await refresh();
      }catch(error){message(friendly(error));}finally{saveSchedule.disabled=false;}};
      const descriptionLabel=text('label','Descrição do pedido');descriptionLabel.htmlFor='request-description-'+r.id;
      const description=document.createElement('textarea');description.id=descriptionLabel.htmlFor;description.minLength=10;description.maxLength=3000;description.rows=3;description.value=r.description;
      const saveDescription=text('button','Atualizar descrição','secondary');saveDescription.type='button';
      saveDescription.onclick=async()=>{saveDescription.disabled=true;try{
        const next=description.value.trim();if(next.length<10||next.length>3000)throw new InputError('Descreva o serviço com 10 a 3000 caracteres.');
        check(await api.rpc('set_open_request_description',{p_request_id:r.id,p_description:next}));
        message('Descrição do pedido atualizada. O chamado continua disponível.');await refresh();
      }catch(error){message(friendly(error));}finally{saveDescription.disabled=false;}};
      const cityLabel=text('label','Cidade do pedido');cityLabel.htmlFor='request-city-'+r.id;
      const requestCity=document.createElement('input');requestCity.id=cityLabel.htmlFor;requestCity.minLength=2;requestCity.maxLength=100;requestCity.value=r.city;
      const stateLabel=text('label','UF do pedido');stateLabel.htmlFor='request-state-'+r.id;
      const requestState=document.createElement('input');requestState.id=stateLabel.htmlFor;requestState.maxLength=2;requestState.value=r.state;
      const saveLocation=text('button','Atualizar região','secondary');saveLocation.type='button';
      saveLocation.onclick=async()=>{saveLocation.disabled=true;try{
        const city=requestCity.value.trim(),state=requestState.value.trim().toUpperCase();
        if(city.length<2||city.length>100||!/^[A-Z]{2}$/.test(state))throw new InputError('Confira a cidade e a UF.');
        check(await api.rpc('set_open_request_location',{p_request_id:r.id,p_city:city,p_state:state}));
        message('Região do pedido atualizada. A busca considera agora a nova cidade e UF.');await refresh();
      }catch(error){message(friendly(error));}finally{saveLocation.disabled=false;}};
      card.append(professionLabel,requestProfession,saveProfession,urgency,scheduleLabel,schedule,saveSchedule,descriptionLabel,description,saveDescription,cityLabel,requestCity,stateLabel,requestState,saveLocation);
    }
    const count=unread.get(r.id)||0;if(count)card.append(text('strong',count+' nova'+(count===1?' mensagem':'s mensagens'),'unread-count'));
    if(r.scheduled_for)card.append(text('small','Horário preferido: '+new Date(r.scheduled_for).toLocaleString('pt-BR')));
    const cancelButton=cancellations.buttonFor(r);if(cancelButton)card.append(cancelButton);
    if(profile.role==='cliente'&&['cancelado','concluido'].includes(r.status)) {
      const repeat=text('button','Solicitar novamente','secondary');repeat.type='button';
      repeat.onclick=()=>{
        const available=[...el('serviceProfession').options].some(option=>option.value===r.profession);
        if(!available){message('Esta profissão não está disponível no catálogo atual.');return;}
        el('serviceProfession').value=r.profession;el('description').value=r.description;el('city').value=r.city;el('state').value=r.state;
        el('scheduled').value='';el('urgent').checked=false;el('clientPanel').scrollIntoView({behavior:'smooth',block:'start'});el('description').focus();
        message('Dados copiados para uma nova solicitação. Revise as informações antes de enviar.');
      };
      card.append(repeat);
    }
    if(['aceito','em_andamento','concluido'].includes(r.status)) {
      const button=text('button','Abrir conversa','secondary');button.onclick=()=>busy('refresh',()=>openConversation(r));card.append(button);
    }
    el('requests').append(card);
  }
  if(profile.role==='prestador') {
    const [availableResult,declinedResult]=await Promise.all([api.rpc('available_request_context'),api.rpc('declined_requests')]);
    const opportunities=check(availableResult)||[],declinedRequests=check(declinedResult)||[];
    if(ticket!==generation)return;
    el('opportunities').replaceChildren();
    if(!opportunities.length)el('opportunities').append(text('p','Nenhum chamado compatível no momento.'));
    for(const r of opportunities) {
      const card=text('article','','service'),button=text('button','Aceitar chamado'),decline=text('button','Não tenho interesse','secondary');
      card.append(text('h3',r.requested_profession),text('small',(r.is_urgent?'Urgente · ':'')+r.city+' / '+r.state),text('small','Solicitado em '+new Date(r.requested_at).toLocaleString('pt-BR')));
      if(r.scheduled_for)card.append(text('small','Preferência: '+new Date(r.scheduled_for).toLocaleString('pt-BR')));
      card.append(button,decline);
      button.onclick=async()=>{button.disabled=true;decline.disabled=true;try{
        const accepted=check(await api.rpc('accept_request',{p_request_id:r.request_id}));
        message(accepted?'Chamado aceito. Combine o orçamento na conversa.':'O chamado não está mais disponível ou você não atende aos requisitos.');
        await refresh();
      }catch(error){message(friendly(error));}finally{button.disabled=false;decline.disabled=false;}};
      decline.onclick=async()=>{button.disabled=true;decline.disabled=true;try{
        const declined=check(await api.rpc('decline_request',{p_request_id:r.request_id}));
        message(declined?'Chamado removido da sua lista. Outros profissionais ainda podem aceitá-lo.':'O chamado não está mais disponível ou você não atende aos requisitos.');
        await refresh();
      }catch(error){message(friendly(error));}finally{button.disabled=false;decline.disabled=false;}};
      el('opportunities').append(card);
    }
    if(declinedRequests.length)el('opportunities').append(text('h4','Ocultados por você'));
    for(const r of declinedRequests) {
      const card=text('article','','service'),restore=text('button','Mostrar novamente','secondary');
      card.append(text('h3',r.requested_profession),text('small','Ocultado em '+new Date(r.declined_at).toLocaleString('pt-BR')),restore);
      restore.onclick=async()=>{restore.disabled=true;try{
        const restored=check(await api.rpc('restore_request_interest',{p_request_id:r.request_id}));
        message(restored?'Chamado devolvido à sua lista de oportunidades.':'O chamado já não estava oculto para você.');
        await refresh();
      }catch(error){message(friendly(error));}finally{restore.disabled=false;}};
      el('opportunities').append(card);
    }
  }
  if(selected){const current=requests.find(r=>r.id===selected.id);if(current)await openConversation(current);}
}
async function openConversation(request) {
  const ticket=generation, conversationTicket=++conversationGeneration;
  if(selected?.id!==request.id)for(const id of ['message','quoteAmount','quoteDescription'])el(id).value='';
  el('conversation').hidden=true;
  el('inspectionSection').hidden=true;
  check(await api.rpc('mark_conversation_read',{p_request_id:request.id}));
  document.querySelector(`[data-request="${CSS.escape(request.id)}"] .unread-count`)?.remove();
  const results=await Promise.all([
    api.from('service_messages').select('id,sender_id,body,created_at').eq('request_id',request.id).order('created_at',{ascending:true}).limit(200),
    api.from('service_quotes').select('id,request_id,provider_id,amount_cents,description,status,created_at').eq('request_id',request.id).order('created_at',{ascending:false}).limit(100),
    api.from('service_quote_decisions').select('quote_id,decision,created_at').eq('request_id',request.id).order('created_at',{ascending:false}).limit(200)
  ]);
  if(ticket!==generation||conversationTicket!==conversationGeneration)return;
  const [messages,quotes,decisions]=results.map(r=>check(r)||[]);
  selected=request;el('conversation').hidden=false;el('selectedRequest').textContent=request.profession+' · '+request.id;
  el('messages').replaceChildren();
  if(!messages.length)el('messages').append(text('p','Inicie a conversa sobre o serviço.'));
  for(const m of messages) { const item=text('article','','chat-message');item.append(text('small',m.sender_id===user.id?'Você':'Outra parte'),text('p',m.body));el('messages').append(item); }
  renderQuotes(request,quotes,decisions);
  await inspections.load(request,quotes.length>0);
  const acceptedDecision=decisions.find(d=>d.decision==='aceita');
  await contracts.load(request,quotes.find(q=>q.id===acceptedDecision?.quote_id)||null);
  await execution.load(request);
  await extras.load(request);
  await disputes.load(request);
}
function renderQuotes(request,quotes,decisions) {
  const accepted=decisions.some(d=>d.decision==='aceita');
  el('quoteForm').hidden=profile.role!=='prestador'||accepted;
  el('quoteNotice').textContent=accepted?'Orçamento aceito. Contrato e pagamento ainda precisam ser concluídos nas próximas etapas.':'Registre escopo, prazo e valor antes do contrato. Nenhuma cobrança é realizada nesta etapa.';
  el('quotes').replaceChildren();
  if(!quotes.length)el('quotes').append(text('p','Nenhum orçamento enviado.'));
  for(const quote of quotes) {
    const decision=decisions.find(d=>d.quote_id===quote.id);
    const item=text('article','','service');item.dataset.quote=quote.id;
    item.append(text('h3',formatCents(quote.amount_cents)),text('p',quote.description));
    item.append(text('small',decision?(decision.decision==='aceita'?'Aceito pelo cliente':'Recusado pelo cliente'):accepted?'Outra proposta já foi aceita':quote.status==='proposta'?'Aguardando decisão do cliente':quote.status));
    if(profile.role==='cliente'&&!decision&&!accepted&&quote.status==='proposta') {
      for(const [value,label] of [['aceita','Aceitar orçamento'],['recusada','Recusar orçamento']]) {
        const button=text('button',label,value==='aceita'?'':'secondary');button.type='button';
        button.onclick=async()=>{
          item.querySelectorAll('button').forEach(b=>{b.disabled=true;});
          try {
            check(await api.from('service_quote_decisions').insert({quote_id:quote.id,request_id:request.id,decided_by:user.id,decision:value}));
            if(selected?.id!==request.id)return;
            await openConversation(request);message(value==='aceita'?'Orçamento aceito e registrado. Ainda não houve pagamento.':'Orçamento recusado. O prestador pode enviar uma nova proposta.');
          }catch(error){message(error?.code==='23505'?'Já existe uma decisão para este orçamento ou outro já foi aceito. Atualize o serviço.':friendly(error));}
          finally{item.querySelectorAll('button').forEach(b=>{b.disabled=false;});}
        };
        item.append(button);
      }
    }
    el('quotes').append(item);
  }
}
el('action').onchange=()=>{
  const action=el('action').value;
  el('registration').hidden=action!=='signup';el('name').required=action==='signup';
  el('passwordArea').hidden=action==='reset';el('password').required=action!=='reset';
  el('password').autocomplete=action==='signup'?'new-password':'current-password';el('password').value='';
};
el('action').onchange();
el('authForm').onsubmit=event=>{event.preventDefault();busy('submit',async()=>{
  const email=el('email').value.trim(),password=el('password').value,action=el('action').value;
  if(action!=='reset'&&password.length<8)throw new InputError('Senha deve ter pelo menos 8 caracteres.');
  if(action==='signup') {
    const full_name=el('name').value.trim();if(!full_name)throw new InputError('Informe seu nome.');
    const data=check(await api.auth.signUp({email,password,options:{emailRedirectTo:callbackUrl,data:{full_name,requested_role:el('role').value}}}));
    el('password').value='';message('Cadastro solicitado. Verifique seu e-mail para confirmar a conta. O perfil de prestador depende de análise.');
    if(data.session)await loadAccount(data.user);
  }else if(action==='reset') {
    check(await api.auth.resetPasswordForEmail(email,{redirectTo:callbackUrl}));message('Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.');
  }else {
    const data=check(await api.auth.signInWithPassword({email,password}));el('password').value='';message('');await loadAccount(data.user);
  }
});};
el('recoveryForm').onsubmit=event=>{event.preventDefault();busy('savePassword',async()=>{
  const password=el('newPassword').value;if(password.length<8)throw new InputError('A nova senha precisa de pelo menos 8 caracteres.');
  check(await api.auth.updateUser({password}));check(await api.auth.signOut());recovery=false;
  history.replaceState(null,'',callbackUrl);await loadAccount(null);message('Senha atualizada. Entre com sua nova senha.');
});};
el('logout').onclick=()=>busy('logout',async()=>{check(await api.auth.signOut());recovery=false;await loadAccount(null);message('Sessão encerrada.');});
el('applicationForm').onsubmit=event=>{event.preventDefault();busy('applyProvider',async()=>{
  if(profile?.role!=='cliente')throw new InputError('Entre com um perfil de cliente.');
  const profession=el('profession').value;if(!profession)throw new InputError('Selecione uma profissão.');
  check(await api.from('provider_applications').insert({user_id:user.id,profession,experience_summary:el('experience').value.trim()||null}));
  await loadAccount(user);message('Solicitação enviada para análise. O acesso de prestador ainda não foi liberado.');
});};
el('requestForm').onsubmit=event=>{event.preventDefault();busy('createRequest',async()=>{
  if(profile?.role!=='cliente')throw new InputError('Entre com um perfil de cliente.');
  const profession=el('serviceProfession').value,description=el('description').value.trim(),city=el('city').value.trim(),state=el('state').value.trim().toUpperCase();
  if(!profession||description.length<10||city.length<2||!/^[A-Z]{2}$/.test(state))throw new InputError('Confira a profissão, descrição e cidade.');
  const scheduled_for=el('scheduled').value?new Date(el('scheduled').value).toISOString():null;
  if(scheduled_for&&new Date(scheduled_for)<=new Date())throw new InputError('Escolha um horário futuro.');
  const is_urgent=el('urgent').checked;
  check(await api.from('service_requests').insert({client_id:user.id,profession,description,city,state,scheduled_for,is_urgent}));
  el('description').value='';el('scheduled').value='';el('urgent').checked=false;await refresh();message(is_urgent?'Pedido urgente registrado. Prestadores elegíveis verão a prioridade.':'Pedido registrado. Aguardando um profissional elegível da sua região.');
});};
el('areaForm').onsubmit=event=>{event.preventDefault();busy('saveArea',async()=>{
  if(profile?.role!=='prestador')throw new InputError('Acesso restrito ao prestador aprovado.');
  const city=el('providerCity').value.trim(),state=el('providerState').value.trim().toUpperCase();
  check(await api.from('provider_service_areas').upsert({provider_id:user.id,city,state,updated_at:new Date().toISOString()},{onConflict:'provider_id'}));
  await refresh();message('Região de atendimento atualizada.');
});};
el('available').onchange=()=>busy('available',async()=>{
  const available=el('available').checked;
  try { if(!check(await api.rpc('set_provider_availability',{p_available:available})))throw new InputError('Somente prestadores aprovados com e-mail confirmado podem ficar disponíveis.');profile.is_available=available;await refresh(); }
  catch(error){el('available').checked=profile?.is_available||false;throw error;}
});
el('refresh').onclick=()=>busy('refresh',()=>refresh());
el('requestFilter').onchange=()=>busy('refresh',()=>refresh());
el('requestSort').onchange=()=>busy('refresh',()=>refresh());
el('requestSearchForm').onsubmit=event=>{event.preventDefault();busy('searchRequests',()=>refresh());};
el('clearRequestSearch').onclick=()=>{el('requestSearch').value='';busy('clearRequestSearch',()=>refresh());};
el('clearRequestFilters').onclick=()=>{
  el('requestSearch').value='';el('requestFilter').value='all';el('requestSort').value='recent';busy('clearRequestFilters',()=>refresh());
};
el('messageForm').onsubmit=event=>{event.preventDefault();busy('sendMessage',async()=>{
  if(!selected||!user)throw new InputError('Selecione um serviço aceito.');
  const body=el('message').value.trim();if(!body)throw new InputError('Escreva uma mensagem.');
  const request=selected;check(await api.from('service_messages').insert({request_id:request.id,sender_id:user.id,body}));el('message').value='';await openConversation(request);
});};
el('quoteForm').onsubmit=event=>{event.preventDefault();busy('sendQuote',async()=>{
  if(!selected||profile?.role!=='prestador')throw new InputError('Selecione um serviço aceito como prestador.');
  const amount_cents=parseMoneyToCents(el('quoteAmount').value),description=el('quoteDescription').value.trim();
  if(amount_cents===null)throw new InputError('Informe um valor positivo com até duas casas decimais.');
  if(description.length<5)throw new InputError('Descreva o escopo e o prazo do orçamento.');
  const request=selected;
  check(await api.from('service_quotes').insert({request_id:request.id,provider_id:user.id,amount_cents,description}));
  el('quoteAmount').value='';el('quoteDescription').value='';
  if(selected?.id===request.id)await openConversation(request);
  message('Orçamento enviado para decisão do cliente.');
});};
// Do not call Supabase asynchronously while holding its auth-state callback lock.
api.auth.onAuthStateChange((event,session)=>{
  if(event==='PASSWORD_RECOVERY'){recovery=true;++generation;clearWorkspace();authView();message('Digite sua nova senha.');}
  if(event==='SIGNED_OUT'){++generation;user=null;clearWorkspace();authView();}
  if(event==='SIGNED_IN'&&!recovery)setTimeout(()=>loadAccount(session.user).catch(e=>message(friendly(e))),0);
});
authView();
try { const {user:current}=check(await api.auth.getUser());await loadAccount(current); }
catch(error){if(error?.name!=='AuthSessionMissingError')message(friendly(error));}
