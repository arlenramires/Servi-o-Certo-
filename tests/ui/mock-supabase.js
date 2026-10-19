// UI contract double only. PostgreSQL/RLS are verified separately in database.test.mjs.
const state=window.testState={user:null,role:window.testRole||'cliente',requests:[],messages:[],messageReads:[],quotes:[],decisions:[],contracts:[],contractDecisions:[],executionEvents:[],ratings:[],cancellations:[],extras:[],disputes:[],inspections:[],calls:[],applications:[]};
let listener=()=>{};
const response=data=>Promise.resolve({data,error:null});
const account={id:'10000000-0000-4000-8000-000000000001',email:'teste@example.invalid'};
class Query {
  constructor(table){this.table=table;this.filters=[];this.operation='select';}
  select(){return this;} eq(k,v){this.filters.push([k,v]);return this;} order(){return this;} limit(){return this;}
  in(k,v){this.filters.push([k,v]);return this;}
  maybeSingle(){this.single=true;return this;}
  insert(data){this.operation='insert';this.payload=data;return this;}
  upsert(data){this.operation='upsert';this.payload=data;return this;}
  then(resolve,reject){return this.execute().then(resolve,reject);}
  async execute(){
    state.calls.push({table:this.table,operation:this.operation,payload:this.payload});
    if(this.operation==='insert'){
      const item={id:'request-'+Date.now(),created_at:new Date().toISOString(),status:'aberto',...this.payload};
      if(this.table==='service_requests')state.requests.push(item);
      if(this.table==='service_messages')state.messages.push(item);
      if(this.table==='service_quotes')state.quotes.push({...item,status:'proposta'});
      if(this.table==='service_quote_decisions')state.decisions.push(item);
      if(this.table==='provider_applications')state.applications.push({...item,status:'pendente'});
      return {data:null,error:null};
    }
    let data=({profiles:[{id:account.id,role:state.role,full_name:'Pessoa de teste',is_available:true}],professions:[{id:1,name:'Eletricista'},{id:2,name:'Pintor'}],provider_applications:state.applications,service_requests:state.requests,provider_service_areas:[],service_messages:state.messages,service_quotes:state.quotes,service_quote_decisions:state.decisions,service_contracts:state.contracts,service_contract_decisions:state.contractDecisions,service_execution_events:state.executionEvents,service_ratings:state.ratings,service_cancellations:state.cancellations,service_extras:state.extras,service_disputes:state.disputes,service_inspections:state.inspections})[this.table]||[];
    if(this.table==='profiles'&&window.missingProfile)data=[];
    for(const [key,value] of this.filters)data=data.filter(r=>Array.isArray(value)?value.includes(r[key]):r[key]===value);
    return {data:this.single?(data[0]||null):data,error:null};
  }
}
export function createClient(){return {
  from:table=>new Query(table),
  rpc:async(name,args)=>{
    state.calls.push({rpc:name,args});
    if(name==='unread_service_message_counts') {
      const rows=state.requests.map(request=>({request_id:request.id,unread_count:state.messages.filter(m=>m.request_id===request.id&&m.sender_id!==account.id&&new Date(m.created_at)>new Date(state.messageReads.find(x=>x.request_id===request.id&&x.user_id===account.id)?.read_through||0)).length})).filter(x=>x.unread_count);
      return {data:rows,error:null};
    }
    if(name==='mark_conversation_read') {
      const item=state.messageReads.find(x=>x.request_id===args.p_request_id&&x.user_id===account.id),read_through=new Date().toISOString();
      if(item)item.read_through=read_through;else state.messageReads.push({request_id:args.p_request_id,user_id:account.id,read_through});
      return {data:true,error:null};
    }
    if(name==='propose_service_contract') {
      const r=state.requests.find(r=>r.id===args.p_request_id),decision=state.decisions.find(d=>d.request_id===r.id&&d.decision==='aceita'),q=state.quotes.find(q=>q.id===decision.quote_id);
      const version=state.contracts.filter(c=>c.request_id===r.id).length+1,id='contract-'+version;
      state.contracts.push({id,request_id:r.id,quote_id:q.id,client_id:r.client_id,provider_id:r.provider_id,version,content_hash:String(version).repeat(64),created_at:new Date().toISOString(),document:{version,scope:q.description,amount_cents:q.amount_cents,client:{id:r.client_id,name:'Cliente de teste'},provider:{id:r.provider_id,name:'Prestador de teste'},starts_at:args.p_starts_at,ends_at:args.p_ends_at,responsibilities:args.p_responsibilities,stages:args.p_stages}});
      return {data:id,error:null};
    }
    if(name==='decide_service_contract') {
      if(!state.contractDecisions.some(d=>d.contract_id===args.p_contract_id&&d.actor_id===account.id))state.contractDecisions.push({contract_id:args.p_contract_id,actor_id:account.id,decision:args.p_decision,content_hash:args.p_content_hash,created_at:new Date().toISOString()});
      return {data:true,error:null};
    }
    const request=state.requests.find(r=>r.id===args?.p_request_id);
    if(name==='propose_service_extra'){
      const id='extra-'+Date.now();state.extras.push({id,request_id:request.id,provider_id:account.id,description:args.p_description,amount_cents:args.p_amount_cents,status:'proposto',decided_by:null,created_at:new Date().toISOString(),decided_at:null});return {data:id,error:null};
    }
    if(name==='decide_service_extra'){
      const extra=state.extras.find(x=>x.id===args.p_extra_id);extra.status=args.p_decision;extra.decided_by=account.id;extra.decided_at=new Date().toISOString();return {data:true,error:null};
    }
    if(name==='open_service_dispute'){
      const id='dispute-'+Date.now();state.disputes.push({id,request_id:request.id,opened_by:account.id,category:args.p_category,description:args.p_description,status:'aberta',response_by:null,response_body:null,created_at:new Date().toISOString(),responded_at:null});return {data:id,error:null};
    }
    if(name==='respond_service_dispute'){
      const dispute=state.disputes.find(x=>x.id===args.p_dispute_id);dispute.status='respondida';dispute.response_by=account.id;dispute.response_body=args.p_response;dispute.responded_at=new Date().toISOString();return {data:true,error:null};
    }
    if(name==='propose_service_inspection'){
      const id='inspection-'+Date.now();state.inspections.push({id,request_id:request.id,provider_id:account.id,purpose:args.p_purpose,scheduled_for:args.p_scheduled_for,fee_cents:args.p_fee_cents,status:'proposta',decided_by:null,created_at:new Date().toISOString(),decided_at:null});return {data:id,error:null};
    }
    if(name==='decide_service_inspection'){
      const inspection=state.inspections.find(x=>x.id===args.p_inspection_id);inspection.status=args.p_decision;inspection.decided_by=account.id;inspection.decided_at=new Date().toISOString();return {data:true,error:null};
    }
    if(name==='cancel_service_before_start'){
      request.status='cancelado';let replacement=null;
      if(state.role==='prestador'){
        replacement='replacement-'+Date.now();state.requests.push({...request,id:replacement,status:'aberto',provider_id:null,replaces_request_id:request.id,created_at:new Date().toISOString()});
      }
      if(!state.cancellations.some(c=>c.request_id===request.id))state.cancellations.push({request_id:request.id,actor_id:account.id,actor_role:state.role,reason:args.p_reason,outcome:replacement?'reencaminhado_prestador':'cancelado_cliente',replacement_request_id:replacement,fee_status:'nao_avaliada'});
      return {data:replacement,error:null};
    }
    if(name==='start_service'){request.status='em_andamento';if(!state.executionEvents.some(e=>e.request_id===request.id&&e.event_type==='iniciado'))state.executionEvents.push({request_id:request.id,actor_id:account.id,event_type:'iniciado',created_at:new Date().toISOString()});return {data:true,error:null};}
    if(name==='request_service_completion'){if(!state.executionEvents.some(e=>e.request_id===request.id&&e.event_type==='conclusao_solicitada'))state.executionEvents.push({request_id:request.id,actor_id:account.id,event_type:'conclusao_solicitada',created_at:new Date().toISOString()});return {data:true,error:null};}
    if(name==='confirm_service_completion'){request.status='concluido';if(!state.executionEvents.some(e=>e.request_id===request.id&&e.event_type==='conclusao_confirmada'))state.executionEvents.push({request_id:request.id,actor_id:account.id,event_type:'conclusao_confirmada',created_at:new Date().toISOString()});return {data:true,error:null};}
    if(name==='rate_completed_service'){const id='rating-'+Date.now();state.ratings.push({id,request_id:request.id,reviewer_id:account.id,reviewee_id:request.provider_id===account.id?request.client_id:request.provider_id,score:args.p_score,comment:args.p_comment,created_at:new Date().toISOString()});return {data:id,error:null};}
    return {data:name==='available_requests'?[{request_id:'open-request',requested_profession:'Eletricista',requested_at:new Date().toISOString()}]:name==='accept_request'?false:true,error:null};
  },
  auth:{
    onAuthStateChange:fn=>{listener=fn;return {data:{subscription:{unsubscribe(){}}}};},
    getUser:()=>response({user:state.user}),
    signInWithPassword:async values=>{state.calls.push({auth:'login',values});if(values.password==='wrongpass')return {error:{code:'invalid_credentials'},data:{}};state.user=account;return {data:{user:account},error:null};},
    signUp:values=>{state.calls.push({auth:'signup',values});return response({user:account,session:null});},
    resetPasswordForEmail:(email,options)=>{state.calls.push({auth:'reset',email,options});return response({});},
    updateUser:values=>{state.calls.push({auth:'update',values});return response({user:account});},
    signOut:()=>{state.user=null;listener('SIGNED_OUT',null);return response({});}
  }
};}
