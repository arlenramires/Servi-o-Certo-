# Entrega — filtro de pedidos aguardando profissional

Validada em 21/10/2026 às 12h37 (Boa Vista).

## Funcionalidade

- `Meus serviços` agora oferece o filtro `Aguardando profissional`.
- A opção mostra a quantidade de pedidos que continuam abertos, antes do aceite de um prestador.
- O filtro pode ser combinado com a busca por profissão ou descrição.
- Pedidos aceitos, em andamento ou históricos não aparecem nessa categoria e nenhum registro é modificado.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 114 testes Playwright aprovados em desktop e viewport Android.
- Interface com API controlada: o teste confirmou a contagem de dois pedidos abertos, excluiu um pedido já aceito, combinou o filtro com busca e verificou que a coleção original não foi alterada.
- A suíte PostgreSQL isolada existente foi aprovada integralmente; esta entrega não precisou de nova migração.
- Uma primeira execução paralela encontrou timeouts gerais de infraestrutura. O novo cenário passou isoladamente e a suíte completa passou ao repetir o navegador localmente com dois workers; a limitação temporária não foi incorporada ao projeto.

## Limites e preservação

O filtro atua somente sobre pedidos já autorizados para a conta. Nenhum SQL foi aplicado ao Supabase conectado, nenhuma publicação foi feita e nenhuma operação financeira ocorreu.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
