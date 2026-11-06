// Ita Burger — administração: CRUD, pedidos/financeiro, fotos, senha e salvar (Supabase ou publicar)

const dirty=()=>JSON.stringify(S)!==JSON.stringify(DATA);
const sbReady=()=>typeof sbOn!=='undefined'&&sbOn===true&&typeof sbSave==='function';

let draftT=null;
async function persistLocalOrRemote(){
  if(sbReady()){
    sbState.saving=true;updateStatus();
    try{await sbSave(S);DATA=clone(S);LS.del('ita-draft');say('Salvo no Supabase ✓','good')}
    catch(e){say('Não salvou no Supabase: '+(e&&e.message||e)+' — alteração continua como rascunho neste aparelho.','bad')}
    updateStatus();return;
  }
  if(dirty())LS.set('ita-draft',JSON.stringify(S));else LS.del('ita-draft');
  updateStatus();
}
function touch(){clearTimeout(draftT);draftT=setTimeout(persistLocalOrRemote,400);updateStatus()}
async function flushSave(){clearTimeout(draftT);return persistLocalOrRemote()}

function updateStatus(){
  const d=dirty();
  const saving=sbState&&sbState.saving;
  const err=sbState&&sbState.error;
  const chip=$('#adstatus');chip.hidden=!ui.unlocked;chip.className='chip '+(d||saving||err?'pend':'ok');
  chip.textContent=saving?'Salvando no Supabase…':err?'Erro ao salvar':'…';
  if(!saving&&!err)chip.textContent=sbReady()?(d?'Alterações não salvas':'Salvo no Supabase'):(d?'Alterações não publicadas':'Tudo publicado');
  const btn=$('#btn-publish');btn.hidden=!ui.unlocked;btn.disabled=!d&&!saving;if(sbReady())btn.textContent='Salvar no Supabase';
  $('#btn-logout').hidden=!ui.unlocked;
  const bar=$('#draftbar');const show=d&&!ui.admin;bar.hidden=!show;
  if(show)bar.innerHTML='<div class="wrap"><span>'+(sbReady()?'Você tem alterações não salvas no Supabase.':'Você está vendo uma prévia com alterações que ainda não foram publicadas.')+'</span><button class="btn btn-line btn-sm" data-act="admin" style="border-color:var(--cream)">Abrir administração</button></div>';
}

const say=(t,cls)=>{const m=$('#admmsg');if(m){m.textContent=t;m.className='msgline '+(cls||'')}};

function fText(label,col,id,f,val,o){o=o||{};return `<label class="fld"><span class="lbl">${label}</span><input class="in" id="b-${col}-${id}-${f}" data-col="${col}" data-id="${id}" data-f="${f}"${o.t?' data-t="'+o.t+'"':''}${o.gid?' data-gid="'+o.gid+'"':''} value="${esc(val)}"${o.ph?' placeholder="'+esc(o.ph)+'"':''}${o.mode?' inputmode="'+o.mode+'"':''}></label>`}

function fSel(label,col,id,f,val,opts,o){o=o||{};return `<label class="fld"><span class="lbl">${label}</span><select class="in" id="b-${col}-${id}-${f}" data-col="${col}" data-id="${id}" data-f="${f}"${o.gid?' data-gid="'+o.gid+'"':''}>${opts.map(x=>`<option value="${esc(x[0])}"${x[0]===val?' selected':''}>${esc(x[1])}</option>`).join('')}</select></label>`}

function fChk(label,col,id,f,val,o){o=o||{};return `<label class="chk"><input type="checkbox" id="b-${col}-${id}-${f}" data-col="${col}" data-id="${id}" data-f="${f}" data-t="bool"${o.gid?' data-gid="'+o.gid+'"':''}${val?' checked':''}>${label}</label>`}

function cfgText(label,path,val,o){o=o||{};return `<label class="fld"><span class="lbl">${label}</span><input class="in" id="c-${path.replace('.','-')}" data-cfg="${path}"${o.t?' data-t="'+o.t+'"':''} value="${esc(val)}"${o.ph?' placeholder="'+esc(o.ph)+'"':''}${o.mode?' inputmode="'+o.mode+'"':''}></label>`}

const mvBtns=(col,id,gid)=>`<button class="btn btn-line btn-sm" data-act="mv" data-col="${col}" data-id="${id}" data-d="-1"${gid?' data-gid="'+gid+'"':''} aria-label="Mover para cima">↑</button><button class="btn btn-line btn-sm" data-act="mv" data-col="${col}" data-id="${id}" data-d="1"${gid?' data-gid="'+gid+'"':''} aria-label="Mover para baixo">↓</button>`;

const delBtn=(col,id,label,warn,gid)=>`<button class="btn btn-danger btn-sm" data-act="del" data-col="${col}" data-id="${id}"${gid?' data-gid="'+gid+'"':''} data-warn="${esc(warn||'Confirmar exclusão')}">${label||'Excluir'}</button>`;

const iconOpts=ICONS;

function renderAdmin(){
  const sh=$('#admin');const top=sh.scrollTop;const body=$('#adminbody');
  if(!ui.unlocked){
    body.innerHTML=`<form id="loginform" class="acard" style="max-width:420px" novalidate><h3>Área da administração</h3><p class="note">Digite a senha para alterar produtos, preços, links e anúncios.</p>
    <label class="fld"><span class="lbl">Senha</span><input class="in" id="pw" type="password" autocomplete="current-password"></label>
    <button class="btn btn-gold" type="submit">Entrar</button><p id="loginerr" class="msgline bad"></p></form>`;
    updateStatus();return;
  }
  const tabs=[['orders','Pedidos'],['fin','Financeiro'],['zones','Entrega'],['photos','Fotos'],['products','Produtos'],['cats','Categorias'],['build','Monte o seu'],['ads','Anúncios'],['links','Contato e links'],['sec','Senha']];
  const fn={orders:aOrders,fin:aFin,zones:aZones,photos:aPhotos,products:aProducts,cats:aCats,build:aBuild,ads:aAds,links:aLinks,sec:aSec}[ui.atab];
  body.innerHTML=`<div class="atabs" role="tablist">${tabs.map(t=>`<button class="tab" role="tab" aria-selected="${t[0]===ui.atab}" data-act="atab" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>
  <p id="admmsg" class="msgline" aria-live="polite"></p>`+fn();
  sh.scrollTop=top;updateStatus();
}

function aProducts(){
  const cats=S.cats;
  if(!cats.length)return '<div class="acard"><h3>Crie uma categoria primeiro</h3><p class="note">Abra a aba Categorias e adicione a primeira.</p></div>';
  const catOpts=cats.map(c=>[c.id,c.name]);
  const list=S.products.filter(p=>ui.filter==='all'||p.cat===ui.filter);
  let h='';
  if(S.config.sample)h+='<div class="sample"><span>Os produtos e preços abaixo são exemplos. Troque pelos do cardápio de vocês antes de divulgar o site.</span><button class="btn btn-gold btn-sm" data-act="dismisssample">Entendi</button></div>';
  h+=`<div class="acard"><h3>Novo produto</h3><div class="cols">${'<label class="fld"><span class="lbl">Categoria</span><select class="in" id="np-cat">'+catOpts.map(c=>`<option value="${esc(c[0])}"${c[0]===(ui.filter==='all'?cats[0].id:ui.filter)?' selected':''}>${esc(c[1])}</option>`).join('')+'</select></label>'}
  <label class="fld"><span class="lbl">Nome</span><input class="in" id="np-name"></label><label class="fld"><span class="lbl">Preço (R$)</span><input class="in" id="np-price" inputmode="decimal" placeholder="0,00"></label></div>
  <label class="fld"><span class="lbl">Descrição</span><input class="in" id="np-desc" placeholder="Ingredientes, tamanho..."></label>
  <div class="fld"><span class="lbl">Foto (opcional) · proporção ${rtxt('prod')}</span><div class="arow"><span id="np-prev">${ui.npImg?'<img class="thumb" src="'+ui.npImg+'" alt="">':''}</span><input type="file" accept="image/*" data-img="np:"></div></div>
  <div><button class="btn btn-gold" data-act="addprod">Adicionar produto</button></div></div>
  <label class="fld" style="max-width:320px"><span class="lbl">Mostrar</span><select class="in" id="pfilter" data-filter="1"><option value="all">Todas as categorias</option>${catOpts.map(c=>`<option value="${esc(c[0])}"${c[0]===ui.filter?' selected':''}>${esc(c[1])}</option>`).join('')}</select></label>`;
  if(!list.length)h+='<p class="note">Nenhum produto nesta categoria.</p>';
  list.forEach(p=>{
    h+=`<div class="acard"><div class="cols">${fText('Nome','products',p.id,'name',p.name)}${fText('Preço (R$)','products',p.id,'price',fmtMoney(p.price),{t:'money',mode:'decimal'})}${fSel('Categoria','products',p.id,'cat',p.cat,catOpts)}</div>
    ${fText('Descrição','products',p.id,'desc',p.desc||'')}
    <div class="arow">${p.img?'<img class="thumb" src="'+p.img+'" alt="">':''}<input type="file" accept="image/*" data-img="prod:${p.id}"><span class="note">${rtxt('prod')}</span></div>
    <div class="arow">${fChk('Disponível no site','products',p.id,'on',p.on)}<span class="sp"></span>${mvBtns('products',p.id)}${delBtn('products',p.id)}</div></div>`;
  });
  return h;
}

function aCats(){
  let h=`<div class="acard"><h3>Nova categoria</h3><div class="cols"><label class="fld"><span class="lbl">Nome</span><input class="in" id="nc-name" placeholder="Ex.: Porções"></label>
  <label class="fld"><span class="lbl">Ícone</span><select class="in" id="nc-icon">${iconOpts.map(i=>`<option value="${i[0]}">${i[1]}</option>`).join('')}</select></label></div><div><button class="btn btn-gold" data-act="addcat">Adicionar categoria</button></div></div>`;
  S.cats.forEach(c=>{
    const n=S.products.filter(p=>p.cat===c.id).length;
    h+=`<div class="acard"><div class="cols">${fText('Nome','cats',c.id,'name',c.name)}${fSel('Ícone','cats',c.id,'icon',c.icon,iconOpts)}</div>
    <div class="arow"><span class="note">${n} ${n===1?'produto':'produtos'}</span><span class="sp"></span>${mvBtns('cats',c.id)}${delBtn('cats',c.id,'Excluir',n?'Excluir categoria e '+n+(n===1?' produto?':' produtos?'):'Confirmar exclusão')}</div></div>`;
  });
  return h;
}

function aBuild(){
  const b=S.builder;
  let h=`<div class="acard"><h3>Monte o seu</h3>${'<label class="chk"><input type="checkbox" id="c-builder-on" data-cfg="builder.on" data-t="bool"'+(b.on?' checked':'')+'>Mostrar no site</label>'}
  <div class="cols">${cfgText('Título da aba','builder.title',b.title||'')}${cfgText('Texto de apoio','builder.intro',b.intro||'')}</div>
  <p class="note">O cliente escolhe um item de cada grupo e o preço soma sozinho. Preço zero aparece como "incluso".</p></div>`;
  b.groups.forEach(g=>{
    h+=`<div class="acard"><div class="cols">${fText('Nome do grupo','groups',g.id,'name',g.name)}${fSel('Tipo de escolha','groups',g.id,'type',g.type,[['single','Escolhe 1'],['multi','Vários']])}</div>
    <div class="arow">${fChk('Obrigatório (só no tipo "Escolhe 1")','groups',g.id,'required',g.required)}<span class="sp"></span>${mvBtns('groups',g.id)}${delBtn('groups',g.id,'Excluir grupo',g.opts.length?'Excluir grupo e opções?':'Confirmar exclusão')}</div>`;
    g.opts.forEach(o=>{
      h+=`<div class="opt-row">${fText('Opção','opts',o.id,'name',o.name,{gid:g.id})}${fText('Preço (R$)','opts',o.id,'price',fmtMoney(o.price),{t:'money',mode:'decimal',gid:g.id})}<div class="arow">${mvBtns('opts',o.id,g.id)}${delBtn('opts',o.id,'×','Excluir?',g.id)}</div></div>`;
    });
    h+=`<div class="opt-row"><label class="fld"><span class="lbl">Nova opção</span><input class="in" id="no-name-${g.id}" placeholder="Ex.: Cebola roxa"></label><label class="fld"><span class="lbl">Preço (R$)</span><input class="in" id="no-price-${g.id}" inputmode="decimal" placeholder="0,00"></label><div class="arow"><button class="btn btn-gold btn-sm" data-act="addopt" data-gid="${g.id}">Adicionar</button></div></div></div>`;
  });
  h+=`<div class="acard"><h3>Novo grupo</h3><div class="cols"><label class="fld"><span class="lbl">Nome</span><input class="in" id="ng-name" placeholder="Ex.: Acompanhamento"></label><label class="fld"><span class="lbl">Tipo de escolha</span><select class="in" id="ng-type"><option value="single">Escolhe 1</option><option value="multi">Vários</option></select></label></div><div><button class="btn btn-gold" data-act="addgroup">Adicionar grupo</button></div></div>`;
  return h;
}

function aAds(){
  let h=`<div class="acard"><h3>Novo anúncio</h3><p class="note">Aparece numa faixa fina no topo do site. Com mais de um ativo, eles se alternam a cada 5 segundos.</p>
  <label class="fld"><span class="lbl">Texto</span><input class="in" id="na-text" maxlength="120" placeholder="Ex.: Combo Clássico com preço especial hoje"></label>
  <label class="fld"><span class="lbl">Link (opcional)</span><input class="in" id="na-url" placeholder="https://..."></label><div><button class="btn btn-gold" data-act="addad">Adicionar anúncio</button></div></div>`;
  if(!S.ads.length)h+='<p class="note">Nenhum anúncio cadastrado. O site não mostra a faixa enquanto não houver um ativo.</p>';
  S.ads.forEach(a=>{
    h+=`<div class="acard">${fText('Texto','ads',a.id,'text',a.text)}${fText('Link (opcional)','ads',a.id,'url',a.url||'')}
    <div class="arow">${fChk('Ativo','ads',a.id,'on',a.on)}<span class="sp"></span>${mvBtns('ads',a.id)}${delBtn('ads',a.id)}</div></div>`;
  });
  return h;
}

function aLinks(){
  const c=S.config;
  let h=`<div class="acard"><h3>Contato e textos</h3><div class="cols">${cfgText('Nome da loja','config.name',c.name||'')}${cfgText('WhatsApp dos pedidos','config.whatsapp',fmtPhone(c.whatsapp),{t:'phone',mode:'tel'})}</div>
  <div class="cols">${cfgText('Localização (aparece no topo e no rodapé)','config.address',c.address||'')}${cfgText('Horário de funcionamento','config.hours',c.hours||'',{ph:'Ex.: Todos os dias, das 18h às 23h'})}</div>
  ${cfgText('Aviso sobre a entrega (aparece no carrinho)','config.deliveryNote',c.deliveryNote||'')}${cfgText('Quem somos: apresentação curta','config.about',c.about||'')}${cfgText('Quem somos: nossa história','config.story',c.story||'')}</div>
  <div class="acard"><h3>Novo link</h3><div class="cols"><label class="fld"><span class="lbl">Nome</span><input class="in" id="nl-label" placeholder="Ex.: Instagram"></label><label class="fld"><span class="lbl">Endereço do link</span><input class="in" id="nl-url" placeholder="https://instagram.com/seuperfil"></label></div><div><button class="btn btn-gold" data-act="addlink">Adicionar link</button></div></div>`;
  S.links.forEach(l=>{
    const bad=l.url&&!safeUrl(l.url);
    h+=`<div class="acard"><div class="cols">${fText('Nome','links',l.id,'label',l.label)}${fText('Endereço do link','links',l.id,'url',l.url||'',{ph:'https://...'})}</div>
    ${bad?'<p class="msgline bad">Esse endereço não vale. Use algo como https://instagram.com/seuperfil</p>':''}
    <div class="arow">${fChk('Mostrar no site','links',l.id,'on',l.on)}<span class="note">${l.url?'':'Sem endereço, o link não aparece.'}</span><span class="sp"></span>${mvBtns('links',l.id)}${delBtn('links',l.id)}</div></div>`;
  });
  return h;
}

function aSec(){
  return `<form class="acard" id="pwform" style="max-width:460px" novalidate><h3>Trocar a senha</h3>
  <label class="fld"><span class="lbl">Senha atual</span><input class="in" id="pw-old" type="password" autocomplete="current-password"></label>
  <label class="fld"><span class="lbl">Nova senha (mínimo 6 caracteres)</span><input class="in" id="pw-new" type="password" autocomplete="new-password"></label>
  <label class="fld"><span class="lbl">Repita a nova senha</span><input class="in" id="pw-new2" type="password" autocomplete="new-password"></label>
  <div><button class="btn btn-gold" type="submit">Trocar senha</button></div>
  <p class="note">A nova senha passa a valer para todos depois que salvar no Supabase / publicar.</p></form>
  <div class="acard"><h3>Como as mudanças chegam ao site</h3><p class="note">Com Supabase configurado, cada alteração é salva automaticamente no banco (tabela store_state) e aparece para todos. Sem Supabase, fica como rascunho neste aparelho até publicar via Artifact.</p></div>`;
}

function aFin(){
  const b=new Date();b.setDate(1);b.setMonth(b.getMonth()+ui.fm);const y=b.getFullYear(),m=b.getMonth(),pm=new Date(y,m-1,1);
  const inM=(d,Y,M)=>d.getFullYear()===Y&&d.getMonth()===M;let tot=0,cnt=0,pt=0;const day={};
  ORDERS.forEach(o=>{const d=new Date(o.t),v=Number(o.total)||0;if(inM(d,y,m)){const k=d.getDate();day[k]=day[k]||{v:0,n:0};day[k].v+=v;day[k].n++;tot+=v;cnt++}else if(inM(d,pm.getFullYear(),pm.getMonth()))pt+=v});
  const first=new Date(y,m,1).getDay(),dim=new Date(y,m+1,0).getDate(),now=new Date(),nm=new Date(y,m,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  let cells='';for(let i=0;i<first;i++)cells+='<i></i>';
  for(let d=1;d<=dim;d++){const x=day[d];cells+=`<div class="cd${x?' has':''}${inM(now,y,m)&&now.getDate()===d?' now':''}"><span>${d}</span>${x?`<b>R$${Math.round(x.v)}</b><small>${x.n} ped.</small>`:''}</div>`}
  const diff=pt>0?Math.round((tot-pt)/pt*100):null;
  return `<div class="acard"><div class="arow"><button class="btn btn-line btn-sm" data-act="fm" data-v="-1" aria-label="Mês anterior">‹</button><h3 style="flex:1;text-align:center;text-transform:capitalize">${nm}</h3><button class="btn btn-line btn-sm" data-act="fm" data-v="1" aria-label="Próximo mês">›</button></div>
  <div class="arow"><button class="btn btn-line btn-sm" data-act="fm" data-set="-1">Mês passado</button><button class="btn btn-line btn-sm" data-act="fm" data-set="0">Mês atual</button></div></div>
  <div class="stats"><div class="stat big"><span class="lbl">Faturamento do mês</span><b>${brl(tot)}</b><small>${cnt} pedidos${cnt?' · ticket médio '+brl(tot/cnt):''}</small></div><div class="stat"><span class="lbl">Mês anterior</span><b>${brl(pt)}</b></div><div class="stat"><span class="lbl">Variação</span><b>${diff===null?'—':(diff>0?'+':'')+diff+'%'}</b></div></div>
  <div class="cal">${['D','S','T','Q','Q','S','S'].map(x=>`<em>${x}</em>`).join('')}${cells}</div>
  <p class="note">Mostra os pedidos registrados neste aparelho.</p>`;
}

function aOrders(){
  const td=ORDERS.filter(o=>new Date(o.t).toDateString()===new Date().toDateString()),sum=a=>a.reduce((x,o)=>x+(Number(o.total)||0),0);
  let h=`<div class="stats"><div class="stat big"><span class="lbl">Faturado hoje</span><b>${brl(sum(td))}</b><small>${td.length} pedidos hoje</small></div><div class="stat"><span class="lbl">Faturado no total</span><b>${brl(sum(ORDERS))}</b></div><div class="stat"><span class="lbl">Pedidos no total</span><b>${ORDERS.length}</b></div></div>
  <p class="note">Os pedidos aparecem aqui no aparelho em que foram enviados. Pedidos de outros aparelhos você registra manualmente no fim da página.</p>
  <div class="seg seg4">${STAT.map(x=>`<button data-act="ost" data-v="${x[0]}" aria-pressed="${ui.ost===x[0]}">${x[1]} (${ORDERS.filter(o=>o.st===x[0]).length})</button>`).join('')}</div>`;
  const L=ORDERS.filter(o=>o.st===ui.ost);if(!L.length)h+='<p class="note">Nenhum pedido nesta etapa.</p>';
  L.forEach(o=>{const nx=STAT[STAT.findIndex(x=>x[0]===o.st)+1];
    h+=`<div class="acard"><div class="line-top"><div><h3>${esc(o.name||'Cliente')}</h3><p class="note">${new Date(o.t).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})} · ${o.mode==='entrega'?'Entrega'+(o.hood?' - '+esc(o.hood):''):'Retirada'}${o.pay?' · '+esc(o.pay):''}</p></div><b class="price">${brl(o.total)}</b></div><p class="note">${o.items.map(esc).join(' · ')}${o.fee?' · Entrega '+brl(o.fee):''}</p>
    <div class="arow">${nx?`<button class="btn btn-gold btn-sm" data-act="oadv" data-id="${o.id}">Passar para: ${nx[1]}</button>`:''}<span class="sp"></span>${delBtn('orders',o.id)}</div></div>`});
  return h+`<div class="acard"><h3>Registrar pedido manual</h3><div class="cols"><label class="fld"><span class="lbl">Cliente</span><input class="in" id="mo-name"></label><label class="fld"><span class="lbl">Bairro</span><input class="in" id="mo-hood"></label><label class="fld"><span class="lbl">Valor total (R$)</span><input class="in" id="mo-total" inputmode="decimal" placeholder="0,00"></label></div><div><button class="btn btn-gold" data-act="addmo">Registrar</button></div></div>`;
}

function aZones(){
  let h=`<div class="acard"><h3>Nova região de entrega</h3><p class="note">Cada bairro com a sua taxa. O cliente escolhe o bairro e o valor entra no total do pedido.</p><div class="cols"><label class="fld"><span class="lbl">Bairro / região</span><input class="in" id="nz-name" placeholder="Ex.: Suarão"></label><label class="fld"><span class="lbl">Taxa (R$)</span><input class="in" id="nz-fee" inputmode="decimal" placeholder="0,00"></label></div><div><button class="btn btn-gold" data-act="addzone">Adicionar região</button></div></div>`;
  S.zones.forEach(z=>{h+=`<div class="acard"><div class="cols">${fText('Bairro / região','zones',z.id,'name',z.name)}${fText('Taxa (R$)','zones',z.id,'fee',fmtMoney(z.fee),{t:'money',mode:'decimal'})}</div><div class="arow">${fChk('Entrega ativa','zones',z.id,'on',z.on)}<span class="sp"></span>${mvBtns('zones',z.id)}${delBtn('zones',z.id)}</div></div>`});
  return h;
}

function aPhotos(){
  let h='<div class="acard"><h3>Fotos do site</h3><p class="note">Troque, esconda ou remova cada foto. Foto escondida não aparece no site.</p></div>';
  SLOTS.forEach(x=>{const p=S.photos[x[0]],has=p&&p.src;
    h+=`<div class="acard"><div class="arow">${has?`<img class="thumb" src="${p.src}" alt="">`:'<div class="thumb"></div>'}<div><h3>${x[1]}</h3><p class="note">${has?(p.on===false?'Escondida':'Aparecendo'):'Sem foto'}</p></div></div><input type="file" accept="image/*" data-img="slot:${x[0]}"><span class="note">Proporção recomendada: ${rtxt(x[2])}. A foto é ajustada automaticamente.</span>${has?`<div class="arow"><label class="chk"><input type="checkbox" data-cfg="photos.${x[0]}.on" data-t="bool"${p.on!==false?' checked':''}>Mostrar no site</label><span class="sp"></span><button class="btn btn-danger btn-sm" data-act="rmimg" data-k="slot" data-id="${x[0]}">Remover</button></div>`:''}</div>`});
  h+='<div class="acard"><h3>Fotos dos produtos</h3></div>';
  S.products.forEach(p=>{h+=`<div class="acard"><div class="arow">${p.img?`<img class="thumb" src="${p.img}" alt="">`:'<div class="thumb"></div>'}<h3>${esc(p.name)}</h3></div><input type="file" accept="image/*" data-img="prod:${p.id}"><span class="note">Proporção recomendada: ${rtxt('prod')}</span>${p.img?`<div><button class="btn btn-danger btn-sm" data-act="rmimg" data-k="prod" data-id="${p.id}">Remover foto</button></div>`:''}</div>`});
  return h;
}

function lock(on){document.documentElement.style.overflow=on?'hidden':''}

function openCart(){ui.cart=true;$('#cart').hidden=false;lock(true);renderCartSheet();renderCartBar();$('#cart').scrollTop=0;$('#cart-close').focus()}

function closeCart(){ui.cart=false;$('#cart').hidden=true;lock(ui.admin);renderCartBar();renderView()}

function openAdmin(){ui.admin=true;$('#admin').hidden=false;lock(true);renderAdmin();renderCartBar();updateStatus();const p=$('#pw');if(p)p.focus();else $('#admin-close').focus()}

function closeAdmin(){ui.admin=false;$('#admin').hidden=true;lock(ui.cart);cleanCart();saveCart();initBP();renderAll()}

function mv(col,id,d,gid){
  let arr,same=()=>true;
  if(col==='products'){arr=S.products;const p=arr.find(x=>x.id===id);if(!p)return;same=x=>x.cat===p.cat}
  else if(col==='cats')arr=S.cats;else if(col==='links')arr=S.links;else if(col==='ads')arr=S.ads;
  else if(col==='groups')arr=S.builder.groups;else if(col==='zones')arr=S.zones;
  else if(col==='opts'){const g=S.builder.groups.find(x=>x.id===gid);arr=g&&g.opts}
  if(!arr)return;
  const i=arr.findIndex(x=>x.id===id);let j=i+d;
  while(j>=0&&j<arr.length&&!same(arr[j]))j+=d;
  if(i<0||j<0||j>=arr.length)return;
  const t=arr[i];arr[i]=arr[j];arr[j]=t;
}

function doDel(col,id,gid){
  if(col==='products')S.products=S.products.filter(x=>x.id!==id);
  else if(col==='cats'){S.cats=S.cats.filter(x=>x.id!==id);S.products=S.products.filter(x=>x.cat!==id);if(ui.filter===id)ui.filter='all'}
  else if(col==='links')S.links=S.links.filter(x=>x.id!==id);
  else if(col==='ads')S.ads=S.ads.filter(x=>x.id!==id);else if(col==='zones')S.zones=S.zones.filter(x=>x.id!==id);else if(col==='orders'){ORDERS=ORDERS.filter(x=>x.id!==id);saveOrders()}
  else if(col==='groups')S.builder.groups=S.builder.groups.filter(x=>x.id!==id);
  else if(col==='opts'){const g=S.builder.groups.find(x=>x.id===gid);if(g)g.opts=g.opts.filter(x=>x.id!==id)}
}

function findItem(col,id,gid){
  if(col==='products')return S.products.find(x=>x.id===id);
  if(col==='cats')return S.cats.find(x=>x.id===id);
  if(col==='links')return S.links.find(x=>x.id===id);
  if(col==='ads')return S.ads.find(x=>x.id===id);
  if(col==='zones')return S.zones.find(x=>x.id===id);
  if(col==='groups')return S.builder.groups.find(x=>x.id===id);
  if(col==='opts'){const g=S.builder.groups.find(x=>x.id===gid);return g&&g.opts.find(x=>x.id===id)}
}

function setPath(o,path,v){const k=path.split('.');let t=o;for(let i=0;i<k.length-1;i++)t=t[k[i]];t[k[k.length-1]]=v}

const struct=(m)=>{touch();renderAdmin();if(m)say(m,'good')};

function getReset(){
  const st=$$('style',document.head).find(s=>s.id!=='ita-css'&&/safe-area-inset/.test(s.textContent)&&/\[hidden\]/.test(s.textContent)&&s.textContent.length<4000);
  return st?st.textContent:':root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}';
}

const JS_FILES=['js/utils.js','js/supabase-config.js','js/supabase.js','js/assets.js','js/data.js','js/state.js','js/cart.js','js/render.js','js/admin.js','js/actions.js','js/main.js'];
async function fetchText(url){const r=await fetch(url);if(!r.ok)throw new Error('Não consegui carregar '+url);return r.text()}
async function imgDataUrl(url){if(url.startsWith('data:'))return url;const buf=await (await fetch(url)).arrayBuffer();const bytes=new Uint8Array(buf);let bin='';for(let i=0;i<bytes.length;i+=8192)bin+=String.fromCharCode.apply(null,Array.from(bytes.subarray(i,i+8192)));return 'data:image/jpeg;base64,'+btoa(bin)}
async function getResetAsync(){const inline=getReset();if(inline&&inline.length>0){try{const r=await fetch('css/reset.css');if(r.ok)return await r.text()}catch(e){}}return inline}
async function buildDoc(state){
  const data=JSON.stringify(state).replace(/</g,'\\u003c');
  const reset=await getResetAsync();
  let css='',main='';
  const cssEl=document.querySelector('#ita-css'),mainEl=document.querySelector('#ita-main');
  if(cssEl&&cssEl.textContent.trim())css=cssEl.textContent;
  else css=await fetchText('css/style.css');
  if(mainEl&&mainEl.textContent.trim())main=mainEl.textContent;
  else{
    const parts=[];
    for(const f of JS_FILES){
      let t=await fetchText(f);
      if(f==='js/assets.js'){
        for(const k in IMG){
          try{const dataUrl=await imgDataUrl(IMG[k]);t=t.split('"'+IMG[k]+'"').join('"'+dataUrl+'"')}catch(e){}
        }
      }
      parts.push(t);
    }
    main=parts.join('\n');
  }
  const fontsEl=document.querySelector('#ita-fonts');
  const fontsHtml=fontsEl?fontsEl.outerHTML:'<link id="ita-fonts" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@500;600;700&family=Bowlby+One&display=swap">';
  const sbHtml='<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></scr'+'ipt>';
  return '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>'+reset+'</style></head><body>'+
  '<title>Ita Burger</title><meta name="claude:viewport-fit-sides" content="cover">'+fontsHtml+sbHtml+
  '<style id="ita-css">'+css+'</style><div id="app"></div>'+
  '<script type="application/json" id="ita-data">'+data+'<\/script><script id="ita-main">'+main+'<\/script></body></html>';
}
async function doPublish(){
  const btn=$('#btn-publish');
  if(sbReady()){
    btn.disabled=true;say('Salvando no Supabase…');
    try{await flushSave();say('Salvo no Supabase ✓','good')}
    catch(e){say('Não salvou: '+(e&&e.message||e),'bad')}
    btn.disabled=false;updateStatus();return;
  }
  let art=null;
  try{art=window.claude&&window.claude.use?await window.claude.use('artifact'):null}catch(e){}
  if(!art){say('Publicar não está disponível nesta tela. Abra o site pelo link original, logado na sua conta, e tente de novo.','bad');return}
  const next=clone(S);next.v=(DATA.v||1)+1;
  btn.disabled=true;say('Publicando…');
  try{
    SS.set('ita-pub',String(next.v));SS.set('ita-reopen','1');
    await art.publish(await buildDoc(next));
    say('Publicado. A página vai recarregar.','good');
  }catch(e){
    SS.del('ita-pub');SS.del('ita-reopen');btn.disabled=false;
    const c=e&&e.code;
    say(c==='not_writer'||c==='not_granted'||c==='consent_required'?'Esta conta só pode ver o site. Peça permissão de edição ao dono para publicar.':
        c==='conflict'?'Outra versão foi publicada antes. A página vai recarregar com ela. Refaça a alteração se precisar.':
        c==='rate_limited'?'Muitas publicações seguidas. Espere um minuto e tente de novo.':
        c==='too_large'?'O site ficou grande demais para publicar.':
        'Não foi possível publicar agora. Suas alterações continuam salvas como rascunho.','bad');
  }
}

