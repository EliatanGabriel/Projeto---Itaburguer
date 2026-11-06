# Ita Burger — arquitetura

## Estrutura

```
index.html                entrada (estrutura mínima)
css/reset.css             safe-area / viewport
css/style.css             estilos (era #ita-css)
js/supabase-config.js     URL + anonKey do Supabase (preencher)
js/supabase.js            cliente Supabase (store_state + orders)
js/data.js                dados (era #ita-data) — GERADO de data/cardapio.json
data/cardapio.json        seed/fallback: produtos, cats, zonas, builder, config
js/assets.js              logo/hero (caminhos) + ícones SVG
assets/images/logo.jpg    logo
assets/images/hero.jpg    mascote/pinguim
js/utils.js               DOM, BRL/telefone, store, SHA-256
js/state.js               estado global: S, carrinho, pedido, UI
js/cart.js                carrinho, "monte o seu", WhatsApp, validação
js/render.js              vitrine, cardápio, home/about, carrinho
js/admin.js               administração: CRUD, pedidos, finanças, fotos, senha, salvar
js/actions.js             eventos globais (cliques, inputs, formulários, upload)
js/main.js                inicialização (tenta Supabase, senão fallback local)
supabase/schema.sql       SQL para criar store_state + seed + RLS
supabase/orders.sql       SQL para criar orders (rodar se já rodou o schema)
supabase/seed.json        cópia do seed para conferência
supabase/README.md        passo a passo do Supabase
scripts/build.js          gera dist/Ita Burger.html
dist/Ita Burger.html      ARQUIVO ÚNICO publicável (Artifact/hosting)
```

## Como rodar

```bash
# qualquer servidor estático na raiz
python3 -m http.server
# -> http://localhost:8000/index.html
```

## Supabase (banco de dados)

1. Crie um projeto em https://supabase.com
2. SQL Editor → execute `supabase/schema.sql` (ou `supabase/orders.sql` se já rodou o schema)
3. Em `js/supabase-config.js`, preencha `url` e `anonKey` (Settings → API)
4. Recarregue: o site lê `store_state`; cliente insere em `orders` ao enviar WA; dono vê no Admin (poll 10s).

## Checklist antes de lançar (clientes reais)

- [ ] Admin → Contato e links: WhatsApp, endereço completo, horário, aviso de entrega
- [ ] Admin → Produtos: preços reais, `sample=false` (banner sai), fotos (Admin → Fotos)
- [ ] Admin → Contato: links Instagram/TikTok/Facebook reais (ou `on=false`)
- [ ] Hospedar em HTTPS (Vercel/Netlify/GitHub Pages) — `dist/` ou a raiz
- [ ] Testar 1 pedido real e conferir em Admin → Pedidos (e no WhatsApp)
- [ ] (Recomendado) Travar escrita do banco com Supabase Auth — ver `supabase/README.md`

Detalhes e segurança: `supabase/README.md`.

Sem Supabase configurado, o site continua funcionando com `data/cardapio.json`
+ rascunho local + publicar via Artifact (comportamento anterior).

## Como gerar o arquivo único

```bash
node scripts/build.js
# saída: dist/Ita Burger.html
```

O build embute CSS + JS + dados + imagens (base64) no mesmo formato do original
(`#ita-css`, `#ita-data`, `#ita-main`), já incluindo o CDN do Supabase e a config.

## Edições

- Com Supabase: edite pelo painel Admin (salva no banco automaticamente)
- Sem Supabase / seed inicial: edite `data/cardapio.json` e rode `node scripts/build.js`
- Visual: `css/style.css`
- Logo/hero: troque `assets/images/*.jpg` e rode o build
- Lógica: `js/*.js` (cada arquivo tem o cabeçalho com a responsabilidade)
