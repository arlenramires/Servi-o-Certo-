# Entrega — ajuste antes da confirmação de conclusão

Validada em 20/10/2026 às 03h52 (Boa Vista).

## Funcionalidade

- Depois que o prestador solicita a confirmação da conclusão, o cliente pode confirmar ou descrever um ajuste necessário.
- Um ajuste pendente bloqueia a confirmação da conclusão também no banco.
- O prestador visualiza o pedido e registra como o ajuste foi atendido.
- Depois da resposta, o cliente volta a receber a opção de confirmar a conclusão.
- Pedido e resposta são imutáveis, idempotentes, privados e limitados aos participantes do serviço.

## Evidências

- `npm ci --ignore-scripts`.
- `npm run test:all`: 12 testes Node/PostgreSQL e 60 testes Playwright aprovados em desktop e viewport Android.
- Banco isolado: validação de autoria e etapa, bloqueio da conclusão pendente por `SE016`, idempotência, imutabilidade, bloqueio de escrita direta e RLS contra terceiros.
- Interface controlada: cliente solicita o ajuste e perde temporariamente o botão de conclusão; prestador responde e devolve a decisão ao cliente.

## Limites e preservação

Esta entrega permite um ciclo de ajuste por serviço. A resposta do prestador não comprova que o ajuste foi executado; a confirmação continua sendo uma decisão manual do cliente. Nenhum pagamento, repasse ou decisão administrativa é criado.

A migração `20261020075500_completion_adjustment_review.sql` foi preparada e testada somente no PostgreSQL efêmero. Não foi aplicada ao Supabase conectado. A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
