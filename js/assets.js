// Ita Burger — assets: imagens da marca (logo + hero) e ícones SVG
// As fotos estão em assets/images/; o build as embute como base64 no arquivo único.

const IMG={mark:"assets/images/logo.jpg",hero:"assets/images/hero.jpg"};

const ICONS=[['burger','Hambúrguer'],['sandwich','Lanche'],['hotdog','Hot dog'],['drink','Bebida'],['combo','Combo'],['star','Destaque']];

const SPRITE=`<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<symbol id="i-burger" viewBox="0 0 64 64"><path d="M7 27C7 15 18 7 32 7s25 8 25 20z" style="fill:var(--gold)"/><circle cx="21" cy="17" r="1.7" style="fill:var(--cream)"/><circle cx="32" cy="13" r="1.7" style="fill:var(--cream)"/><circle cx="43" cy="18" r="1.7" style="fill:var(--cream)"/><path d="M5 31c4 5 8-3 12 0s8 3 12 0 8 3 12 0 8 3 12 0 4 0 4 0v3H5z" style="fill:#6cb33a"/><path d="M7 34h50l-5 6h-9l-3 4-3-4H7z" style="fill:#f5c542"/><rect x="7" y="38" width="50" height="8" rx="4" style="fill:#5a2a1b"/><path d="M7 48h50v2c0 4-3 7-7 7H14c-4 0-7-3-7-7z" style="fill:var(--gold)"/></symbol>
<symbol id="i-sandwich" viewBox="0 0 64 64"><rect x="8" y="9" width="48" height="14" rx="6" style="fill:var(--gold)"/><rect x="5" y="25" width="54" height="6" rx="3" style="fill:#6cb33a"/><rect x="8" y="33" width="48" height="6" rx="3" style="fill:var(--red)"/><rect x="5" y="41" width="54" height="5" rx="2.5" style="fill:#f5c542"/><rect x="8" y="48" width="48" height="10" rx="5" style="fill:var(--gold)"/></symbol>
<symbol id="i-hotdog" viewBox="0 0 64 64"><rect x="3" y="28" width="58" height="26" rx="13" style="fill:var(--gold)"/><rect x="1" y="21" width="62" height="16" rx="8" style="fill:#a8412c"/><path d="M7 27q6-6 12 0t12 0 12 0 12 0" style="fill:none;stroke:#f5c542;stroke-width:3.5;stroke-linecap:round"/></symbol>
<symbol id="i-drink" viewBox="0 0 64 64"><path d="M34 14l4-10h12" style="fill:none;stroke:var(--cream);stroke-width:3.5;stroke-linecap:round"/><rect x="15" y="14" width="34" height="7" rx="3.5" style="fill:var(--cream)"/><path d="M18 21h28l-3.5 38h-21z" style="fill:var(--red)"/><path d="M20 32h24l-.8 9H20.8z" style="fill:var(--cream)"/></symbol>
<symbol id="i-combo" viewBox="0 0 64 64"><path d="M4 30c0-9 7-15 15-15s15 6 15 15z" style="fill:var(--gold)"/><rect x="4" y="32" width="30" height="6" rx="3" style="fill:#5a2a1b"/><path d="M4 40h30v1c0 4-3 7-7 7H11c-4 0-7-3-7-7z" style="fill:var(--gold)"/><rect x="38" y="10" width="4" height="20" rx="2" style="fill:#f5c542"/><rect x="44" y="6" width="4" height="24" rx="2" style="fill:#f5c542"/><rect x="50" y="11" width="4" height="19" rx="2" style="fill:#f5c542"/><rect x="56" y="14" width="4" height="16" rx="2" style="fill:#f5c542"/><path d="M36 26h26l-3 32H39z" style="fill:var(--red)"/></symbol>
<symbol id="i-star" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" style="fill:var(--red)"/><path d="M32 13l5.6 11.6 12.7 1.7-9.3 8.8 2.3 12.6L32 41.5 20.7 47.7 23 35.1l-9.3-8.8 12.7-1.7z" style="fill:var(--gold)"/></symbol>
</defs></svg>`;

const icon=n=>`<svg aria-hidden="true"><use href="#i-${ICONS.some(i=>i[0]===n)?n:'star'}"/></svg>`;

