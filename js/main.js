// Ita Burger — inicialização
// Tenta Supabase primeiro (se configurado), senão usa o rascunho local / JSON empacotado.

(async function(){
  shell();
  if(typeof applyTheme==='function')applyTheme(getTheme());
  if(typeof sbLoad==='function'&&sbOn){
    try{
      const remote=await sbLoad();
      if(remote&&remote.v!==undefined){DATA=remote;S=clone(DATA);normState();LS.del('ita-draft');SS.del('ita-pub')}
    }catch(e){console.warn('[ita] Supabase load falhou, usando dados locais:',e&&e.message)}
    try{
      const list=await sbListOrders();
      if(Array.isArray(list)&&list.length){ORDERS=list;saveOrders()}
    }catch(e){/* anon não lê orders (lock) — dono logado lê no login */}
  }
  cleanCart();saveCart();initBP();renderAll();
  const pb=document.querySelector('#btn-publish');if(pb&&sbOn)pb.textContent='Salvar no Supabase';
  setInterval(()=>{if(S.ads.filter(a=>a.on&&String(a.text).trim()).length>1){adIdx++;renderAds()}},5000);
  if(typeof sbListOrders==='function'&&sbOn)setInterval(async ()=>{
    if(document.hidden)return;
    try{
      const list=await sbListOrders();
      if(!Array.isArray(list))return;
      const sig=list.length+':'+(list[0]?list[0].id+list[0].st+list[0].t:'');
      const cur=ORDERS.length+':'+(ORDERS[0]?ORDERS[0].id+ORDERS[0].st+ORDERS[0].t:'');
      if(sig!==cur){ORDERS=list;saveOrders();if(ui.admin&&(ui.atab==='orders'||ui.atab==='fin'))renderAdmin()}
    }catch(e){}
  },10000);
  if(SS.get('ita-reopen')==='1'){SS.del('ita-reopen');openAdmin()}
})();
