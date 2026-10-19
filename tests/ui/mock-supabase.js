// UI contract double only. PostgreSQL/RLS are verified separately in database.test.mjs.
const state=window.testState={user:null,role:window.testRole||'cliente',requests:[],messages:[],quotes:[],decisions:[],contracts:[],acceptances:[],calls:[],applications:[]};
let listener=()=>{};
const response=data=>Promise.resolve({data,error:null});
const account={id:'10000000-0000-4000-8000-000000000001',email:'teste@example.invalid'};
class Query {
  constructor(table){this.table=table;this.filters=[];this.operation='select';}
  select(){return this;} eq(k,v){this.filters.push([k,v]);return this;} order(){return this;} limit(){return this;}
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
      if(this.table==='service_contract_acceptances')state.acceptances.push(item);
      if(this.table==='provider_applications')state.applications.push({...item,status:'pendente'});
      return {data:null,error:null};
    }
    let data=({profiles:[{id:account.id,role:state.role,full_name:'Pessoa de teste',is_available:true}],professions:[{id:1,name:'Eletricista'},{id:2,name:'Pintor'}],provider_applications:state.applications,service_requests:state.requests,provider_service_areas:[],service_messages:state.messages,service_quotes:state.quotes,service_quote_decisions:state.decisions,service_contracts:state.contracts,service_contract_acceptances:state.acceptances})[this.table]||[];
    if(this.table==='profiles'&&window.missingProfile)data=[];
    for(const [key,value] of this.filters)data=data.filter(r=>r[key]===value);
    return {data:this.single?(data[0]||null):data,error:null};
  }
}
export function createClient(){return {
  from:table=>new Query(table),
  rpc:async(name,args)=>{state.calls.push({rpc:name,args});
    if(name==='create_contract_from_accepted_quote'){
      const quote=state.quotes.find(q=>q.id===args.p_quote_id),request=state.requests.find(r=>r.id===quote.request_id);
      let contract=state.contracts.find(c=>c.quote_id===quote.id);
      if(!contract){contract={id:'contract-'+quote.id,request_id:request.id,quote_id:quote.id,client_id:account.id,provider_id:'provider-id',profession:request.profession,scope_and_deadline:quote.description,amount_cents:quote.amount_cents,scheduled_for:request.scheduled_for||null,stages:[{sequence:1,title:'Execução do escopo aprovado',amount_cents:quote.amount_cents}],terms_version:1,terms_text:'Versão 1: termos de teste',content_fingerprint:'fingerprint-'+quote.id,created_at:new Date().toISOString()};state.contracts.push(contract);}
      return {data:contract.id,error:null};
    }
    return {data:name==='available_requests'?[{request_id:'open-request',requested_profession:'Eletricista',requested_at:new Date().toISOString()}]:name==='accept_request'?false:true,error:null};},
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
