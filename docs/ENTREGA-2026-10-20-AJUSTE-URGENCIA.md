# Entrega — ajuste de urgência do pedido aberto

Validada em 20/10/2026 às 17h14 (Boa Vista).

## Funcionalidade

- O cliente pode marcar ou remover a urgência de um pedido próprio enquanto ele permanece aberto e sem prestador.
- A alteração é refletida imediatamente na lista do cliente e na prioridade apresentada aos prestadores elegíveis.
- Depois do aceite, a urgência fica congelada para preservar o contexto que o prestador recebeu.

## Segurança e evidências

- A operação protegida verifica autenticação, propriedade, estado `aberto` e ausência de prestador sob bloqueio de linha.
- Prestadores, terceiros e usuários anônimos não podem alterar a prioridade.
- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 84 testes Playwright aprovados em desktop e viewport Android.
- PostgreSQL efêmero: cliente altera e restaura a urgência; prestador e anônimo são bloqueados; mudança após o aceite é recusada.
- Interface com API controlada: marcação e remoção atualizam o pedido e enviam somente o identificador e o valor booleano.
- O Chromium ausente foi reinstalado pelo espelho alternativo do Playwright antes da repetição integral da suíte.

## Limites e preservação

A migração `20261020211500_client_request_urgency_update.sql` foi preparada e testada somente no PostgreSQL efêmero. Não foi aplicada ao Supabase conectado. Nenhuma publicação, aprovação administrativa ou operação financeira foi realizada.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
