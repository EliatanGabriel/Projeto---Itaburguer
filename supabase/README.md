# Supabase — Ita Burger

Banco: `store_state` (1 linha, `id=1`, `data jsonb` = JSON da loja) + `orders` (pedidos de todos os aparelhos).

## Passo a passo (inclui TRAVA)

1. Crie um projeto em https://supabase.com (plano free serve).
2. No painel do projeto, abra **SQL Editor → New query** e cole/execute todo o conteúdo de `supabase/schema.sql`.
3. Em **Settings → API**, copie:
   - `Project URL` (ex: `https://abcdefgh.supabase.co`)
   - `anon public` key (é pública, pode ir no frontend)
4. Edite `js/supabase-config.js` e preencha `url` e `anonKey`.
5. **Travar escrita (obrigatório antes de divulgar):**
   - SQL Editor → execute `supabase/lock.sql` (ou `supabase/orders.sql` já vem travado)
   - **Authentication → Users → Add user** → crie **1 usuário só do dono** (e-mail + senha forte, marque Auto Confirm)
6. Rode `node scripts/build.js` e faça deploy na Vercel (push no GitHub).
7. Teste:
   - Visitante abre o site → vê cardápio (leitura pública) e consegue pedir (insert em `orders`).
   - Admin → pede **e-mail + senha do Auth** → edita → “Salvo no Supabase”.
   - Sem login, tentar escrever via API → bloqueado (RLS).

## Segurança

A política em `schema.sql`/`orders.sql` já é **travada**:
- `store_state`: select público, insert/update só `authenticated`
- `orders`: insert público (cliente), select/update/delete só `authenticated`
- Login do Admin é via Supabase Auth (`signInWithPassword`). A senha local antiga só vale sem Supabase.

## Como funciona no código

- `js/supabase.js`: `sbLoad()` lê `store_state`, `sbSave(S)` faz `upsert` com `S` inteiro; `sbInsertOrder/sbListOrders/sbUpdateOrder/sbDeleteOrder` cuidam da tabela `orders`.
- `js/main.js`: antes do primeiro render, tenta `sbLoad()` e `sbListOrders()`; se falhar, usa `data/cardapio.json` / `#ita-data`. Poll a cada 10s atualiza Pedidos/Financeiro do dono.
- `js/admin.js`: cada `touch()` (debounce 400ms) salva no Supabase; botão passa a “Salvar no Supabase”. Sem config, volta ao rascunho local + publicar via Artifact.
- Pedidos: cliente insere em `orders` ao clicar “Enviar pelo WhatsApp” (`logOrder`); dono vê/avança status no Admin (também recebe no WhatsApp).

> **Você já rodou `schema.sql` antes?** Rode só `supabase/orders.sql` agora (SQL Editor → Run). O `schema.sql` já inclui as duas tabelas para projetos novos.

## Seed

`supabase/seed.json` é uma cópia de `data/cardapio.json` para conferência. A fonte de verdade do seed é o `INSERT` em `schema.sql` (gerado de `data/cardapio.json`). Se mudar o cardápio local, regenere com o build.
