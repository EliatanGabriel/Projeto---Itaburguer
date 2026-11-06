// Ita Burger — estado: dados publicados (Supabase > #ita-data > js/data.js), carrinho, pedido e UI

let DATA=(()=>{const el=document.querySelector('#ita-data');if(el&&el.textContent.trim()){try{const d=JSON.parse(el.textContent);if(d&&d.v!==undefined)return d}catch(e){}}return window.ITA_DATA||{};})();

let S=clone(DATA);
function normState(o){
  const s=o||S;
  ['ads','links','cats','products','zones'].forEach(k=>{if(!Array.isArray(s[k]))s[k]=[]});
  s.builder=s.builder||{on:false,title:'Monte o seu',intro:'',groups:[]};
  s.builder.groups=s.builder.groups||[];
  s.config=s.config||{};s.photos=s.photos||{};
  if(!s.pw)s.pw=(DATA.pw||{salt:'ita-0',hash:''});
  return s;
}
if(SS.get('ita-pub')===String(DATA.v)){LS.del('ita-draft');SS.del('ita-pub')}
try{const d=LS.get('ita-draft');const noSb=typeof sbOn==='undefined'||sbOn!==true;if(d&&noSb)S=Object.assign(clone(DATA),JSON.parse(d))}catch(e){}
normState();

const ui={tab:null,cart:false,admin:false,unlocked:SS.get('ita-admin')==='1',atab:'orders',filter:'all',tries:0,page:'home',fm:0,npImg:'',ost:'todo'};

let CART=[];try{CART=JSON.parse(LS.get('ita-cart')||'[]')}catch(e){}
if(!Array.isArray(CART))CART=[];

let ORDER={mode:'entrega',name:'',street:'',num:'',hood:'',city:'Itanhaém',comp:'',ref:'',pay:'',change:''};
try{Object.assign(ORDER,JSON.parse(LS.get('ita-order')||'{}'))}catch(e){}

let BP={};

let ORDERS=[];try{ORDERS=JSON.parse(LS.get('ita-orders')||'[]')}catch(e){}if(!Array.isArray(ORDERS))ORDERS=[];

const saveOrders=()=>LS.set('ita-orders',JSON.stringify(ORDERS));

const STAT=[['todo','A fazer'],['prep','Sendo preparado'],['out','Saiu para entrega'],['done','Entregue']];

const RATIO={home:[4,5,1080],card:[8,3,1200],prod:[1,1,800],abh:[16,9,1280],abg:[4,3,1000]};

const rtxt=k=>{const R=RATIO[k];return R[0]+':'+R[1]+' ('+R[2]+'×'+Math.round(R[2]*R[1]/R[0])+' px)'};

const SLOTS_OLD=[['home','Capa da tela inicial'],['about','Card Conheça o Ita Burger'],['menu','Card Cardápio'],['loc','Card Localização'],['wa','Card WhatsApp'],['links','Cards de redes sociais']];

const SLOTS=[['home','Capa da tela inicial','home'],['about','Card Conheça o Ita Burger','card'],['menu','Card Cardápio','card'],['loc','Card Localização','card'],['wa','Card WhatsApp','card'],['links','Cards de redes sociais','card'],['abh','Quem somos: foto de capa','abh'],['ab1','Quem somos: foto da história','abg'],['ab2','Quem somos: galeria 1','abg'],['ab3','Quem somos: galeria 2','abg'],['ab4','Quem somos: galeria 3','abg']];

const photo=k=>{const p=S.photos[k];return p&&p.src&&p.on!==false?p.src:''};

const zonesOn=()=>S.zones.filter(z=>z.on&&z.name);

const curZone=()=>zonesOn().find(z=>z.id===ORDER.zone);

const deliv=()=>ORDER.mode==='entrega'&&curZone()?Number(curZone().fee)||0:0;

const grand=()=>Math.round((cartTotal()+deliv())*100)/100;

let adIdx=0;

const PAY={pix:'Pix',cartao:'Cartão',dinheiro:'Dinheiro'};

