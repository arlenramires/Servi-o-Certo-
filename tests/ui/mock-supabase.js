// UI contract double only. PostgreSQL/RLS are verified separately in database.test.mjs.
const state=window.testState={user:null,role:window.testRole||'cliente',requests:[],messages:[],quotes:[],decisions:[],contracts:[],contractDecisions:[],calls:[],applications:[]};
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
    let data=({profiles:[{id:account.id,role:state.role,full_name:'Pessoa de teste',is_available:true}],professions:[{id:1,name:'Eletricista'},{id:2,name:'Pintor'}],provider_applications:state.applications,service_requests:state.requests,provider_service_areas:[],service_messages:state.messages,service_quotes:state.quotes,service_quote_decisions:state.decisions,service_contracts:state.contracts,service_contract_decisions:state.contractDecisions})[this.table]||[];
    if(this.table==='profiles'&&window.missingProfile)data=[];
    for(const [key,value] of this.filters)data=data.filter(r=>Array.isArray(value)?value.includes(r[key]):r[key]===value);
    return {data:this.single?(data[0]||null):data,error:null};
  }
}
export function createClient(){return {
  from:table=>new Query(table),
  rpc:async(name,args)=>{
    state.calls.push({rpc:name,args});
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
