# Entrega — filtros de serviços ativos e histórico

Validada em 20/10/2026 às 22h55 (Boa Vista).

## Funcionalidade

- A área `Meus serviços` agora permite exibir todos os pedidos, somente os ativos ou somente o histórico.
- `Ativos` reúne pedidos abertos, aceitos e em andamento.
- `Histórico` reúne pedidos concluídos e cancelados.
- A troca de filtro não altera, cancela ou exclui nenhum pedido; apenas organiza a lista já autorizada para a conta.
- Quando uma categoria está vazia, a interface informa isso sem confundir com ausência total de serviços.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 96 testes Playwright aprovados em desktop e viewport Android.
- Interface com API controlada: quatro estados de pedido foram alternados entre `Todos`, `Ativos` e `Histórico`, mantendo integralmente os registros e seus estados.

## Limites e preservação

Esta entrega é somente de organização da interface e não exige migração. Nenhum SQL foi aplicado ao Supabase conectado, nenhuma publicação foi feita e nenhuma operação financeira ocorreu.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
