// Ita Burger — cliente Supabase (tabela store_state, id=1, coluna data jsonb)
// Carrega/salva o estado inteiro (mesmo JSON de data/cardapio.json).
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
