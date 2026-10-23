# Entrega — ordenação dos próprios serviços por mensagens novas

Validada em 23/10/2026 às 09:44 (America/Boa_Vista).

## Funcionalidade

- “Meus serviços” passa a oferecer a ordenação “Mensagens novas primeiro”.
- Conversas com mais mensagens não lidas aparecem antes das demais.
- Quando duas conversas têm a mesma quantidade, o pedido mais recente aparece primeiro.
- A ordenação continua combinável com busca, filtros, carregamento progressivo e exportação, sem nova consulta e sem modificar mensagens ou pedidos.

## Evidências

- `npm ci --ignore-scripts`: aprovado.
- `npm run test:all`: 13 testes Node/PostgreSQL e 154 testes Playwright aprovados (167 no total).
- O cenário novo cobre conversas com zero, uma e duas mensagens novas, empate pela quantidade, desempate pela data, combinação com serviços ativos e combinação com busca.
- O cenário é executado em desktop e viewport Android com API controlada e confirma que os pedidos não são modificados.
- Os testes PostgreSQL são executados no ambiente isolado; esta entrega não cria migração nem altera o banco conectado.

## Preservações e limites

- A ordenação usa somente as contagens privadas já retornadas pela função protegida `unread_service_message_counts` para serviços autorizados.
- Abrir a conversa continua sendo a ação explícita que registra a leitura; ordenar não marca mensagens como lidas.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- A alteração local preexistente no arquivo público `index.html` foi preservada e excluída desta entrega.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
