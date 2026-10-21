# Entrega — ordenação por horário preferido

Validada em 21/10/2026 às 10h36 (Boa Vista).

## Funcionalidade

- `Meus serviços` agora oferece a ordenação `Horário preferido mais próximo`.
- Pedidos com horário indicado aparecem primeiro, em ordem cronológica crescente.
- Pedidos sem horário preferido permanecem visíveis ao final da lista.
- A ordenação pode ser combinada com os filtros existentes, inclusive `Com horário preferido`, sem modificar os registros.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 112 testes Playwright aprovados em desktop e viewport Android.
- Interface com API controlada: o teste confirmou a ordem entre duas preferências, a posição final do pedido sem horário e a combinação com o filtro de horário preferido.
- A suíte PostgreSQL isolada existente foi aprovada integralmente; esta entrega não precisou de nova migração.

## Limites e preservação

A data indicada continua sendo apenas uma preferência, não uma confirmação de agenda. Nenhum SQL foi aplicado ao Supabase conectado, nenhuma publicação foi feita e nenhuma operação financeira ocorreu.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
