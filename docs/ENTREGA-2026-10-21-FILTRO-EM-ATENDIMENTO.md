# Entrega — filtro de serviços em atendimento

Validada em 21/10/2026 às 13h01 (Boa Vista).

## Funcionalidade

- `Meus serviços` agora oferece o filtro `Em atendimento`.
- A opção mostra a quantidade de serviços aceitos por um profissional ou já em andamento.
- O filtro pode ser combinado com a busca por profissão ou descrição.
- Pedidos ainda abertos, concluídos ou cancelados não aparecem nessa categoria e nenhum registro é modificado.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 116 testes Playwright aprovados em desktop e viewport Android.
- Interface com API controlada: o teste confirmou a contagem de um serviço aceito e um em andamento, excluiu um pedido ainda aberto, combinou o filtro com busca e verificou que a coleção original não foi alterada.
- A suíte PostgreSQL isolada existente foi aprovada integralmente; esta entrega não precisou de nova migração.
- Uma primeira execução com dois workers teve um timeout isolado em um cenário antigo de avaliação, que passou no viewport Android. A suíte completa passou ao ser repetida com um worker; a limitação temporária não foi incorporada ao projeto.

## Limites e preservação

O filtro atua somente sobre pedidos já autorizados para a conta. Nenhum SQL foi aplicado ao Supabase conectado, nenhuma publicação foi feita e nenhuma operação financeira ocorreu.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
