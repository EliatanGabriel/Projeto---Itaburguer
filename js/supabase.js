// Ita Burger — cliente Supabase (store_state + orders)
// Se SUPABASE_CONFIG estiver vazio ou o CDN falhar, sbOn=false (modo local).

const SUPABASE = (()=>{
  try{
    const cfg=window.SUPABASE_CONFIG||{};
    const url=String(cfg.url||"").trim(), key=String(cfg.anonKey||"").trim();
    if(!url||!key)return null;
    if(!window.supabase||!window.supabase.createClient)return null;
    return window.supabase.createClient(url,key);
  }catch(e){return null}
})();
const sbOn=!!SUPABASE;
const sbState={saving:false,error:"",updatedAt:""};
async function sbLoad(){
  if(!SUPABASE)return null;
  const {data,error}=await SUPABASE.from('store_state').select('data,updated_at').eq('id',1).maybeSingle();
  if(error)throw new Error(error.message||'Erro ao ler Supabase');
  return data?data.data||null:null;
}
async function sbSave(state){
  if(!SUPABASE)return false;
  sbState.saving=true;sbState.error="";
  const payload={id:1,data:clone(state),updated_at:new Date().toISOString()};
  const {error}=await SUPABASE.from('store_state').upsert(payload);
  sbState.saving=false;
  if(error){sbState.error=error.message||'Erro ao salvar';throw new Error(sbState.error)}
  sbState.updatedAt=payload.updated_at;
  return true;
}
function orderRow(o){return{id:o.id,t:o.t,sig:o.sig||'',name:o.name||'',mode:o.mode||'',hood:o.hood||'',items:o.items||[],sub:Number(o.sub)||0,fee:Number(o.fee)||0,total:Number(o.total)||0,pay:o.pay||'',st:o.st||'todo'}}
async function sbInsertOrder(o){
  if(!SUPABASE)return false;
  const {error}=await SUPABASE.from('orders').upsert(orderRow(o));
  if(error)throw new Error(error.message||'Erro ao inserir pedido');
  return true;
}
async function sbListOrders(){
  if(!SUPABASE)return [];
  const {data,error}=await SUPABASE.from('orders').select('id,t,sig,name,mode,hood,items,sub,fee,total,pay,st').order('t',{ascending:false}).limit(200);
  if(error)throw new Error(error.message||'Erro ao listar pedidos');
  return data||[];
}
async function sbUpdateOrder(id,patch){
  if(!SUPABASE)return false;
  const {error}=await SUPABASE.from('orders').update(patch).eq('id',id);
  if(error)throw new Error(error.message||'Erro ao atualizar pedido');
  return true;
}
async function sbDeleteOrder(id){
  if(!SUPABASE)return false;
  const {error}=await SUPABASE.from('orders').delete().eq('id',id);
  if(error)throw new Error(error.message||'Erro ao excluir pedido');
  return true;
}
