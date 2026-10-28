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
const linkedRequestParams = new URLSearchParams(location.search).getAll('servico');
const linkedRequestParam = linkedRequestParams[0] ?? null;
const normalizedLinkedRequest = linkedRequestParam?.trim() || '';
const invalidLinkedRequest = linkedRequestParams.length > 1 || (linkedRequestParam !== null && !/^[A-Za-z0-9-]{1,100}$/.test(normalizedLinkedRequest));
let linkedRequestId = invalidLinkedRequest ? '' : normalizedLinkedRequest;
if(invalidLinkedRequest){const url=new URL(location.href);url.searchParams.delete('servico');history.replaceState(null,'',url.pathname+url.search+url.hash);}
let linkedRequestNeedsFocus = Boolean(linkedRequestId);
let user = null, profile = null, generation = 0, selected = null, conversationGeneration = 0, requestPageSize = 10, requestDisplayLimit = 10, exportableRequests = [], exportableUnread = new Map();
let pendingConfirmationEmail = '';
let recovery = new URLSearchParams(location.hash.slice(1)).get('type') === 'recovery';
const labels = { aberto:'Buscando profissional', aceito:'Profissional aceitou', em_andamento:'Em andamento', concluido:'Concluído', cancelado:'Cancelado' };
const requestBatchSize=100;
const message = value => { el('status').textContent = value; };
const passwordControls = [
  {input:'password',button:'togglePassword',label:'senha'},
  {input:'passwordConfirmation',button:'togglePasswordConfirmation',label:'confirmação'},
  {input:'newPassword',button:'toggleNewPassword',label:'nova senha'},
  {input:'newPasswordConfirmation',button:'toggleNewPasswordConfirmation',label:'confirmação da nova senha'}
];
function setPasswordVisibility(control,visible) {
  el(control.input).type=visible?'text':'password';
  el(control.button).textContent=`${visible?'Ocultar':'Mostrar'} ${control.label}`;
  el(control.button).setAttribute('aria-pressed',String(visible));
}
function resetPasswordVisibility(){for(const control of passwordControls)setPasswordVisibility(control,false);}
for(const control of passwordControls)el(control.button).onclick=()=>setPasswordVisibility(control,el(control.input).type==='password');
const capsLockGroups=[
  {inputs:['password','passwordConfirmation'],warning:'authCapsLockWarning'},
  {inputs:['newPassword','newPasswordConfirmation'],warning:'recoveryCapsLockWarning'}
];
function hideCapsLockWarnings(){for(const group of capsLockGroups)el(group.warning).hidden=true;}
for(const group of capsLockGroups)for(const input of group.inputs){
  el(input).addEventListener('keydown',event=>{el(group.warning).hidden=!event.getModifierState?.('CapsLock');});
  el(input).addEventListener('keyup',event=>{el(group.warning).hidden=!event.getModifierState?.('CapsLock');});
  el(input).addEventListener('blur',()=>{el(group.warning).hidden=true;});
}
function focusAccessField(){el(el('action').value==='signup'?'name':'email').focus();}
const check = response => { if (response.error) throw response.error; return response.data; };
function friendly(error) {
  return ({ invalid_credentials:'E-mail ou senha incorretos.', email_not_confirmed:'Confirme seu e-mail antes de entrar.',
    weak_password:'Use uma senha mais forte que atenda aos requisitos de segurança.',
    same_password:'A nova senha deve ser diferente da senha atual.',
    over_request_rate_limit:'Muitas tentativas foram feitas. Aguarde alguns minutos antes de tentar novamente.',
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
function requestDateSearchValue(value) { const date=new Date(value); return Number.isNaN(date.getTime())?'':value+' '+date.toLocaleDateString('pt-BR'); }
function requestLink(requestId) { const link=new URL(location.pathname,location.origin);link.searchParams.set('servico',requestId);return link.href; }
function requestLinksPayload(requests) {
  const fileSlug=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''),
    now=new Date(),day=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-'),filterName=el('requestFilter').selectedOptions[0]?.textContent.replace(/\s+\(\d+\)$/,'')||'filtrados',filterSlug=fileSlug(filterName)||'filtrados',searchSlug=fileSlug(el('requestSearch').value.trim()).slice(0,40).replace(/-$/,''),sortSlug=el('requestSort').value==='recent'?'':fileSlug(el('requestSort').selectedOptions[0]?.textContent),contextSlug=[filterSlug,searchSlug,sortSlug].filter(Boolean).join('-');
  return {filename:`servico-certo-links-autenticados-${contextSlug}-${day}.txt`,content:requests.map(request=>requestLink(request.id)).join('\n')};
}
function downloadRequestLinks(requests) {
  const {filename,content}=requestLinksPayload(requests),blob=new Blob([content],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url);return filename;
}
function downloadRequestLink(request) {
  const safeId=String(request.id).replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/(^-|-$)/g,'')||'servico',filename=`servico-${safeId}-link.txt`,blob=new Blob([requestLink(request.id)],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url);return filename;
}
async function shareRequestLink(request) {
  const link=requestLink(request.id),data={title:'Serviço Certo — '+request.profession,text:'Acesse este serviço com uma conta participante.',url:link};
  if(navigator.share)try{await navigator.share(data);return 'shared';}catch(error){if(error?.name==='AbortError')throw error;await copyText(link);return 'copiedAfterError';}
  await copyText(link);return 'copied';
}
async function shareRequestLinkAction(button,request) {
  button.disabled=true;try{const result=await shareRequestLink(request);message(result==='shared'?'Link autenticado enviado ao compartilhamento do aparelho.':result==='copiedAfterError'?'Compartilhamento recusado. Link autenticado copiado.':'Compartilhamento indisponível. Link autenticado copiado.');}catch(error){message(error?.name==='AbortError'?'Compartilhamento cancelado.':'Não foi possível compartilhar o link.');}finally{button.disabled=false;}
}
async function shareRequestLinks(requests) {
  const {filename,content}=requestLinksPayload(requests),title='Serviço Certo — links autenticados';let file,canShareFile=false,fileRejected=false;
  try{file=new File([content],filename,{type:'text/plain;charset=utf-8'});canShareFile=Boolean(navigator.share&&navigator.canShare?.({files:[file]}));}catch{}
  if(canShareFile)try{await navigator.share({title,text:`${requests.length} links autenticados em arquivo de texto.`,files:[file]});return {mode:'file',filename};}catch(error){if(error?.name==='AbortError')throw error;fileRejected=true;}
  if(navigator.share)try{await navigator.share({title,text:content});return {mode:fileRejected?'sharedAfterFileError':'shared',filename};}catch(error){if(error?.name==='AbortError')throw error;await copyText(content);return {mode:fileRejected?'copiedAfterFileAndTextError':'copiedAfterError',filename};}
  await copyText(content);return {mode:'copied',filename};
}
function requestSummaryText(request) {
  const createdAt=new Date(request.created_at),scheduledFor=new Date(request.scheduled_for),lines=['Serviço Certo','Código: '+request.id,'Profissão: '+request.profession,'Situação: '+(labels[request.status]||request.status),'Região: '+request.city+' / '+request.state,'Urgente: '+(request.is_urgent?'Sim':'Não')];
  if(!Number.isNaN(createdAt.getTime()))lines.push('Solicitado em: '+createdAt.toLocaleString('pt-BR'));
  if(request.scheduled_for&&!Number.isNaN(scheduledFor.getTime()))lines.push('Horário preferido: '+scheduledFor.toLocaleString('pt-BR'));
  lines.push('Link autenticado: '+requestLink(request.id));return lines.join('\n');
}
function requestSummaryFilename(request) { const safeId=String(request.id).replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/(^-|-$)/g,'')||'servico';return `servico-${safeId}-resumo.txt`; }
function downloadRequestSummary(request) {
  const filename=requestSummaryFilename(request),blob=new Blob([requestSummaryText(request)],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url);return filename;
}
function requestSummariesPayload(requests) {
  const fileSlug=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''),
    now=new Date(),day=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-'),filterName=el('requestFilter').selectedOptions[0]?.textContent.replace(/\s+\(\d+\)$/,'')||'filtrados',filterSlug=fileSlug(filterName)||'filtrados',search=el('requestSearch').value.trim(),searchSlug=fileSlug(search).slice(0,40).replace(/-$/,''),sortName=el('requestSort').selectedOptions[0]?.textContent||'Mais recentes',sortSlug=el('requestSort').value==='recent'?'':fileSlug(sortName),contextSlug=[filterSlug,searchSlug,sortSlug].filter(Boolean).join('-'),context=['Contexto dos resumos seguros',`Filtro: ${filterName}`,`Busca aplicada: ${search?'Sim':'Não'}`,`Ordenação: ${sortName}`,`Quantidade: ${requests.length}`].join('\n');
  return {filename:`servico-certo-resumos-seguros-${contextSlug}-${day}.txt`,content:context+'\n\n---\n\n'+requests.map(requestSummaryText).join('\n\n---\n\n')};
}
function closeRequestLinksPreview() {
  const preview=el('requestLinksPreview'),button=el('previewRequestLinks');preview.hidden=true;preview.replaceChildren();button.textContent='Ver links';button.setAttribute('aria-expanded','false');
}
function requestLinkPreview(requests) {
  return requests.map(request=>{const item=text('span','','request-preview-item'),link=text('a',requestLink(request.id),'request-preview-link'),copy=text('button','Copiar','secondary request-preview-action'),download=text('button','Baixar','secondary request-preview-action'),share=text('button','Compartilhar','secondary request-preview-action');link.href=requestLink(request.id);link.target='_blank';link.rel='noopener noreferrer';copy.type='button';copy.setAttribute('aria-label','Copiar link do serviço '+request.id);copy.onclick=async()=>{copy.disabled=true;try{await copyText(link.href);message('Link do serviço copiado. O acesso continua protegido pela conta.');}catch{message('Não foi possível copiar o link automaticamente.');}finally{copy.disabled=false;}};download.type='button';download.setAttribute('aria-label','Baixar link do serviço '+request.id);download.onclick=()=>{download.disabled=true;try{const filename=downloadRequestLink(request);message('Link autenticado preparado em '+filename+'.');}catch{message('Não foi possível baixar o link automaticamente.');}finally{download.disabled=false;}};share.type='button';share.setAttribute('aria-label','Compartilhar link do serviço '+request.id);share.onclick=()=>shareRequestLinkAction(share,request);item.append(link,copy,download,share);return item;});
}
function closeRequestSummariesPreview() {
  const preview=el('requestSummariesPreview'),button=el('previewRequestSummaries');preview.hidden=true;preview.textContent='';button.textContent='Ver resumos';button.setAttribute('aria-expanded','false');
}
function downloadRequestSummaries(requests) {
  const {filename,content}=requestSummariesPayload(requests),blob=new Blob([content],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url);return filename;
}
async function shareRequestSummaries(requests) {
  const {filename,content}=requestSummariesPayload(requests),title='Serviço Certo — resumos seguros';let file,canShareFile=false,fileRejected=false;
  try{file=new File([content],filename,{type:'text/plain;charset=utf-8'});canShareFile=Boolean(navigator.share&&navigator.canShare?.({files:[file]}));}catch{}
  if(canShareFile)try{await navigator.share({title,text:`${requests.length} resumos seguros em arquivo de texto.`,files:[file]});return {mode:'file',filename};}catch(error){if(error?.name==='AbortError')throw error;fileRejected=true;}
  if(navigator.share)try{await navigator.share({title,text:content});return {mode:fileRejected?'sharedAfterFileError':'shared',filename};}catch(error){if(error?.name==='AbortError')throw error;await copyText(content);return {mode:fileRejected?'copiedAfterFileAndTextError':'copiedAfterError',filename};}
  await copyText(content);return {mode:'copied',filename};
}
async function shareRequestSummary(request) {
  const summary=requestSummaryText(request),title='Serviço Certo — '+request.profession;let file,canShareFile=false,fileRejected=false;
  try{file=new File([summary],requestSummaryFilename(request),{type:'text/plain;charset=utf-8'});canShareFile=Boolean(navigator.share&&navigator.canShare?.({files:[file]}));}catch{}
  if(canShareFile)try{await navigator.share({title,text:'Resumo seguro do serviço em arquivo de texto.',files:[file]});return 'file';}catch(error){if(error?.name==='AbortError')throw error;fileRejected=true;}
  if(navigator.share)try{await navigator.share({title,text:summary});return 'shared';}catch(error){if(error?.name==='AbortError')throw error;await copyText(summary);return fileRejected?'copiedAfterFileAndTextError':'copiedAfterError';}
  await copyText(summary);return 'copied';
}
function clearLinkedRequest() {
  if(!linkedRequestId)return;
  linkedRequestId='';linkedRequestNeedsFocus=false;const url=new URL(location.href);url.searchParams.delete('servico');history.replaceState(null,'',url.pathname+url.search+url.hash);
}
function authCallbackUrl() {
  const url=new URL(location.pathname,location.origin);
  if(linkedRequestId)url.searchParams.set('servico',linkedRequestId);
  return url.href;
}
function rejectInvalidRecovery() {
  recovery=false;history.replaceState(null,'',authCallbackUrl());el('action').value='reset';el('action').onchange();authView();message('Link de recuperação inválido ou expirado. Informe seu e-mail para solicitar outro.');
}
function showAllRequestsButton() {
  const button=text('button','Ver todos os serviços','secondary');button.type='button';
  button.onclick=async()=>{button.disabled=true;try{clearLinkedRequest();el('requestSearch').value='';requestDisplayLimit=requestPageSize;await refresh();message('Lista completa de serviços autorizados exibida.');}catch(error){message(friendly(error));}finally{button.disabled=false;}};
  return button;
}
function switchLinkedRequestAccountButton() {
  const button=text('button','Entrar com outra conta','secondary');button.type='button';
  button.onclick=async()=>{button.disabled=true;try{check(await api.auth.signOut({scope:'local'}));recovery=false;await loadAccount(null);message('Sessão encerrada. Entre com outra conta participante para abrir este link.');}catch(error){message(friendly(error));}finally{button.disabled=false;}};
  return button;
}
async function copyText(value) {
  if(navigator.clipboard?.writeText)try {await navigator.clipboard.writeText(value);return;} catch {}
  const field=document.createElement('textarea');field.value=value;field.setAttribute('readonly','');field.style.position='fixed';field.style.opacity='0';
  document.body.append(field);field.select();const copied=document.execCommand('copy');field.remove();
  if(!copied)throw new Error('copy_failed');
}
async function busy(id, task) {
  el(id).disabled=true;
  try { await task(); } catch(error) { message(friendly(error)); } finally { el(id).disabled=false; }
}
function clearWorkspace() {
  profile=null; selected=null; exportableRequests=[]; exportableUnread=new Map(); requestPageSize=10; requestDisplayLimit=requestPageSize; el('requestPageSize').value=String(requestPageSize); ++conversationGeneration;
  closeRequestLinksPreview();closeRequestSummariesPreview();
  contracts.reset();
  execution.reset();
  cancellations.reset();
  extras.reset();
  disputes.reset();
  inspections.reset();
  for(const id of ['workspace','clientPanel','providerPanel','providerApply','adminPanel','conversation']) el(id).hidden=true;
  for(const id of ['requests','opportunities','messages','quotes','applications','identity','profile']) el(id).replaceChildren();
  for(const id of ['password','passwordConfirmation','newPassword','newPasswordConfirmation','message','description','experience','quoteAmount','quoteDescription','scheduled']) el(id).value='';
  resetPasswordVisibility();
  el('urgent').checked=false;
}
function authView() {
  el('authPanel').hidden=!!user||recovery;
  el('accountPanel').hidden=!user||recovery;
  el('recoveryPanel').hidden=!recovery;
  el('linkedRequestHint').hidden=!linkedRequestId||!!user||recovery;
  if(recovery)el('newPassword').focus();else if(!user)focusAccessField();
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
  if(linkedRequestId)el('requestSearch').value=linkedRequestId;
  await refresh(ticket);
}
async function loadRequests(ticket) {
  const requests=[];
  for(let from=0;;from+=requestBatchSize) {
    const page=check(await api.from('service_requests').select('id,profession,description,status,created_at,city,state,scheduled_for,is_urgent,provider_id').order('created_at',{ascending:false}).order('id',{ascending:false}).range(from,from+requestBatchSize-1))||[];
    if(ticket!==generation)return null;
    requests.push(...page);
    if(page.length<requestBatchSize)return requests;
  }
}
async function refresh(ticket=generation) {
  if(!profile||!user||recovery)return;
  const [requestResult,unreadResult]=await Promise.all([
    loadRequests(ticket),
    api.rpc('unread_service_message_counts')
  ]);
  if(requestResult===null||ticket!==generation)return;
  const now=Date.now(),todayStart=new Date(now);todayStart.setHours(0,0,0,0);const tomorrowStart=new Date(todayStart),dayAfterTomorrowStart=new Date(todayStart);tomorrowStart.setDate(tomorrowStart.getDate()+1);dayAfterTomorrowStart.setDate(dayAfterTomorrowStart.getDate()+2);
  const recentCutoff=now-7*24*60*60*1000,monthCutoff=now-30*24*60*60*1000,preferredWeekCutoff=now+7*24*60*60*1000,isToday=r=>{const createdAt=Date.parse(r.created_at);return createdAt>=todayStart.getTime()&&createdAt<=now;},isRecent=r=>{const createdAt=Date.parse(r.created_at);return createdAt>=recentCutoff&&createdAt<=now;},isMonth=r=>{const createdAt=Date.parse(r.created_at);return createdAt>=monthCutoff&&createdAt<=now;},isOlder=r=>{const createdAt=Date.parse(r.created_at);return Number.isFinite(createdAt)&&createdAt<monthCutoff;},isPreferredToday=r=>{const scheduledFor=Date.parse(r.scheduled_for);return scheduledFor>=todayStart.getTime()&&scheduledFor<tomorrowStart.getTime();},isPreferredTomorrow=r=>{const scheduledFor=Date.parse(r.scheduled_for);return scheduledFor>=tomorrowStart.getTime()&&scheduledFor<dayAfterTomorrowStart.getTime();},isPreferredWeek=r=>{const scheduledFor=Date.parse(r.scheduled_for);return scheduledFor>now&&scheduledFor<=preferredWeekCutoff;},isPreferredLater=r=>Date.parse(r.scheduled_for)>preferredWeekCutoff,isUpcoming=r=>Date.parse(r.scheduled_for)>now,isPastPreferred=r=>{const scheduledFor=Date.parse(r.scheduled_for);return Number.isFinite(scheduledFor)&&scheduledFor<now;};
  const statusOrder={aberto:0,aceito:1,em_andamento:2,concluido:3,cancelado:4},preferredTime=r=>{const value=Date.parse(r.scheduled_for);return Number.isFinite(value)?value:null;},sortPreferred=(a,b,direction)=>{const aTime=preferredTime(a),bTime=preferredTime(b);return Number(aTime===null)-Number(bTime===null)||(aTime!==null&&bTime!==null?direction*(aTime-bTime):0)||new Date(b.created_at)-new Date(a.created_at);};
  const requests=requestResult,unread=new Map((check(unreadResult)||[]).map(x=>[x.request_id,Number(x.unread_count)])),filter=el('requestFilter').value,sort=el('requestSort').value,
    query=el('requestSearch').value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR'),
    visibleRequests=requests.filter(r=>{
      const matchesStatus=filter==='all'||(filter==='today'&&isToday(r))||(filter==='recent'&&isRecent(r))||(filter==='month'&&isMonth(r))||(filter==='older'&&isOlder(r))||(filter==='active'&&['aberto','aceito','em_andamento'].includes(r.status))||(filter==='waiting'&&r.status==='aberto')||(filter==='servicing'&&['aceito','em_andamento'].includes(r.status))||(filter==='accepted'&&r.status==='aceito')||(filter==='inProgress'&&r.status==='em_andamento')||(filter==='completed'&&r.status==='concluido')||(filter==='cancelled'&&r.status==='cancelado')||(filter==='history'&&['concluido','cancelado'].includes(r.status))||(filter==='urgent'&&r.is_urgent)||(filter==='scheduled'&&r.scheduled_for)||(filter==='preferredToday'&&isPreferredToday(r))||(filter==='preferredTomorrow'&&isPreferredTomorrow(r))||(filter==='preferredWeek'&&isPreferredWeek(r))||(filter==='preferredLater'&&isPreferredLater(r))||(filter==='upcoming'&&isUpcoming(r))||(filter==='pastPreferred'&&isPastPreferred(r))||(filter==='withoutPreferred'&&!r.scheduled_for)||(filter==='unread'&&(unread.get(r.id)||0)>0)||(filter==='withoutUnread'&&(unread.get(r.id)||0)===0);
      const searchable=(r.id+' '+r.profession+' '+r.description+' '+r.city+' '+r.state+' '+r.status.replaceAll('_',' ')+' '+(labels[r.status]||'')+' '+requestDateSearchValue(r.created_at)+' '+requestDateSearchValue(r.scheduled_for)).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
      return linkedRequestId?r.id===linkedRequestId:matchesStatus&&(!query||searchable.includes(query));
    }).sort((a,b)=>sort==='oldest'?new Date(a.created_at)-new Date(b.created_at):sort==='profession'?(a.profession.localeCompare(b.profession,'pt-BR',{sensitivity:'base'})||new Date(b.created_at)-new Date(a.created_at)):sort==='region'?((a.city||'').localeCompare(b.city||'','pt-BR',{sensitivity:'base'})||(a.state||'').localeCompare(b.state||'','pt-BR',{sensitivity:'base'})||new Date(b.created_at)-new Date(a.created_at)):sort==='status'?((statusOrder[a.status]??99)-(statusOrder[b.status]??99)||new Date(b.created_at)-new Date(a.created_at)):sort==='unread'?((unread.get(b.id)||0)-(unread.get(a.id)||0)||new Date(b.created_at)-new Date(a.created_at)):sort==='urgent'?(Number(b.is_urgent)-Number(a.is_urgent)||new Date(b.created_at)-new Date(a.created_at)):sort==='schedule'?sortPreferred(a,b,1):sort==='scheduleDesc'?sortPreferred(a,b,-1):new Date(b.created_at)-new Date(a.created_at)),
    todayCount=requests.filter(isToday).length,
    recentCount=requests.filter(isRecent).length,
    monthCount=requests.filter(isMonth).length,
    olderCount=requests.filter(isOlder).length,
    activeCount=requests.filter(r=>['aberto','aceito','em_andamento'].includes(r.status)).length,
    waitingCount=requests.filter(r=>r.status==='aberto').length,
    servicingCount=requests.filter(r=>['aceito','em_andamento'].includes(r.status)).length,
    acceptedCount=requests.filter(r=>r.status==='aceito').length,
    inProgressCount=requests.filter(r=>r.status==='em_andamento').length,
    completedCount=requests.filter(r=>r.status==='concluido').length,
    cancelledCount=requests.filter(r=>r.status==='cancelado').length,
    historyCount=requests.filter(r=>['concluido','cancelado'].includes(r.status)).length,
    urgentCount=requests.filter(r=>r.is_urgent).length,
    scheduledCount=requests.filter(r=>r.scheduled_for).length,
    preferredTodayCount=requests.filter(isPreferredToday).length,
    preferredTomorrowCount=requests.filter(isPreferredTomorrow).length,
    preferredWeekCount=requests.filter(isPreferredWeek).length,
    preferredLaterCount=requests.filter(isPreferredLater).length,
    upcomingCount=requests.filter(isUpcoming).length,
    pastPreferredCount=requests.filter(isPastPreferred).length,
    withoutPreferredCount=requests.filter(r=>!r.scheduled_for).length,
    unreadCount=requests.filter(r=>(unread.get(r.id)||0)>0).length,
    withoutUnreadCount=requests.filter(r=>(unread.get(r.id)||0)===0).length,
    displayedRequests=visibleRequests.slice(0,requestDisplayLimit);
  if(ticket!==generation)return;
  closeRequestLinksPreview();closeRequestSummariesPreview();
  exportableRequests=visibleRequests;
  exportableUnread=new Map(visibleRequests.map(r=>[r.id,unread.get(r.id)||0]));
  const filterLabels={all:`Todos (${requests.length})`,today:`Solicitados hoje (${todayCount})`,recent:`Solicitados nos últimos 7 dias (${recentCount})`,month:`Solicitados nos últimos 30 dias (${monthCount})`,older:`Solicitados há mais de 30 dias (${olderCount})`,active:`Ativos (${activeCount})`,waiting:`Aguardando profissional (${waitingCount})`,servicing:`Em atendimento (${servicingCount})`,accepted:`Aceitos (${acceptedCount})`,inProgress:`Em andamento (${inProgressCount})`,completed:`Concluídos (${completedCount})`,cancelled:`Cancelados (${cancelledCount})`,history:`Histórico (${historyCount})`,urgent:`Urgentes (${urgentCount})`,scheduled:`Com horário preferido (${scheduledCount})`,preferredToday:`Horário preferido hoje (${preferredTodayCount})`,preferredTomorrow:`Horário preferido amanhã (${preferredTomorrowCount})`,preferredWeek:`Horário preferido nos próximos 7 dias (${preferredWeekCount})`,preferredLater:`Horário preferido após 7 dias (${preferredLaterCount})`,upcoming:`Horário preferido futuro (${upcomingCount})`,pastPreferred:`Horário preferido passado (${pastPreferredCount})`,withoutPreferred:`Sem horário preferido (${withoutPreferredCount})`,unread:`Mensagens novas (${unreadCount})`,withoutUnread:`Sem mensagens novas (${withoutUnreadCount})`};
  for(const option of el('requestFilter').options)option.textContent=filterLabels[option.value];
  el('requestSummary').textContent=visibleRequests.length>requestDisplayLimit
    ?`Exibindo ${displayedRequests.length} de ${visibleRequests.length} correspondentes · ${requests.length} serviço${requests.length===1?'':'s'} no total · ${activeCount} ativo${activeCount===1?'':'s'} · ${historyCount} no histórico · ${unreadCount} com mensagens novas.`
    :`Exibindo ${visibleRequests.length} de ${requests.length} serviço${requests.length===1?'':'s'} · ${activeCount} ativo${activeCount===1?'':'s'} · ${historyCount} no histórico · ${unreadCount} com mensagens novas.`;
  const remaining=visibleRequests.length-displayedRequests.length;
  el('requestMore').hidden=remaining<=0;el('requestMore').textContent=remaining>0?`Mostrar mais (${remaining} restante${remaining===1?'':'s'})`:'Mostrar mais';
  el('requestCollapse').hidden=requestDisplayLimit<=requestPageSize||visibleRequests.length<=requestPageSize;
  el('copyRequestCodes').disabled=!visibleRequests.length;el('previewRequestLinks').disabled=!visibleRequests.length;el('copyRequestLinks').disabled=!visibleRequests.length;el('downloadRequestLinks').disabled=!visibleRequests.length;el('shareRequestLinks').disabled=!visibleRequests.length;el('previewRequestSummaries').disabled=!visibleRequests.length;el('copyRequestSummaries').disabled=!visibleRequests.length;el('downloadRequestSummaries').disabled=!visibleRequests.length;el('shareRequestSummaries').disabled=!visibleRequests.length;el('exportRequests').disabled=!visibleRequests.length;el('exportRequestsJson').disabled=!visibleRequests.length;
  el('requests').replaceChildren();
  if(!visibleRequests.length) {
    el('requests').append(text('p',linkedRequestId?'Serviço não encontrado nesta conta. Confira o link ou entre com a conta participante.':requests.length?(query?'Nenhum serviço corresponde à busca e ao filtro selecionado.':'Nenhum serviço nesta categoria.'):'Nenhum serviço registrado.'));
    if(linkedRequestId)el('requests').append(showAllRequestsButton(),switchLinkedRequestAccountButton());
  }
  for(const r of displayedRequests) {
    const card=text('article','','service');
    card.dataset.request=r.id;
    if(r.id===linkedRequestId){card.dataset.linked='true';card.tabIndex=-1;}
    const createdAt=new Date(r.created_at),summary=[text('h3',r.profession),text('small',(labels[r.status]||r.status)+' · '+r.city+' / '+r.state)];
    if(!Number.isNaN(createdAt.getTime())) {const requestedAt=text('time','Solicitado em '+createdAt.toLocaleString('pt-BR'),'muted request-created');requestedAt.dateTime=createdAt.toISOString();summary.push(requestedAt);}
    card.append(...summary,text('p',r.description));
    const requestCode=text('small','Código: '+r.id,'service-code'),previewSummary=text('button','Ver resumo','secondary'),copyCode=text('button','Copiar código','secondary'),openLink=text('a','Abrir link','secondary service-link'),copyLink=text('button','Copiar link','secondary'),downloadLink=text('button','Baixar link','secondary'),shareLink=text('button','Compartilhar link','secondary'),copySummary=text('button','Copiar resumo','secondary'),downloadSummary=text('button','Baixar resumo','secondary'),shareSummary=text('button','Compartilhar resumo','secondary'),summaryPreview=text('pre',requestSummaryText(r),'safe-summary');previewSummary.type='button';copyCode.type='button';openLink.href=requestLink(r.id);openLink.target='_blank';openLink.rel='noopener noreferrer';copyLink.type='button';downloadLink.type='button';shareLink.type='button';copySummary.type='button';downloadSummary.type='button';shareSummary.type='button';summaryPreview.id='request-summary-'+r.id;summaryPreview.hidden=true;previewSummary.setAttribute('aria-controls',summaryPreview.id);previewSummary.setAttribute('aria-expanded','false');
    previewSummary.onclick=()=>{const opening=summaryPreview.hidden;summaryPreview.hidden=!opening;previewSummary.textContent=opening?'Ocultar resumo':'Ver resumo';previewSummary.setAttribute('aria-expanded',String(opening));};
    copyCode.onclick=async()=>{copyCode.disabled=true;try{await copyText(r.id);message('Código do serviço copiado: '+r.id);}catch{message('Não foi possível copiar automaticamente. O código continua visível no cartão.');}finally{copyCode.disabled=false;}};
    copyLink.onclick=async()=>{copyLink.disabled=true;try{await copyText(requestLink(r.id));message('Link do serviço copiado. O acesso continua protegido pela conta.');}catch{message('Não foi possível copiar o link automaticamente.');}finally{copyLink.disabled=false;}};
    downloadLink.onclick=()=>{downloadLink.disabled=true;try{const filename=downloadRequestLink(r);message('Link autenticado preparado em '+filename+'.');}catch{message('Não foi possível baixar o link automaticamente.');}finally{downloadLink.disabled=false;}};
    shareLink.onclick=()=>shareRequestLinkAction(shareLink,r);
    copySummary.onclick=async()=>{copySummary.disabled=true;try{await copyText(requestSummaryText(r));message('Resumo do serviço copiado sem descrição ou dados dos participantes.');}catch{message('Não foi possível copiar o resumo automaticamente.');}finally{copySummary.disabled=false;}};
    downloadSummary.onclick=()=>{downloadSummary.disabled=true;try{const filename=downloadRequestSummary(r);message('Resumo seguro preparado em '+filename+'.');}catch{message('Não foi possível baixar o resumo automaticamente.');}finally{downloadSummary.disabled=false;}};
    shareSummary.onclick=async()=>{shareSummary.disabled=true;try{const result=await shareRequestSummary(r);message(result==='file'?'Arquivo de resumo seguro enviado ao compartilhamento do aparelho.':result==='shared'?'Resumo seguro enviado ao compartilhamento do aparelho.':result==='copiedAfterFileAndTextError'?'Arquivo e texto recusados. Resumo seguro copiado.':result==='copiedAfterError'?'Compartilhamento recusado. Resumo seguro copiado.':'Compartilhamento indisponível. Resumo seguro copiado.');}catch(error){message(error?.name==='AbortError'?'Compartilhamento cancelado.':'Não foi possível compartilhar o resumo.');}finally{shareSummary.disabled=false;}};
    card.append(requestCode,previewSummary,copyCode,openLink,copyLink,downloadLink,shareLink,copySummary,downloadSummary,shareSummary,summaryPreview);
    if(r.id===linkedRequestId)card.append(showAllRequestsButton());
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
      if(r.scheduled_for){const date=new Date(r.scheduled_for);if(!Number.isNaN(date.getTime()))schedule.value=new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);}
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
  if(linkedRequestNeedsFocus) {
    const linkedCard=el('requests').querySelector(`[data-request="${CSS.escape(linkedRequestId)}"]`);
    if(linkedCard){linkedRequestNeedsFocus=false;linkedCard.focus();message('Serviço aberto pelo link. Confira os dados e as ações disponíveis.');}
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
  pendingConfirmationEmail='';el('resendConfirmation').hidden=true;
  el('registration').hidden=action!=='signup';el('name').required=action==='signup';
  el('passwordArea').hidden=action==='reset';el('password').required=action!=='reset';
  el('passwordConfirmationArea').hidden=action!=='signup';el('passwordConfirmation').required=action==='signup';
  el('password').autocomplete=action==='signup'?'new-password':'current-password';el('password').value='';el('passwordConfirmation').value='';
  resetPasswordVisibility();hideCapsLockWarnings();
  if(action!=='signup'){el('name').value='';el('role').value='cliente';}
  el('submit').textContent=({login:'Entrar',signup:'Criar conta',reset:'Enviar instruções'})[action];message('');
  focusAccessField();
};
el('action').onchange();
el('authForm').onsubmit=event=>{event.preventDefault();busy('submit',async()=>{
  const email=el('email').value.trim(),password=el('password').value,passwordConfirmation=el('passwordConfirmation').value,action=el('action').value;
  pendingConfirmationEmail='';el('resendConfirmation').hidden=true;
  try {
    if(action!=='reset'&&password.length<8)throw new InputError('Senha deve ter pelo menos 8 caracteres.');
    if(action==='signup') {
      if(password!==passwordConfirmation)throw new InputError('As senhas não coincidem.');
      const full_name=el('name').value.trim();if(!full_name)throw new InputError('Informe seu nome.');
      const data=check(await api.auth.signUp({email,password,options:{emailRedirectTo:authCallbackUrl(),data:{full_name,requested_role:el('role').value}}}));
      if(data.session)await loadAccount(data.user);
      else {el('action').value='login';el('action').onchange();pendingConfirmationEmail=email;el('resendConfirmation').hidden=false;message('Cadastro solicitado. Verifique seu e-mail para confirmar a conta. O perfil de prestador depende de análise.');el('password').focus();}
    }else if(action==='reset') {
      check(await api.auth.resetPasswordForEmail(email,{redirectTo:authCallbackUrl()}));el('action').value='login';el('action').onchange();el('email').value=email;message('Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.');el('password').focus();
    }else {
      const data=check(await api.auth.signInWithPassword({email,password}));message('');await loadAccount(data.user);
    }
  }catch(error){
    if(action==='signup'&&['email_exists','user_already_exists'].includes(error?.code)){
      el('action').value='login';el('action').onchange();el('email').value=email;el('password').focus();
      throw new InputError('Não foi possível concluir o cadastro. Entre com sua conta ou use Recuperar senha.');
    }
    if(action==='signup'&&['signup_disabled','email_provider_disabled'].includes(error?.code)){
      el('action').value='login';el('action').onchange();el('email').value=email;el('password').focus();
      throw new InputError('Novos cadastros por e-mail estão temporariamente indisponíveis. Tente entrar se já possui conta.');
    }
    if(action==='login'&&error?.code==='weak_password'){
      el('action').value='reset';el('action').onchange();el('email').value=email;el('email').focus();
      throw new InputError('Sua senha não atende mais aos requisitos de segurança. Solicite a recuperação para criar uma senha mais forte.');
    }
    if(action==='login'&&error?.code==='email_not_confirmed'){pendingConfirmationEmail=email;el('resendConfirmation').hidden=false;}
    el(action==='reset'?'email':'password').focus();throw error;
  }
  finally{if(action!=='reset'){el('password').value='';el('passwordConfirmation').value='';resetPasswordVisibility();hideCapsLockWarnings();}}
});};
el('resendConfirmation').onclick=()=>busy('resendConfirmation',async()=>{
  if(!pendingConfirmationEmail){el('resendConfirmation').hidden=true;return;}
  check(await api.auth.resend({type:'signup',email:pendingConfirmationEmail,options:{emailRedirectTo:authCallbackUrl()}}));
  pendingConfirmationEmail='';el('resendConfirmation').hidden=true;message('Novo e-mail de confirmação solicitado. Aguarde antes de tentar novamente.');
});
el('recoveryForm').onsubmit=event=>{event.preventDefault();busy('savePassword',async()=>{
  const password=el('newPassword').value,passwordConfirmation=el('newPasswordConfirmation').value;
  try {
    if(password.length<8)throw new InputError('A nova senha precisa de pelo menos 8 caracteres.');
    if(password!==passwordConfirmation)throw new InputError('As senhas não coincidem.');
    check(await api.auth.updateUser({password}));check(await api.auth.signOut({scope:'global'}));recovery=false;
    history.replaceState(null,'',authCallbackUrl());await loadAccount(null);message('Senha atualizada. Por segurança, entre novamente neste e nos outros aparelhos.');
  }catch(error){el('newPassword').focus();throw error;}
  finally{el('newPassword').value='';el('newPasswordConfirmation').value='';resetPasswordVisibility();hideCapsLockWarnings();}
});};
el('cancelRecovery').onclick=()=>busy('cancelRecovery',async()=>{
  check(await api.auth.signOut({scope:'local'}));recovery=false;
  history.replaceState(null,'',authCallbackUrl());await loadAccount(null);message('Recuperação cancelada. Entre para continuar.');
});
el('logout').onclick=()=>busy('logout',async()=>{check(await api.auth.signOut({scope:'local'}));recovery=false;await loadAccount(null);message('Sessão encerrada.');});
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
el('requestFilter').onchange=()=>{requestDisplayLimit=requestPageSize;busy('refresh',()=>refresh());};
el('requestSort').onchange=()=>{requestDisplayLimit=requestPageSize;busy('refresh',()=>refresh());};
el('requestPageSize').onchange=()=>{requestPageSize=Number(el('requestPageSize').value);requestDisplayLimit=requestPageSize;busy('refresh',()=>refresh());};
el('requestSearchForm').onsubmit=event=>{event.preventDefault();clearLinkedRequest();requestDisplayLimit=requestPageSize;busy('searchRequests',()=>refresh());};
el('cancelLinkedRequest').onclick=()=>{clearLinkedRequest();el('requestSearch').value='';authView();message('Abertura pelo link cancelada. Entre para acessar seus serviços normalmente.');};
el('clearRequestSearch').onclick=()=>{clearLinkedRequest();el('requestSearch').value='';requestDisplayLimit=requestPageSize;busy('clearRequestSearch',()=>refresh());};
el('clearRequestFilters').onclick=()=>{
  clearLinkedRequest();el('requestSearch').value='';el('requestFilter').value='all';el('requestSort').value='recent';requestDisplayLimit=requestPageSize;busy('clearRequestFilters',()=>refresh());
};
el('requestMore').onclick=()=>{requestDisplayLimit+=requestPageSize;busy('requestMore',()=>refresh());};
el('requestCollapse').onclick=()=>{requestDisplayLimit=requestPageSize;busy('requestCollapse',()=>refresh());};
el('copyRequestCodes').onclick=async()=>{
  const button=el('copyRequestCodes');button.disabled=true;
  try {await copyText(exportableRequests.map(request=>request.id).join('\n'));message(`${exportableRequests.length} ${exportableRequests.length===1?'código copiado':'códigos copiados'} da lista filtrada.`);}
  catch {message('Não foi possível copiar automaticamente os códigos. Tente novamente.');}
  finally {button.disabled=!exportableRequests.length;}
};
el('copyRequestLinks').onclick=async()=>{
  const button=el('copyRequestLinks');button.disabled=true;
  try {await copyText(exportableRequests.map(request=>requestLink(request.id)).join('\n'));message(`${exportableRequests.length} ${exportableRequests.length===1?'link autenticado copiado':'links autenticados copiados'} da lista filtrada.`);}
  catch {message('Não foi possível copiar automaticamente os links. Tente novamente.');}
  finally {button.disabled=!exportableRequests.length;}
};
el('previewRequestLinks').onclick=()=>{
  const button=el('previewRequestLinks'),preview=el('requestLinksPreview'),opening=preview.hidden;
  if(opening){closeRequestSummariesPreview();preview.replaceChildren(...requestLinkPreview(exportableRequests));}else preview.replaceChildren();
  preview.hidden=!opening;button.textContent=opening?'Ocultar links':'Ver links';button.setAttribute('aria-expanded',String(opening));
};
el('downloadRequestLinks').onclick=()=>{
  const button=el('downloadRequestLinks');button.disabled=true;
  try {const filename=downloadRequestLinks(exportableRequests);message(`${exportableRequests.length} ${exportableRequests.length===1?'link autenticado preparado':'links autenticados preparados'} em ${filename}.`);}
  catch {message('Não foi possível baixar os links automaticamente.');}
  finally {button.disabled=!exportableRequests.length;}
};
el('shareRequestLinks').onclick=async()=>{
  const button=el('shareRequestLinks'),count=exportableRequests.length,label=count===1?'link autenticado':'links autenticados',shared=count===1?'compartilhado':'compartilhados',sent=count===1?'enviado':'enviados',copied=count===1?'copiado':'copiados';button.disabled=true;
  try {const result=await shareRequestLinks(exportableRequests);message(result.mode==='file'?`${count} ${label} ${shared} em ${result.filename}.`:result.mode==='sharedAfterFileError'?`Arquivo recusado. ${count} ${label} ${sent} como texto.`:result.mode==='shared'?`${count} ${label} ${sent} para compartilhamento.`:result.mode==='copiedAfterFileAndTextError'?`Arquivo e texto recusados. ${count} ${label} ${copied}.`:result.mode==='copiedAfterError'?`${count} ${label} ${copied} após falha no compartilhamento.`:`${count} ${label} ${copied} porque o compartilhamento não está disponível.`);}
  catch(error) {message(error?.name==='AbortError'?'Compartilhamento cancelado.':'Não foi possível compartilhar os links.');}
  finally {button.disabled=!exportableRequests.length;}
};
el('previewRequestSummaries').onclick=()=>{
  const button=el('previewRequestSummaries'),preview=el('requestSummariesPreview'),opening=preview.hidden;
  if(opening){closeRequestLinksPreview();preview.textContent=requestSummariesPayload(exportableRequests).content;}else preview.textContent='';
  preview.hidden=!opening;button.textContent=opening?'Ocultar resumos':'Ver resumos';button.setAttribute('aria-expanded',String(opening));
};
el('copyRequestSummaries').onclick=async()=>{
  const button=el('copyRequestSummaries');button.disabled=true;
  try {await copyText(requestSummariesPayload(exportableRequests).content);message(`${exportableRequests.length} ${exportableRequests.length===1?'resumo seguro copiado':'resumos seguros copiados'} da lista filtrada.`);}
  catch {message('Não foi possível copiar automaticamente os resumos. Tente novamente.');}
  finally {button.disabled=!exportableRequests.length;}
};
el('downloadRequestSummaries').onclick=()=>{
  const button=el('downloadRequestSummaries');button.disabled=true;
  try {const filename=downloadRequestSummaries(exportableRequests);message(`${exportableRequests.length} ${exportableRequests.length===1?'resumo seguro preparado':'resumos seguros preparados'} em ${filename}.`);}
  catch {message('Não foi possível baixar os resumos automaticamente.');}
  finally {button.disabled=!exportableRequests.length;}
};
el('shareRequestSummaries').onclick=async()=>{
  const button=el('shareRequestSummaries'),count=exportableRequests.length,label=count===1?'resumo seguro':'resumos seguros',shared=count===1?'compartilhado':'compartilhados',sent=count===1?'enviado':'enviados',copied=count===1?'copiado':'copiados';button.disabled=true;
  try {const result=await shareRequestSummaries(exportableRequests);message(result.mode==='file'?`${count} ${label} ${shared} em ${result.filename}.`:result.mode==='sharedAfterFileError'?`Arquivo recusado. ${count} ${label} ${sent} como texto.`:result.mode==='shared'?`${count} ${label} ${sent} para compartilhamento.`:result.mode==='copiedAfterFileAndTextError'?`Arquivo e texto recusados. ${count} ${label} ${copied}.`:result.mode==='copiedAfterError'?`${count} ${label} ${copied} após falha no compartilhamento.`:`${count} ${label} ${copied} porque o compartilhamento não está disponível.`);}
  catch(error) {message(error?.name==='AbortError'?'Compartilhamento cancelado.':'Não foi possível compartilhar os resumos.');}
  finally {button.disabled=!exportableRequests.length;}
};
el('exportRequests').onclick=()=>{
  const csvCell=value=>{let cell=String(value??'').replace(/[\r\n]+/g,' ');if(/^[\t ]*[=+\-@]/.test(cell))cell="'"+cell;return `"${cell.replaceAll('"','""')}"`;},
    csvLocalDate=value=>{const date=new Date(value);return value&&!Number.isNaN(date.getTime())?date.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'';},
    fileSlug=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''),
    roleLabel=profile?.role==='cliente'?'Cliente':profile?.role==='prestador'?'Prestador':'',
    rows=[['Código','Profissão','Situação','Situação (código)','Meu papel','Mensagens novas','Descrição','Cidade','UF','Urgente','Horário preferido','Horário preferido (ISO)','Solicitado em','Solicitado em (ISO)'],...exportableRequests.map(r=>[r.id,r.profession,labels[r.status]||r.status,r.status,roleLabel,exportableUnread.get(r.id)||0,r.description,r.city,r.state,r.is_urgent?'Sim':'Não',csvLocalDate(r.scheduled_for),r.scheduled_for||'',csvLocalDate(r.created_at),r.created_at])],
    blob=new Blob(['\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a'),now=new Date(),day=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-'),filterName=el('requestFilter').selectedOptions[0]?.textContent.replace(/\s+\(\d+\)$/,'')||'filtrados',filterSlug=fileSlug(filterName)||'filtrados',searchSlug=fileSlug(el('requestSearch').value.trim()).slice(0,40).replace(/-$/,''),sortSlug=el('requestSort').value==='recent'?'':fileSlug(el('requestSort').selectedOptions[0]?.textContent),contextSlug=[filterSlug,searchSlug,sortSlug].filter(Boolean).join('-'),filename=`servicos-${contextSlug}-${day}.csv`;
  link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url);message(`Download preparado: ${exportableRequests.length} ${exportableRequests.length===1?'serviço':'serviços'} em ${filename}.`);
};
el('exportRequestsJson').onclick=()=>{
  const fileSlug=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''),
    now=new Date(),day=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-'),filter=el('requestFilter').selectedOptions[0]?.textContent.replace(/\s+\(\d+\)$/,'')||'Filtrados',search=el('requestSearch').value.trim(),sort=el('requestSort').selectedOptions[0]?.textContent||'Mais recentes',role=profile?.role==='cliente'?'Cliente':profile?.role==='prestador'?'Prestador':'',filterSlug=fileSlug(filter)||'filtrados',searchSlug=fileSlug(search).slice(0,40).replace(/-$/,''),sortSlug=el('requestSort').value==='recent'?'':fileSlug(sort),contextSlug=[filterSlug,searchSlug,sortSlug].filter(Boolean).join('-'),filename=`servicos-${contextSlug}-${day}.json`,
    payload={version:1,exportedAt:now.toISOString(),context:{filter,search,sort,role},services:exportableRequests.map(r=>({id:r.id,profession:r.profession,status:r.status,statusLabel:labels[r.status]||r.status,role,unreadMessages:exportableUnread.get(r.id)||0,description:r.description,city:r.city,state:r.state,urgent:!!r.is_urgent,scheduledFor:r.scheduled_for||null,createdAt:r.created_at}))},blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url);message(`JSON preparado: ${exportableRequests.length} ${exportableRequests.length===1?'serviço':'serviços'} em ${filename}.`);
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
  if(event==='SIGNED_OUT'){++generation;user=null;clearWorkspace();authView();message('Sua sessão terminou. Entre novamente para continuar.');}
  if(event==='SIGNED_IN'&&!recovery)setTimeout(()=>loadAccount(session.user).catch(e=>message(friendly(e))),0);
});
authView();
if(invalidLinkedRequest)message('Link de serviço inválido. Entre para acessar seus serviços normalmente.');
try { const {user:current}=check(await api.auth.getUser());if(recovery&&!current)rejectInvalidRecovery();else await loadAccount(current); }
catch(error){if(error?.name==='AuthSessionMissingError'&&recovery)rejectInvalidRecovery();else if(error?.name!=='AuthSessionMissingError')message(friendly(error));}
