export function createCancellationPanel({api,getContext,message,friendly,onChanged}) {
  const el=id=>document.getElementById(id),check=r=>{if(r.error)throw r.error;return r.data;};let target=null;
  function reset(){target=null;el('cancellationPanel').hidden=true;el('cancellationForm').reset();}
  function buttonFor(request){
    const {profile}=getContext(),allowed=profile?.role==='cliente'&&['aberto','aceito'].includes(request.status)||profile?.role==='prestador'&&request.status==='aceito';
    if(!allowed)return null;const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent=profile.role==='prestador'?'Cancelar e reencaminhar':'Cancelar pedido';button.onclick=()=>{
      target=request;el('cancellationPanel').hidden=false;el('cancellationTitle').textContent=button.textContent+' — '+request.profession;el('cancellationReason').focus();
    };return button;
  }
  el('closeCancellation').onclick=reset;
  el('cancellationForm').onsubmit=async event=>{event.preventDefault();if(!target)return;el('confirmCancellation').disabled=true;try{
    const replacement=check(await api.rpc('cancel_service_before_start',{p_request_id:target.id,p_reason:el('cancellationReason').value.trim()}));
    reset();message(replacement?'Cancelamento registrado e novo chamado criado para outro profissional. Nenhuma taxa foi cobrada.':'Pedido cancelado. Nenhuma taxa foi cobrada ou avaliada nesta etapa.');await onChanged();
  }catch(error){message(friendly(error));}finally{el('confirmCancellation').disabled=false;}};
  return {buttonFor,reset};
}
