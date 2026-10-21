# Entrega — filtro de serviços urgentes

Validada em 21/10/2026 às 07h50 (Boa Vista).

## Funcionalidade

- A área `Meus serviços` agora oferece a categoria `Urgentes` para cliente e prestador.
- A opção informa quantos pedidos próprios estão marcados como urgentes.
- O filtro inclui pedidos urgentes ativos ou do histórico e pode ser combinado com a busca por profissão ou descrição.
- A filtragem não altera o pedido nem a prioridade registrada.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 108 testes Playwright aprovados em desktop e viewport Android.
- Interface com API controlada: dois pedidos urgentes, em estados diferentes, foram isolados de um pedido comum; a busca por profissão reduziu o resultado ao urgente correspondente.
- O teste confirmou que os três identificadores persistidos permaneceram inalterados.
- A suíte PostgreSQL isolada existente foi aprovada integralmente; esta alteração não precisou de nova migração.

## Limites e preservação

Esta entrega não altera schema, função ou política e não exige migração. Nenhum SQL foi aplicado ao Supabase conectado, nenhuma publicação foi feita e nenhuma operação financeira ocorreu.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
