// Ita Burger — renderização da loja (vitrine, cardápio, carrinho)
// Extraído de #ita-main (render) no arquivo único.

function shell(){
  $('#app').innerHTML=SPRITE+`
  <div id="draftbar" class="draftbar" hidden></div>
  <div id="ads" class="ads" hidden aria-live="polite"></div>
  <header class="top"><div class="wrap"><img id="brand" class="brand" src="${IMG.mark}" alt=""><span class="sp"></span>
    <button class="btn btn-line btn-sm" data-act="theme" id="theme-toggle" aria-pressed="false">☀️<span class="tl"> Claro</span></button>
    <button class="btn btn-line btn-sm" data-act="admin" id="admin-open" aria-label="Administração"><span class="adm-ico">⚙️</span><span class="lbl-txt">Admin</span></button>
    <button class="btn btn-red btn-sm" data-act="cart" id="cart-open" aria-label="Carrinho"><span class="lbl-txt">Carrinho</span> <span id="cnt" class="cnt">0</span></button></div></header>
  <main>
    <section id="home" class="wrap home"></section><section id="aboutpage" class="wrap home" hidden></section>
    <div id="menupage" hidden><div class="wrap mp-top"><button class="btn btn-line btn-sm" data-act="home">← Início</button></div>
    <nav class="tabs" id="tabs" aria-label="Categorias do cardápio"><div class="wrap" role="tablist" id="tablist"></div></nav>
    <div id="view"></div></div>
  </main>
  <footer class="foot" id="foot"></footer>
  <div class="cartbar" id="cartbar" hidden></div>
  <div class="sheet" id="cart" hidden role="dialog" aria-modal="true" aria-label="Seu pedido">
    <div class="sheet-top"><div class="wrap"><button class="btn btn-line btn-sm" data-act="closecart" id="cart-close">← Voltar</button><h2>Seu pedido</h2></div></div>
    <div class="wrap sheet-body" id="cartbody"></div></div>
  <div class="sheet" id="admin" hidden role="dialog" aria-modal="true" aria-label="Administração">
    <div class="sheet-top"><div class="wrap"><h2>Administração</h2><span id="adstatus" class="chip ok" hidden></span><span class="sp"></span>
      <button class="btn btn-gold btn-sm" data-act="publish" id="btn-publish" hidden>Publicar alterações</button>
      <button class="btn btn-line btn-sm" data-act="logout" id="btn-logout" hidden>Sair</button>
      <button class="btn btn-line btn-sm" data-act="closeadmin" id="admin-close">Fechar</button></div></div>
    <div class="wrap sheet-body wide" id="adminbody"></div></div>`;
}

function renderTop(){$('#brand').alt=S.config.name||'Ita Burger'}

function renderCount(){const n=cartCount();$('#cnt').textContent=n}

function renderAds(){
  const act=S.ads.filter(a=>a.on&&String(a.text).trim());const el=$('#ads');
  if(!act.length){el.hidden=true;el.innerHTML='';return}
  el.hidden=false;adIdx=adIdx%act.length;const a=act[adIdx];const u=safeUrl(a.url);
  el.innerHTML='<div class="wrap">'+(u?'<a href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(a.text)+'</a>':'<span>'+esc(a.text)+'</span>')+'</div>';
}

function tabsList(){
  const t=[];
  if(S.builder.on)t.push({id:'build',name:S.builder.title||'Monte o seu',icon:'burger',build:true});
  S.cats.forEach(c=>{if(S.products.some(p=>p.cat===c.id&&p.on))t.push({id:c.id,name:c.name,icon:c.icon})});
  return t;
}

function renderTabs(){
  const t=tabsList();
  if(!t.some(x=>x.id===ui.tab))ui.tab=(t.find(x=>!x.build)||t[0]||{}).id||null;
  $('#tablist').innerHTML=t.map(x=>`<button class="tab${x.build?' build':''}" role="tab" aria-selected="${x.id===ui.tab}" data-act="tab" data-id="${esc(x.id)}">${icon(x.icon)}${esc(x.name)}</button>`).join('');
}

function renderView(){
  const v=$('#view');
  if(ui.tab==='build'&&S.builder.on)return renderBuilder(v);
  const c=S.cats.find(x=>x.id===ui.tab);
  if(!c){v.innerHTML='<div class="wrap"><div class="empty"><h3>Cardápio em atualização</h3><p class="note">Volte em instantes ou chame a gente no WhatsApp.</p></div></div>';return}
  const items=S.products.filter(p=>p.cat===c.id&&p.on);
  v.innerHTML=`<div class="wrap"><div class="sec-h"><h2>${esc(c.name)}</h2><span>${items.length} ${items.length===1?'opção':'opções'}</span></div><div class="grid">`+
  items.map(p=>{const l=plainLine(p.id);return `<article class="card${p.img?' hasimg':''}"><div class="tile">${p.img?'<img src="'+p.img+'" alt="">':icon(c.icon)}</div><div><h3>${esc(p.name)}</h3>${p.desc?'<p>'+esc(p.desc)+'</p>':''}</div><div class="buy"><span class="price">${brl(p.price)}</span>${l?`<div class="step"><button data-act="dec" data-id="${p.id}" aria-label="Tirar um ${esc(p.name)}">−</button><b>${l.qty}</b><button data-act="add" data-id="${p.id}" aria-label="Adicionar mais um ${esc(p.name)}">+</button></div>`:`<button class="btn btn-red btn-sm" data-act="add" data-id="${p.id}">Adicionar</button>`}</div></article>`}).join('')+'</div></div>';
}

function renderBuilder(v){
  const b=S.builder;
  let h=`<div class="wrap"><div class="sec-h"><h2>${esc(b.title)}</h2><span>Você escolhe cada ingrediente</span></div>`+(b.intro?`<p class="note" style="margin-bottom:12px">${esc(b.intro)}</p>`:'');
  b.groups.forEach(g=>{
    if(!g.opts.length)return;
    const tag=g.type==='single'?(g.required?'Escolha 1':'Escolha até 1'):'Escolha quantos quiser';
    h+=`<section class="bgroup" data-g="${g.id}"><h3>${esc(g.name)}<small>${tag}</small></h3><div class="opts">`+
    g.opts.map(o=>`<button type="button" class="opt${g.type==='multi'?' multi':''}" data-act="pick" data-g="${g.id}" data-o="${o.id}" aria-pressed="${(BP[g.id]||[]).indexOf(o.id)>-1}"><span class="nm"><i class="dot"></i>${esc(o.name)}</span>${Number(o.price)>0?'<span class="pr">+ '+brl(o.price)+'</span>':'<span class="pr free">incluso</span>'}</button>`).join('')+'</div></section>';
  });
  h+=`<div class="bsum"><div><span class="lbl">Seu lanche</span><b id="btotal">${brl(bTotal())}</b></div><button class="btn" data-act="addbuild" id="addbuild">Adicionar ao carrinho</button></div></div>`;
  v.innerHTML=h;
}

function renderFoot(){
  const c=S.config;const links=S.links.filter(l=>l.on&&safeUrl(l.url));
  $('#foot').innerHTML=`<div class="wrap"><div><h4>${esc(c.name||'Ita Burger')}</h4><p>Hambúrguer artesanal${c.address?' em '+esc(c.address):''}.</p>${c.hours?'<p>'+esc(c.hours)+'</p>':''}</div>
  <div><h4>Pedidos</h4><p>WhatsApp: <strong style="color:var(--cream)">${esc(fmtPhone(c.whatsapp))}</strong></p><p>Monte o pedido aqui no site e envie pelo botão do carrinho.</p></div>`+
  (links.length?`<div><h4>Siga a gente</h4><div class="pills">${links.map(l=>`<a class="pill" href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('')}</div></div>`:'')+'</div>';
}

function renderCartBar(){
  const el=$('#cartbar');const n=cartCount();
  const show=n>0&&!ui.cart&&!ui.admin;
  el.hidden=!show;document.body.classList.toggle('has-cart',show);
  if(show)el.innerHTML=`<button class="cb" data-act="cart"><span>Ver carrinho · ${n} ${n===1?'item':'itens'}</span><b>${brl(cartTotal())}</b></button>`;
}

function renderAll(){renderTop();renderAds();renderHome();renderAbout();renderPage();renderTabs();renderView();renderFoot();renderCartBar();renderCount();updateStatus()}

function renderCartSheet(){
  const body=$('#cartbody');
  if(!CART.length){body.innerHTML='<div class="empty"><h3>Seu carrinho está vazio</h3><p class="note">Escolha um lanche no cardápio ou monte o seu do jeito que quiser.</p><button class="btn btn-gold" data-act="closecart">Ver cardápio</button></div>';return}
  const f=(label,key,o)=>{o=o||{};return `<label class="fld"><span class="lbl">${label}</span><input class="in" id="o-${key}" data-o="${key}" value="${esc(ORDER[key])}"${o.ph?' placeholder="'+o.ph+'"':''}${o.ac?' autocomplete="'+o.ac+'"':''}${o.mode?' inputmode="'+o.mode+'"':''}></label>`};
  body.innerHTML=`<section><h3 class="blk-h">Itens</h3><div id="cartlines" class="lines"></div><div id="carttot"></div></section>
  <form id="orderform" class="stack" novalidate>
    <h3 class="blk-h" style="margin:0">Como você quer receber?</h3>
    <div class="seg" role="group" aria-label="Entrega ou retirada"><button type="button" data-act="mode" data-v="entrega">Entrega</button><button type="button" data-act="mode" data-v="retirada">Retirar no balcão</button></div>
    ${f('Seu nome','name',{ac:'name'})}
    <div id="addr" class="stack">
      ${f('Rua ou avenida','street',{ac:'address-line1'})}
      <div class="cols">${f('Número','num',{mode:'numeric'})}${hoodFld()}</div>
      <div class="cols">${f('Cidade','city')}${f('Complemento','comp',{ph:'Apto, bloco, casa...'})}</div>
      ${f('Ponto de referência','ref',{ph:'Ex.: perto da padaria'})}
    </div>
    <h3 class="blk-h" style="margin:8px 0 0">Forma de pagamento</h3>
    <div class="seg seg3" role="group" aria-label="Forma de pagamento" id="paysegs"><button type="button" id="pay-first" data-act="pay" data-v="pix">Pix</button><button type="button" data-act="pay" data-v="cartao">Cartão</button><button type="button" data-act="pay" data-v="dinheiro">Dinheiro</button></div>
    <div id="change-fld" hidden>${f('Troco para quanto?','change',{ph:'Ex.: R$ 50,00 (deixe vazio se não precisa)'})}</div>
    <p class="note" id="paynote"></p>
  </form>
  <section class="cta-stack"><div id="errs" hidden></div>
    <a id="wa" class="btn btn-wa" data-act="wa" target="_blank" rel="noopener" href="#">Enviar pedido pelo WhatsApp</a>
    <div id="wahint" class="okbox" hidden>Abrimos o WhatsApp em outra aba com o pedido pronto. Se nada abriu, use o botão de copiar abaixo e cole a mensagem na conversa com <strong>${esc(fmtPhone(S.config.whatsapp))}</strong>.</div>
    <button class="btn btn-line" data-act="copy">Copiar mensagem do pedido</button>
    <textarea class="in" id="msgbox" readonly hidden aria-label="Mensagem do pedido"></textarea>
    <button class="rm" data-act="clearcart" style="justify-self:start">Esvaziar carrinho</button></section>`;
  renderCartLines();applyOrderUI();updateWa();
}

function renderCartLines(){
  const L=$('#cartlines');if(!L)return;
  L.innerHTML=CART.map(l=>{const i=lineInfo(l);if(!i)return '';return `<article class="line"><div class="line-top"><div><h3>${esc(i.name)}</h3>${i.detail.length?'<ul>'+i.detail.map(d=>'<li>'+esc(d)+'</li>').join('')+'</ul>':''}</div><b class="price">${brl(i.unit*l.qty)}</b></div>
  <label class="fld"><span class="lbl">Observação</span><input class="in" id="note-${l.u}" data-note="${l.u}" value="${esc(l.note)}" placeholder="Ex.: sem cebola" maxlength="120"></label>
  <div class="line-bot"><div class="step"><button data-act="lq" data-u="${l.u}" data-d="-1" aria-label="Diminuir quantidade">−</button><b>${l.qty}</b><button data-act="lq" data-u="${l.u}" data-d="1" aria-label="Aumentar quantidade">+</button></div><button class="rm" data-act="rmline" data-u="${l.u}">Remover</button></div></article>`}).join('');
  const z=curZone();$('#carttot').innerHTML=`<div class="total" style="font-size:14px"><span>Itens</span><b style="font-size:20px">${brl(cartTotal())}</b></div>`+(ORDER.mode==='entrega'?`<div class="total" style="font-size:14px;margin-top:6px"><span>Entrega${z?' · '+esc(z.name):''}</span><b style="font-size:20px">${z?brl(deliv()):'escolha o bairro'}</b></div>`:'')+`<div class="total"><span>Total</span><b>${brl(grand())}</b></div>`+(ORDER.mode==='entrega'&&!z&&S.config.deliveryNote?`<p class="note" style="margin-top:10px">${esc(S.config.deliveryNote)}</p>`:'');
}

function applyOrderUI(){
  $$('[data-act=mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===ORDER.mode)));
  $$('[data-act=pay]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===ORDER.pay)));
  const a=$('#addr');if(a)a.hidden=ORDER.mode!=='entrega';
  const c=$('#change-fld');if(c)c.hidden=ORDER.pay!=='dinheiro';
  const n=$('#paynote');if(n)n.textContent=ORDER.pay==='pix'?'A chave Pix é enviada pelo WhatsApp quando o pedido for confirmado.':ORDER.pay==='cartao'?'A maquininha vai com o entregador ou fica no balcão.':'';
}

function updateWa(){const a=$('#wa');if(a)a.href=waUrl();const m=$('#msgbox');if(m)m.value=buildMsg()}

function renderPage(){const p=ui.page;$('#home').hidden=p!=='home';$('#aboutpage').hidden=p!=='about';$('#menupage').hidden=p!=='menu';$('#foot').hidden=false}

function renderHome(){
  const c=S.config,ad=encodeURIComponent((c.address||'Itanhaém')+', SP'),hs=photo('home');
  const bg=k=>{const p=photo(k);return p?` style="background-image:linear-gradient(90deg,rgba(10,6,5,.1),rgba(10,6,5,.9) 68%),url(${p})"`:''};
  const card=(k,t,sub,btn)=>`<article class="hc"${bg(k)}><h3>${t}</h3>${sub?'<p>'+sub+'</p>':''}${btn}</article>`;
  let h=`<section class="hh"${hs?` style="background-image:linear-gradient(180deg,rgba(0,0,0,.15),rgba(10,6,5,.92) 78%),url(${hs})"`:''}>${hs?'':`<img class="mas" src="${IMG.hero}" alt="">`}<p class="eyebrow">Hambúrguer artesanal · ${esc(c.address||'Itanhaém')}</p><h1>Bateu a fome? Peça aqui.</h1><p>Escolha seu lanche e envie o pedido no WhatsApp.</p><button class="btn btn-gold" data-act="gomenu">Fazer meu pedido →</button>${S.builder.on?'<button class="btn btn-line" data-act="gobuild">Montar meu lanche</button>':''}</section>`;
  h+=card('about','Conheça o Ita Burger','Nossa história e como pedir','<button class="hbtn" data-act="goabout">Conhecer</button>');
  h+=card('menu','Cardápio','Veja tudo o que temos','<button class="hbtn" data-act="gomenu">Ver cardápio</button>');
  h+=card('loc','Onde estamos',esc(c.address||'Itanhaém'),'<button class="hbtn" data-act="scr" data-t="#locsec">Ver localização</button>');
  h+=card('wa','Fale com a gente',esc(fmtPhone(c.whatsapp)),`<a class="hbtn wa" href="https://wa.me/${String(c.whatsapp||'').replace(/\D/g,'')}" target="_blank" rel="noopener">Falar no WhatsApp</a>`);
  S.links.filter(l=>l.on&&safeUrl(l.url)).forEach(l=>{h+=card('links','Siga no '+esc(l.label),'',`<a class="hbtn" href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener">Acessar</a>`)});
  h+=`<section class="hsec" id="locsec"><h2>Localização</h2><p>${esc(c.address||'Itanhaém')}</p>${c.hours?`<p>${esc(c.hours)}</p>`:''}<a class="btn btn-line btn-sm" style="justify-self:start" href="https://www.google.com/maps/search/?api=1&query=${ad}" target="_blank" rel="noopener">Abrir no mapa</a></section>`;
  $('#home').innerHTML=h;
}

function renderAbout(){
  const c=S.config,im=k=>photo(k)?`<img class="ab-img" src="${photo(k)}" alt="">`:'',hp=photo('abh');
  const g=['ab2','ab3','ab4'].filter(photo);
  const dif=[['01','Feito na hora','Cada lanche é preparado depois do seu pedido, para chegar quente e saboroso.'],...(S.builder.on?[['02','Do seu jeito','Monte o seu lanche escolhendo ingredientes e adicionais.']]:[]),['03','Entrega em Itanhaém','Atendemos vários bairros da cidade, com a taxa clara antes de enviar.'],['04','Pedido fácil','Escolha no site e finalize direto no WhatsApp, sem complicação.']];
  $('#aboutpage').innerHTML=`<div><button class="btn btn-line btn-sm" data-act="home">← Início</button></div>
  <section class="hh"${hp?` style="background-image:linear-gradient(180deg,rgba(0,0,0,.15),rgba(10,6,5,.92) 80%),url(${hp})"`:''}>${hp?'':`<img class="mas" src="${IMG.hero}" alt="">`}<p class="eyebrow">Quem somos</p><h1>${esc(c.name||'Ita Burger')}</h1><p>${esc(c.about||'')}</p></section>
  <section class="hsec"><h2>Nossa história</h2><p>${esc(c.story||'')}</p>${im('ab1')}</section>
  <section class="hsec"><h2>Nossos diferenciais</h2><div class="dif">${dif.map(d=>`<div><b>${d[0]}</b><h3>${d[1]}</h3><p>${d[2]}</p></div>`).join('')}</div></section>
  ${g.length?`<section class="hsec"><h2>Um pouco do nosso dia a dia</h2><div class="gal">${g.map(k=>`<img src="${photo(k)}" alt="">`).join('')}</div></section>`:''}
  <section class="hsec"><h2>Bora pedir?</h2><p>Veja o cardápio e faça seu pedido em poucos toques.</p><button class="btn btn-gold" data-act="gomenu">Fazer meu pedido →</button><button class="btn btn-line" data-act="goloc">Ver localização</button></section>`;
}

