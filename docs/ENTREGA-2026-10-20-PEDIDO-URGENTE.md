# Entrega — pedido urgente pelo cliente

Validada em 20/10/2026 às 16h11 (Boa Vista).

## Funcionalidade

- O cliente pode marcar uma nova solicitação como atendimento urgente.
- A prioridade é persistida no pedido e fica confirmada na lista do cliente.
- Prestadores elegíveis recebem a indicação de urgência pelo contexto seguro já existente.
- O banco já ordena oportunidades urgentes antes das demais, sem alterar os critérios de profissão, verificação, disponibilidade, cidade e UF.
- Após o envio, os campos de agendamento e urgência são limpos para evitar reaproveitamento acidental em outro pedido.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 82 testes Playwright aprovados em desktop e viewport Android.
- Interface com API controlada: envio de `is_urgent: true`, confirmação visual no pedido e limpeza do controle após a criação.
- A permissão de inserção restrita existente já inclui somente as colunas permitidas do pedido, entre elas `is_urgent`; status, prestador e data de criação continuam fora do controle do cliente.
- O Chromium ausente foi reinstalado pelo espelho alternativo do Playwright e a suíte completa foi repetida com sucesso.

## Limites e preservação

Não houve nova migração nem alteração no Supabase conectado. Nenhuma publicação, aprovação administrativa ou operação financeira foi realizada.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
