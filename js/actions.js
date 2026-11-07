// Ita Burger — ações e eventos globais (cliques, inputs, formulários, upload de foto)
// Extraído de #ita-main (ações) no arquivo único.

const ACT={
  tab(el){ui.tab=el.dataset.id;renderTabs();renderView()},
  add(el){addProduct(el.dataset.id)},
  dec(el){decProduct(el.dataset.id)},
  pick(el){
    const g=S.builder.groups.find(x=>x.id===el.dataset.g);if(!g)return;const o=el.dataset.o;
    let sel=BP[g.id]||[];const on=sel.indexOf(o)>-1;
    if(g.type==='single'){sel=on?(g.required?sel:[]):[o]}else{sel=on?sel.filter(x=>x!==o):sel.concat(o)}
    BP[g.id]=sel;
    $$('.opt[data-g="'+g.id+'"]').forEach(b=>b.setAttribute('aria-pressed',String(sel.indexOf(b.dataset.o)>-1)));
    $('#btotal').textContent=brl(bTotal());
  },
  addbuild(el){
    const picks={};S.builder.groups.forEach(g=>{const s=(BP[g.id]||[]).slice().sort();if(s.length)picks[g.id]=s});
    const key=JSON.stringify(picks);
    const l=CART.find(x=>x.t==='b'&&!x.note&&JSON.stringify(x.picks)===key);
    if(l)l.qty++;else CART.push({u:uid(),t:'b',picks,qty:1,note:''});
    cartChanged();el.textContent='Adicionado ✓';setTimeout(()=>{const b=$('#addbuild');if(b)b.textContent='Adicionar ao carrinho'},1400);
  },
  cart(){openCart()},closecart(){closeCart()},
  lq(el){const l=CART.find(x=>x.u===el.dataset.u);if(!l)return;l.qty+=Number(el.dataset.d);cartChanged()},
  rmline(el){CART=CART.filter(x=>x.u!==el.dataset.u);cartChanged()},
  clearcart(){CART=[];cartChanged()},
  mode(el){ORDER.mode=el.dataset.v;saveOrder();applyOrderUI();renderCartLines();updateWa()},
  pay(el){ORDER.pay=el.dataset.v;saveOrder();applyOrderUI();updateWa()},
  wa(el,e){
    const errs=validate();const box=$('#errs');
    if(errs.length){
      e.preventDefault();box.hidden=false;box.className='err';
      box.innerHTML='Falta pouco para enviar:<ul>'+errs.map(x=>'<li>'+esc(x[1])+'</li>').join('')+'</ul>';
      const f=errs[0][0]&&$('#'+errs[0][0]);if(f)f.focus();if(box.scrollIntoView)box.scrollIntoView({block:'center'});return;
    }
    box.hidden=true;$('#wahint').hidden=false;logOrder();
  },
  copy(){
    const msg=buildMsg();const box=$('#msgbox');
    const fallback=()=>{box.hidden=false;box.value=msg;box.focus();box.select()};
    try{navigator.clipboard.writeText(msg).then(()=>{const b=$('[data-act=copy]');if(b){b.textContent='Mensagem copiada ✓';setTimeout(()=>{b.textContent='Copiar mensagem do pedido'},1800)}},fallback)}catch(e){fallback()}
  },
  gobuild(){if(S.builder.on){ui.page='menu';ui.tab='build';renderPage();renderTabs();renderView();scrollTo(0,0)}},
  gomenu(){ui.page='menu';renderPage();renderTabs();renderView();scrollTo(0,0)},
  home(){ui.page='home';renderPage();scrollTo(0,0)},
  goabout(){ui.page='about';renderPage();scrollTo(0,0)},
  goloc(){ui.page='home';renderPage();setTimeout(()=>{const el=$('#locsec');if(el&&el.scrollIntoView)el.scrollIntoView({behavior:'smooth'})},30)},
  fm(el){ui.fm=el.dataset.set!==undefined?Number(el.dataset.set):ui.fm+Number(el.dataset.v);renderAdmin()},
  scr(el){const t=$(el.dataset.t);if(t&&t.scrollIntoView)t.scrollIntoView({behavior:'smooth'})},
  ost(el){ui.ost=el.dataset.v;renderAdmin()},
  oadv(el){const o=ORDERS.find(x=>x.id===el.dataset.id);if(!o)return;const i=STAT.findIndex(x=>x[0]===o.st);if(STAT[i+1]){o.st=STAT[i+1][0];saveOrders();if(typeof sbUpdateOrder==='function'&&sbOn)sbUpdateOrder(o.id,{st:o.st}).catch(e=>console.warn('[ita] update pedido falhou:',e&&e.message))}renderAdmin()},
  addzone(){const n=$('#nz-name').value.trim();if(!n){say('Dê um nome à região.','bad');$('#nz-name').focus();return}S.zones.push({id:uid(),name:n,fee:parseMoney($('#nz-fee').value),on:true});struct('Região adicionada.')},
  addmo(){const t=parseMoney($('#mo-total').value);if(!t){say('Informe o valor do pedido.','bad');return}const h=$('#mo-hood').value.trim();const o={id:uid(),t:Date.now(),name:$('#mo-name').value.trim()||'Cliente',mode:h?'entrega':'retirada',hood:h,items:['Pedido registrado manualmente'],sub:t,fee:0,total:t,pay:'',st:'todo'};ORDERS.unshift(o);saveOrders();if(typeof sbInsertOrder==='function'&&sbOn)sbInsertOrder(o).catch(e=>console.warn('[ita] pedido manual falhou:',e&&e.message));struct('Pedido registrado.')},
  rmimg(el){if(el.dataset.k==='prod'){const p=S.products.find(x=>x.id===el.dataset.id);if(p)p.img=''}else delete S.photos[el.dataset.id];struct('Foto removida.')},

  theme(){applyTheme(document.documentElement.getAttribute('data-theme')==='light'?'dark':'light')},

  admin(){openAdmin()},closeadmin(){closeAdmin()},
  logout(){ui.unlocked=false;SS.del('ita-admin');renderAdmin()},
  atab(el){ui.atab=el.dataset.v;renderAdmin()},
  publish(){doPublish()},
  dismisssample(){S.config.sample=false;struct()},
  addprod(){
    const name=$('#np-name').value.trim();if(!name){say('Dê um nome ao produto.','bad');$('#np-name').focus();return}
    const cat=$('#np-cat').value;
    S.products.push({id:uid(),cat,name,desc:$('#np-desc').value.trim(),price:parseMoney($('#np-price').value),on:true,img:ui.npImg||''});ui.npImg='';
    ui.filter=cat;struct('Produto adicionado.');
  },
  addcat(){
    const name=$('#nc-name').value.trim();if(!name){say('Dê um nome à categoria.','bad');$('#nc-name').focus();return}
    S.cats.push({id:uid(),name,icon:$('#nc-icon').value});struct('Categoria adicionada.');
  },
  addgroup(){
    const name=$('#ng-name').value.trim();if(!name){say('Dê um nome ao grupo.','bad');$('#ng-name').focus();return}
    S.builder.groups.push({id:uid(),name,type:$('#ng-type').value,required:false,opts:[]});struct('Grupo adicionado.');
  },
  addopt(el){
    const g=S.builder.groups.find(x=>x.id===el.dataset.gid);const n=$('#no-name-'+el.dataset.gid);
    if(!g||!n||!n.value.trim()){say('Dê um nome à opção.','bad');if(n)n.focus();return}
    g.opts.push({id:uid(),name:n.value.trim(),price:parseMoney($('#no-price-'+el.dataset.gid).value)});struct('Opção adicionada.');
  },
  addad(){
    const t=$('#na-text').value.trim();if(!t){say('Escreva o texto do anúncio.','bad');$('#na-text').focus();return}
    S.ads.push({id:uid(),text:t,url:$('#na-url').value.trim(),on:true});struct('Anúncio adicionado.');
  },
  addlink(){
    const l=$('#nl-label').value.trim();if(!l){say('Dê um nome ao link.','bad');$('#nl-label').focus();return}
    S.links.push({id:uid(),label:l,url:$('#nl-url').value.trim(),on:true});struct('Link adicionado.');
  },
  mv(el){mv(el.dataset.col,el.dataset.id,Number(el.dataset.d),el.dataset.gid);struct()},
  del(el){
    if(el.dataset.armed!=='1'){
      el.dataset.armed='1';el.dataset.t0=el.textContent;el.textContent=el.dataset.warn;
      setTimeout(()=>{if(el.isConnected&&el.dataset.armed==='1'){el.dataset.armed='';el.textContent=el.dataset.t0}},4000);return;
    }
    doDel(el.dataset.col,el.dataset.id,el.dataset.gid);struct('Excluído.');
  }
};
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;const f=ACT[el.dataset.act];if(f)f(el,e)});

function readImg(file,R,cb){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const tr=R[0]/R[1];let sw=im.width,sh=im.height;if(sw/sh>tr)sw=sh*tr;else sh=sw/tr;const W=Math.min(R[2],Math.round(sw)),H=Math.round(W/tr),c=document.createElement('canvas');c.width=W;c.height=H;c.getContext('2d').drawImage(im,(im.width-sw)/2,(im.height-sh)/2,sw,sh,0,0,W,H);cb(c.toDataURL('image/jpeg',.82))};im.onerror=()=>say('Não consegui ler essa foto.','bad');im.src=r.result};r.readAsDataURL(file)}
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset||!t.dataset.img||!t.files||!t.files[0])return;const [k,id]=t.dataset.img.split(':');
  const rk=k==='slot'?(SLOTS.find(x=>x[0]===id)||[])[2]:'prod';readImg(t.files[0],RATIO[rk]||RATIO.prod,src=>{if(k==='np'){ui.npImg=src;const pv=$('#np-prev');if(pv)pv.innerHTML='<img class="thumb" src="'+src+'" alt="">'}else if(k==='prod'){const p=S.products.find(x=>x.id===id);if(p)p.img=src;struct('Foto salva.')}else{S.photos[id]={src,on:true};struct('Foto salva.')}})});

function onInput(e){
  const t=e.target;
  if(t.dataset.zone!==undefined){const z=S.zones.find(x=>x.id===t.value);ORDER.zone=z?z.id:'';ORDER.hood=z?z.name:'';saveOrder();renderCartLines();updateWa();return}
  if(t.dataset.o!==undefined){ORDER[t.dataset.o]=t.value;saveOrder();updateWa();return}
  if(t.dataset.note){const l=CART.find(x=>x.u===t.dataset.note);if(l){l.note=t.value;saveCart();updateWa()}return}
  if(t.dataset.filter){ui.filter=t.value;renderAdmin();return}
  if(t.dataset.cfg){
    let v=t.dataset.t==='bool'?t.checked:t.value;
    if(t.dataset.t==='phone'){v=normPhone(t.value);if(e.type==='change')t.value=fmtPhone(v)}
    setPath(S,t.dataset.cfg,v);touch();return;
  }
  if(t.dataset.col){
    const it=findItem(t.dataset.col,t.dataset.id,t.dataset.gid);if(!it)return;
    let v;
    if(t.dataset.t==='bool')v=t.checked;
    else if(t.dataset.t==='money'){v=parseMoney(t.value);if(e.type==='change')t.value=fmtMoney(v)}
    else v=t.value;
    it[t.dataset.f]=v;touch();
  }
}
document.addEventListener('input',onInput);
document.addEventListener('change',onInput);

document.addEventListener('submit',async e=>{
  const f=e.target;e.preventDefault();
  if(f.id==='loginform'){
    const err=$('#loginerr');err.textContent='';
    if(!(window.crypto&&crypto.subtle)){err.textContent='Este navegador não consegue verificar a senha.';return}
    if(ui.tries>=3){await new Promise(r=>setTimeout(r,1500))}
    const ok=(await sha(S.pw.salt+':'+$('#pw').value))===S.pw.hash;
    if(ok){ui.unlocked=true;ui.tries=0;SS.set('ita-admin','1');renderAdmin();
       try{const list=await sbListOrders();if(Array.isArray(list)&&list.length){ORDERS=list;saveOrders()}}catch(e){}
       if(dirty())flushSave();
    }
    else{ui.tries++;err.textContent='Senha incorreta.';$('#pw').select()}
  }
  if(f.id==='pwform'){
    const o=$('#pw-old').value,n=$('#pw-new').value,n2=$('#pw-new2').value;
    if((await sha(S.pw.salt+':'+o))!==S.pw.hash)return say('A senha atual não confere.','bad');
    if(n.length<6)return say('A nova senha precisa ter pelo menos 6 caracteres.','bad');
    if(n!==n2)return say('As duas senhas novas são diferentes.','bad');
    const salt='ita-'+uid();S.pw={salt,hash:await sha(salt+':'+n)};touch();
    ['#pw-old','#pw-new','#pw-new2'].forEach(s=>{$(s).value=''});
    say('Senha trocada no rascunho. Publique para valer para todos.','good');
  }
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(ui.admin)closeAdmin();else if(ui.cart)closeCart()}});

