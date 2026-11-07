// Ita Burger — utilidades: DOM, formatação (BRL/telefone), armazenamento e segurança
// Extraído de #ita-main (utilidades) no arquivo único.

const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));

const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const clone=o=>JSON.parse(JSON.stringify(o));

const uid=()=>Math.random().toString(36).slice(2,10);

const brl=n=>(Number(n)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

const mk=name=>({get(k){try{return window[name].getItem(k)}catch(e){return null}},set(k,v){try{window[name].setItem(k,v)}catch(e){}},del(k){try{window[name].removeItem(k)}catch(e){}}});

const LS=mk('localStorage'),SS=mk('sessionStorage');

const parseMoney=s=>{s=String(s).replace(/[^\d,.-]/g,'');if(s.indexOf(',')>-1)s=s.replace(/\./g,'').replace(',','.');const n=parseFloat(s);return isFinite(n)&&n>0?Math.round(n*100)/100:0};

const fmtMoney=n=>(Number(n)||0).toFixed(2).replace('.',',');

const safeUrl=u=>{u=String(u||'').trim();if(!u)return'';if(/^https?:\/\//i.test(u))return u;if(/^[a-z][a-z0-9+.-]*:/i.test(u))return'';if(/^[^\s\/]+\.[a-z]{2,}/i.test(u))return'https://'+u;return''};

const normPhone=s=>{let d=String(s).replace(/\D/g,'');if(d.length===10||d.length===11)d='55'+d;return d};

const fmtPhone=d=>{d=String(d||'').replace(/\D/g,'');if(d.indexOf('55')===0&&d.length>=12)d=d.slice(2);if(d.length===11)return'('+d.slice(0,2)+') '+d.slice(2,7)+'-'+d.slice(7);if(d.length===10)return'('+d.slice(0,2)+') '+d.slice(2,6)+'-'+d.slice(6);return d};

const sha=async s=>{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')};

const getTheme=()=>LS.get('ita-theme')==='light'?'light':'dark';
function applyTheme(t){t=t==='light'?'light':'dark';document.documentElement.setAttribute('data-theme',t);LS.set('ita-theme',t);const b=$('#theme-toggle');if(b){b.innerHTML=(t==='light'?'🌙':'☀️')+'<span class="tl">'+(t==='light'?' Escuro':' Claro')+'</span>';b.setAttribute('aria-pressed',String(t==='light'));b.title=t==='light'?'Mudar para modo escuro':'Mudar para modo claro';b.setAttribute('aria-label',t==='light'?'Mudar para modo escuro':'Mudar para modo claro')}}
try{document.documentElement.setAttribute('data-theme',getTheme())}catch(e){}

