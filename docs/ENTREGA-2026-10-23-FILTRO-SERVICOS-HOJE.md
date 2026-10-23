# Entrega — filtro de serviços solicitados hoje

Validada em 23/10/2026 às 03:53 (America/Boa_Vista).

## Funcionalidade

- “Meus serviços” passa a oferecer o filtro “Solicitados hoje”, com a quantidade correspondente.
- O recorte usa o início do dia no horário local do navegador e rejeita instantes futuros.
- O filtro continua combinável com a busca, ordenação, carregamento progressivo e exportação existentes.
- Registros antigos sem data válida permanecem fora do recorte sem interromper a lista.

## Evidências

- `npm ci --ignore-scripts`: aprovado.
- `npm run test:all`: 13 testes Node/PostgreSQL e 146 testes Playwright aprovados (159 no total).
- O novo cenário cobre um pedido de hoje, um pedido de ontem, um registro sem data e a combinação do filtro com termos que produzem ou eliminam resultados.
- O cenário é executado em desktop e viewport Android com API controlada e confirma que os pedidos não são modificados.
- Os testes PostgreSQL são executados no ambiente isolado; esta entrega não cria migração nem altera o banco conectado.

## Incidentes de validação e correção

- A instalação limpa removeu o Chromium do cache local. O navegador, FFMPEG e o headless shell foram restaurados pelo espelho alternativo autorizado do Playwright.
- A primeira execução integral revelou que o dado simulado fixava 10h30, ainda no futuro no horário da rodada. O cenário foi corrigido para calcular um instante garantidamente entre o início do dia local e o momento atual.
- Após a correção, `npm run test:all` foi repetido integralmente e todos os 159 testes passaram.

## Preservações e limites

- O filtro opera somente sobre serviços já autorizados pelo Supabase e pelas políticas RLS existentes.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
