# Entrega — ordenação dos próprios serviços por profissão

Validada em 23/10/2026 às 07:26 (America/Boa_Vista).

## Funcionalidade

- “Meus serviços” passa a oferecer a ordenação “Profissão (A–Z)”.
- A comparação segue a localidade brasileira, ignora diferenças de acentuação e mantém os pedidos mais recentes primeiro quando a profissão é a mesma.
- A ordenação continua combinável com a busca, os filtros, o carregamento progressivo e a exportação existentes.
- A operação reutiliza os serviços já carregados, sem consulta adicional e sem modificar pedidos.

## Evidências

- `npm ci --ignore-scripts`: aprovado.
- `npm run test:all`: 13 testes Node/PostgreSQL e 148 testes Playwright aprovados (161 no total).
- O novo cenário cobre profissões iniciadas por letra acentuada, duas solicitações da mesma profissão com datas diferentes, combinação com filtro de serviços ativos e combinação com busca.
- O cenário é executado em desktop e viewport Android com API controlada e confirma que os pedidos não são modificados.
- Os testes PostgreSQL são executados no ambiente isolado; esta entrega não cria migração nem altera o banco conectado.

## Incidentes de validação e correção

- A instalação limpa removeu o Chromium do cache local, impedindo inicialmente que o Playwright abrisse o navegador; os 13 testes Node/PostgreSQL já haviam passado.
- O Chromium, FFMPEG e o headless shell foram restaurados pelo espelho alternativo autorizado do Playwright após o arquivo vazio retornado pelo endereço primário.
- Depois da restauração, `npm run test:all` foi repetido integralmente e todos os 161 testes passaram.

## Preservações e limites

- A ordenação opera somente sobre serviços já autorizados pelo Supabase e pelas políticas RLS existentes.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
