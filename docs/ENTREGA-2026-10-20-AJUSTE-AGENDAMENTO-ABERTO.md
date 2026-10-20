# Entrega — ajuste do horário preferido no pedido aberto

Validada em 20/10/2026 às 18h27 (Boa Vista).

## Funcionalidade

- O cliente pode alterar ou remover o horário preferido de um pedido próprio enquanto ele permanece aberto e sem prestador.
- A nova preferência fica visível no pedido e no contexto mínimo apresentado aos prestadores elegíveis.
- Depois do aceite, o horário deixa de ser editável por este fluxo; mudanças posteriores continuam sujeitas ao reagendamento bilateral já existente.

## Segurança e evidências

- A operação protegida verifica autenticação, propriedade, estado `aberto` e ausência de prestador sob bloqueio de linha.
- Datas passadas, prestadores, terceiros e usuários anônimos são bloqueados.
- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 86 testes Playwright aprovados em desktop e viewport Android.
- PostgreSQL efêmero: cliente altera, remove e recompõe a preferência; data passada, prestador e anônimo são bloqueados; mudança após o aceite é recusada.
- Interface com API controlada: atualização e remoção enviam apenas o identificador do pedido e o novo horário, refletindo imediatamente o resultado.

## Limites e preservação

A migração `20261020222500_client_open_request_schedule.sql` foi preparada e testada somente no PostgreSQL efêmero. Não foi aplicada ao Supabase conectado. Nenhuma publicação, aprovação administrativa ou operação financeira foi realizada.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
