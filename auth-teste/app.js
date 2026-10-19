import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config.js';
import { parseMoneyToCents, formatCents } from './money.js';
import { createContractPanel } from './contracts.js';
import { createExecutionPanel } from './execution.js';

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
    SE007:'Sua avaliação já foi registrada e não pode ser alterada.' })[error?.code]
    || (error instanceof InputError ? error.message : 'Não foi possível concluir. Verifique sua conexão e tente novamente.');
}
class InputError extends Error {}
const contracts=createContractPanel({api,getContext:()=>({user,profile,selected,generation}),message,friendly});
const execution=createExecutionPanel({api,getContext:()=>({user,profile,selected,generation}),message,friendly,onChanged:()=>refresh()});
function text(tag, value, className) { const node=document.createElement(tag); node.textContent=value; if(className)node.className=className; return node; }
async function busy(id, task) {
  el(id).disabled=true;
  try { await task(); } catch(error) { message(friendly(error)); } finally { el(id).disabled=false; }
}
function clearWorkspace() {
  profile=null; selected=null; ++conversationGeneration;
  contracts.reset();
  execution.reset();
  for(const id of ['workspace','clientPanel','providerPanel','providerApply','adminPanel','conversation']) el(id).hidden=true;
  for(const id of ['requests','opportunities','messages','quotes','applications','identity','profile']) el(id).replaceChildren();
  for(const id of ['password','newPassword','message','description','experience','quoteAmount','quoteDescription']) el(id).value='';
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
  const requests=check(await api.from('service_requests').select('id,profession,description,status,created_at,city,state,scheduled_for').order('created_at',{ascending:false}).limit(100))||[];
  if(ticket!==generation)return;
  el('requests').replaceChildren();
  if(!requests.length)el('requests').append(text('p','Nenhum serviço registrado.'));
  for(const r of requests) {
    const card=text('article','','service');
    card.append(text('h3',r.profession),text('small',(labels[r.status]||r.status)+' · '+r.city+' / '+r.state),text('p',r.description));
    if(r.scheduled_for)card.append(text('small','Agendado: '+new Date(r.scheduled_for).toLocaleString('pt-BR')));
    if(['aceito','em_andamento','concluido'].includes(r.status)) {
      const button=text('button','Abrir conversa','secondary');button.onclick=()=>busy('refresh',()=>openConversation(r));card.append(button);
    }
    el('requests').append(card);
  }
  if(profile.role==='prestador') {
    const opportunities=check(await api.rpc('available_requests'))||[];
    if(ticket!==generation)return;
    el('opportunities').replaceChildren();
    if(!opportunities.length)el('opportunities').append(text('p','Nenhum chamado compatível no momento.'));
    for(const r of opportunities) {
      const card=text('article','','service'),button=text('button','Aceitar chamado');
      card.append(text('h3',r.requested_profession),text('small','Solicitado em '+new Date(r.requested_at).toLocaleString('pt-BR')),button);
      button.onclick=async()=>{button.disabled=true;try{
        const accepted=check(await api.rpc('accept_request',{p_request_id:r.request_id}));
        message(accepted?'Chamado aceito. Combine o orçamento na conversa.':'O chamado não está mais disponível ou você não atende aos requisitos.');
        await refresh();
      }catch(error){message(friendly(error));}finally{button.disabled=false;}};
      el('opportunities').append(card);
    }
  }
  if(selected){const current=requests.find(r=>r.id===selected.id);if(current)await openConversation(current);}
}
async function openConversation(request) {
  const ticket=generation, conversationTicket=++conversationGeneration;
  if(selected?.id!==request.id)for(const id of ['message','quoteAmount','quoteDescription'])el(id).value='';
  el('conversation').hidden=true;
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
  const acceptedDecision=decisions.find(d=>d.decision==='aceita');
  await contracts.load(request,quotes.find(q=>q.id===acceptedDecision?.quote_id)||null);
  await execution.load(request);
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
  check(await api.from('service_requests').insert({client_id:user.id,profession,description,city,state,scheduled_for}));
  el('description').value='';await refresh();message('Pedido registrado. Aguardando um profissional elegível da sua região.');
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
