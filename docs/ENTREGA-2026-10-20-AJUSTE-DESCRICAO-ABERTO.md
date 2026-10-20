# Entrega — correção da descrição no pedido aberto

Validada em 20/10/2026 às 19h20 (Boa Vista).

## Funcionalidade

- O cliente pode corrigir a descrição de um pedido próprio enquanto ele permanece aberto e sem prestador.
- O texto atualizado é exibido imediatamente na lista do cliente, sem cancelar ou recriar o chamado.
- Depois do aceite, a descrição fica congelada para preservar o escopo que iniciou a negociação.

## Segurança e evidências

- A operação protegida verifica autenticação, propriedade, estado `aberto` e ausência de prestador sob bloqueio de linha.
- O banco remove espaços externos, exige de 10 a 3000 caracteres e bloqueia prestadores, terceiros e usuários anônimos.
- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 88 testes Playwright aprovados em desktop e viewport Android.
- PostgreSQL efêmero: alteração válida e normalização do texto; descrição curta, prestador, anônimo e mudança após o aceite são recusados.
- Interface com API controlada: o texto corrigido é enviado pela RPC e refletido no pedido sem interpretar HTML.

## Ocorrência resolvida

O cache local do Chromium estava ausente e impediu a primeira abertura dos testes de interface. O navegador foi reinstalado pelo espelho alternativo do Playwright e a suíte completa passou na repetição.

## Limites e preservação

A migração `20261020232500_client_open_request_description.sql` foi preparada e testada somente no PostgreSQL efêmero. Não foi aplicada ao Supabase conectado. Nenhuma publicação, aprovação administrativa ou operação financeira foi realizada.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
