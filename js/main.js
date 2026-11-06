// Ita Burger — inicialização
// Tenta Supabase primeiro (se configurado), senão usa o rascunho local / JSON empacotado.

(async function(){
  shell();
  if(typeof sbLoad==='function'&&sbOn){
    try{
      const remote=await sbLoad();
      if(remote&&remote.v!==undefined){DATA=remote;S=clone(DATA);normState();LS.del('ita-draft');SS.del('ita-pub')}
    }catch(e){console.warn('[ita] Supabase load falhou, usando dados locais:',e&&e.message)}
  }
  cleanCart();saveCart();initBP();renderAll();
  const pb=document.querySelector('#btn-publish');if(pb&&sbOn)pb.textContent='Salvar no Supabase';
  setInterval(()=>{if(S.ads.filter(a=>a.on&&String(a.text).trim()).length>1){adIdx++;renderAds()}},5000);
  if(SS.get('ita-reopen')==='1'){SS.del('ita-reopen');openAdmin()}
})();
