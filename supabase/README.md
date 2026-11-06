# Supabase — Ita Burger

Banco: tabela `store_state` (1 linha, `id=1`, coluna `data jsonb` = todo o JSON da loja).

## Passo a passo

1. Crie um projeto em https://supabase.com (plano free serve).
2. No painel do projeto, abra **SQL Editor → New query** e cole/execute todo o conteúdo de `supabase/schema.sql`.
3. Em **Settings → API**, copie:
   - `Project URL` (ex: `https://abcdefgh.supabase.co`)
   - `anon public` key (é pública, pode ir no frontend)
4. Edite `js/supabase-config.js` e preencha `url` e `anonKey`.
5. Sirva o site (`python3 -m http.server`) e teste:
   - Abrir o site carrega os dados do banco.
   - Entrar no Admin, alterar preço/produto → status “Salvo no Supabase”.
   - Recarregar ou abrir em outra aba → aparece a alteração.
6. Se for gerar o arquivo único, rode `node scripts/build.js` (o `dist/Ita Burger.html` já inclui o CDN do Supabase e a config).

## Segurança — leia antes de divulgar

A política padrão em `schema.sql` é **pública para leitura e escrita** (modo demo, para funcionar sem login). Quem tiver a `anon key` consegue escrever na tabela. A senha do admin (`js/admin.js`) é só uma trava de tela — não protege o banco.

Para produção, faça um destas (recomendado):

- Crie um usuário em **Authentication → Users** (só você), depois troque no SQL Editor as políticas de `insert/update` para `using (auth.role() = 'authenticated')` e faça login via Supabase Auth no lugar da senha local. Fale comigo que eu migro o painel para Auth.
- Ou mantenha a demo só em ambiente interno.

## Como funciona no código

- `js/supabase.js`: `sbLoad()` lê `store_state`, `sbSave(S)` faz `upsert` com `S` inteiro.
- `js/main.js`: antes do primeiro render, tenta `sbLoad()`; se falhar, usa `data/cardapio.json` / `#ita-data`.
- `js/admin.js`: cada `touch()` (debounce 400ms) salva no Supabase; botão passa a “Salvar no Supabase”. Sem config, volta ao rascunho local + publicar via Artifact.
- Pedidos (`orders`): continuam locais em `localStorage["ita-orders"]`. Próxima fase pode migrar para tabela `orders`.

## Seed

`supabase/seed.json` é uma cópia de `data/cardapio.json` para conferência. A fonte de verdade do seed é o `INSERT` em `schema.sql` (gerado de `data/cardapio.json`). Se mudar o cardápio local, regenere com o build.
