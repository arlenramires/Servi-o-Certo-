# Entrega — filtro de serviços solicitados nos últimos sete dias

Validada em 23/10/2026 às 02:43 (America/Boa_Vista).

## Funcionalidade

- “Meus serviços” passa a oferecer o filtro “Solicitados nos últimos 7 dias”.
- O filtro considera o instante de criação já autorizado e carregado para a sessão.
- A opção informa quantos pedidos pertencem ao período e continua combinável com a busca existente.
- Registros legados sem data válida ficam fora do recorte, sem interromper a lista nem receber uma data inventada.

## Evidências

- `npm ci --ignore-scripts`: aprovado.
- `npm run test:all`: 13 testes Node/PostgreSQL e 142 testes Playwright aprovados (155 no total).
- O novo cenário automatizado cobre pedido dentro do período, pedido anterior ao período, registro sem data e combinação com busca.
- O cenário também confirma que os pedidos originais não são modificados e é executado em desktop e viewport Android com API controlada.
- Os testes PostgreSQL são executados no ambiente isolado; esta entrega não cria migração nem altera o banco conectado.

## Incidente de runtime

- O cache do Chromium não estava disponível no início da validação da interface.
- Após a instalação limpa, Chromium, FFMPEG e o headless shell foram restaurados pelo espelho alternativo autorizado do Playwright; o comando integral foi então executado com sucesso.

## Preservações e limites

- O filtro opera somente sobre serviços já autorizados pelo Supabase e pelas políticas RLS existentes.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
