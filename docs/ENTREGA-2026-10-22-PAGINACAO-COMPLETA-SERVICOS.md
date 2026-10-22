# Entrega — paginação completa dos próprios serviços

Validada em 22/10/2026 às 17:54 (America/Boa_Vista).

## Funcionalidade

- A consulta de “Meus serviços” deixou de descartar registros após os cem mais recentes.
- Os serviços autorizados para a conta são buscados em lotes de cem com `range`, conforme a API JavaScript do Supabase.
- A ordenação da paginação combina `created_at` e `id`, ambos decrescentes, para manter uma sequência determinística mesmo quando dois pedidos têm o mesmo horário.
- O carregamento encerra quando a API devolve um lote incompleto e é abandonado se a conta ou a geração da tela mudar durante as requisições.
- Contagens, busca, filtros, ordenação local, carregamento progressivo e exportação CSV passam a considerar todas as páginas autorizadas.
- A alteração é somente de leitura e continua sujeita às políticas RLS existentes; não amplia colunas, usuários ou registros disponíveis.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 130 testes Playwright aprovados.
- O novo cenário automatizado cria 205 serviços autorizados e comprova três consultas nas faixas inclusivas `0–99`, `100–199` e `200–299`.
- O cenário confirma o resumo de 205 serviços, a apresentação inicial dos dez primeiros e a indicação dos 195 resultados restantes.
- Os testes de interface foram executados em desktop e viewport Android com API controlada.
- Os testes PostgreSQL passaram no ambiente isolado; esta entrega não cria migração nem altera o banco conectado.

## Incidente de runtime resolvido

- A instalação limpa removeu o Chromium local. A primeira execução aprovou os 13 testes Node/PostgreSQL, mas os testes de interface não iniciaram por ausência do navegador.
- O Chromium foi reinstalado somente no ambiente isolado e `npm run test:all` foi repetido integralmente, com os 143 testes aprovados.

## Preservações e limites

- Contas com histórico extenso geram uma requisição adicional por lote de cem; a interface continua mostrando resultados progressivamente para evitar uma lista visual excessiva.
- O acesso continua limitado ao que a API e o RLS autorizam para a sessão; nenhum dado administrativo ou de outra conta é solicitado.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
