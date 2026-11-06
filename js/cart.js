// Ita Burger — carrinho e pedido: linhas, totais, montagem ('monte o seu') e mensagem do WhatsApp
// Extraído de #ita-main (carrinho) no arquivo único.

function lineInfo(l){
  if(l.t==='p'){const p=S.products.find(x=>x.id===l.pid);if(!p||!p.on)return null;return{name:p.name,unit:Number(p.price)||0,detail:[]}}
  const b=S.builder;if(!b.on)return null;
  let unit=0;const detail=[];
  for(const g of b.groups){
    const ids=(l.picks&&l.picks[g.id])||[];
    const os=g.opts.filter(o=>ids.indexOf(o.id)>-1);
    if(g.required&&g.type==='single'&&g.opts.length&&!os.length)return null;
    if(os.length){detail.push(g.name+': '+os.map(o=>o.name).join(', '));os.forEach(o=>{unit+=Number(o.price)||0})}
  }
  return{name:b.title||'Monte o seu',unit:Math.round(unit*100)/100,detail};
}

function cleanCart(){CART=CART.filter(l=>l&&l.qty>0&&lineInfo(l))}

function cartCount(){return CART.reduce((a,l)=>a+l.qty,0)}

function cartTotal(){return Math.round(CART.reduce((a,l)=>{const i=lineInfo(l);return a+(i?i.unit*l.qty:0)},0)*100)/100}

function saveCart(){LS.set('ita-cart',JSON.stringify(CART))}

function saveOrder(){LS.set('ita-order',JSON.stringify(ORDER))}

function cartChanged(){
  cleanCart();saveCart();renderCartBar();renderCount();
  if(ui.tab!=='build')renderView();
  if(ui.cart){if(!CART.length||!$('#orderform'))renderCartSheet();else{renderCartLines();updateWa()}}
}

const plainLine=pid=>CART.find(x=>x.t==='p'&&x.pid===pid&&!x.note);

function addProduct(pid){const l=plainLine(pid);if(l)l.qty++;else CART.push({u:uid(),t:'p',pid,qty:1,note:''});cartChanged()}

function decProduct(pid){const l=plainLine(pid);if(!l)return;l.qty--;cartChanged()}

function initBP(){
  const keep={};
  S.builder.groups.forEach(g=>{
    let sel=(BP[g.id]||[]).filter(id=>g.opts.some(o=>o.id===id));
    if(g.type==='single')sel=sel.slice(0,1);
    if(g.required&&g.type==='single'&&!sel.length&&g.opts.length)sel=[g.opts[0].id];
    keep[g.id]=sel;
  });
  BP=keep;
}

function bTotal(){let t=0;S.builder.groups.forEach(g=>{g.opts.forEach(o=>{if((BP[g.id]||[]).indexOf(o.id)>-1)t+=Number(o.price)||0})});return Math.round(t*100)/100}

function buildMsg(){
  const L=[];
  L.push('*Novo pedido - '+(S.config.name||'Ita Burger')+'*','','*Itens*');
  CART.forEach(l=>{
    const i=lineInfo(l);if(!i)return;
    L.push(l.qty+'x '+i.name+' - '+brl(i.unit*l.qty));
    i.detail.forEach(d=>L.push('   • '+d));
    if(l.note)L.push('   Obs: '+l.note);
  });
  L.push('','*Subtotal dos itens:* '+brl(cartTotal()));
  if(ORDER.mode==='entrega'){if(curZone())L.push('*Taxa de entrega ('+curZone().name+'):* '+brl(deliv()));else L.push('_A taxa de entrega você me informa por aqui._')}
  L.push('*Total do pedido:* '+brl(grand()));
  L.push('','*Nome:* '+ORDER.name);
  if(ORDER.mode==='entrega'){
    L.push('*Entrega em:* '+ORDER.street+', nº '+ORDER.num);
    L.push('*Bairro:* '+ORDER.hood+(ORDER.city?' - '+ORDER.city:''));
    if(ORDER.comp)L.push('*Complemento:* '+ORDER.comp);
    if(ORDER.ref)L.push('*Referência:* '+ORDER.ref);
  }else L.push('*Retirada no balcão*');
  let pay=PAY[ORDER.pay]||'';
  if(ORDER.pay==='dinheiro')pay+=ORDER.change?' (troco para '+ORDER.change+')':' (sem troco)';
  L.push('*Pagamento:* '+pay);
  return L.join('\n');
}

function waUrl(){return 'https://wa.me/'+String(S.config.whatsapp||'').replace(/\D/g,'')+'?text='+encodeURIComponent(buildMsg())}

function validate(){
  const e=[];
  if(!CART.length)e.push(['','Adicione pelo menos um item.']);
  if(!ORDER.name.trim())e.push(['o-name','Informe o seu nome.']);
  if(ORDER.mode==='entrega'){
    if(!ORDER.street.trim())e.push(['o-street','Informe a rua ou avenida.']);
    if(!ORDER.num.trim())e.push(['o-num','Informe o número.']);
    if(zonesOn().length?!curZone():!ORDER.hood.trim())e.push(['o-hood','Escolha o bairro de entrega.']);
  }
  if(!ORDER.pay)e.push(['pay-first','Escolha a forma de pagamento.']);
  return e;
}

function hoodFld(){const z=zonesOn();if(!z.length)return `<label class="fld"><span class="lbl">Bairro</span><input class="in" id="o-hood" data-o="hood" value="${esc(ORDER.hood)}"></label>`;
  return `<label class="fld"><span class="lbl">Bairro</span><select class="in" id="o-hood" data-zone="1"><option value="">Escolha o bairro</option>${z.map(x=>`<option value="${esc(x.id)}"${x.id===ORDER.zone?' selected':''}>${esc(x.name)} · ${brl(x.fee)}</option>`).join('')}</select></label>`}

function logOrder(){const sig=buildMsg(),now=Date.now(),l=ORDERS[0];if(l&&l.sig===sig&&now-l.t<60000)return;
  ORDERS.unshift({id:uid(),t:now,sig,name:ORDER.name,mode:ORDER.mode,hood:ORDER.mode==='entrega'?ORDER.hood:'',items:CART.map(x=>{const i=lineInfo(x);return i?x.qty+'x '+i.name:''}).filter(Boolean),sub:cartTotal(),fee:deliv(),total:grand(),pay:PAY[ORDER.pay]||'',st:'todo'});saveOrders()}

