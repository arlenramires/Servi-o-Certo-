# Entrega — filtro por horário preferido

Validada em 21/10/2026 às 08h45 (Boa Vista).

## Funcionalidade

- A área `Meus serviços` agora oferece a categoria `Com horário preferido` para cliente e prestador.
- A opção informa quantos pedidos próprios possuem uma data indicada.
- O filtro inclui pedidos ativos ou do histórico e pode ser combinado com a busca por profissão ou descrição.
- O texto diferencia a preferência informada pelo cliente de um agendamento confirmado.
- A filtragem não altera o horário nem qualquer outro dado do pedido.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 110 testes Playwright aprovados em desktop e viewport Android.
- Interface com API controlada: dois pedidos com horário preferido, em estados diferentes, foram isolados de outro sem horário; a busca por profissão reduziu o resultado ao pedido correspondente.
- O teste confirmou que os três identificadores persistidos permaneceram inalterados.
- A suíte PostgreSQL isolada existente foi aprovada integralmente; esta alteração não precisou de nova migração.

## Limites e preservação

Esta entrega não confirma agenda, não altera schema, função ou política e não exige migração. Nenhum SQL foi aplicado ao Supabase conectado, nenhuma publicação foi feita e nenhuma operação financeira ocorreu.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
