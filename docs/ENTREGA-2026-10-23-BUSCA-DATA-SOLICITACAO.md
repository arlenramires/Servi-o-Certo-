# Entrega — busca pela data de solicitação do serviço

Validada em 23/10/2026 às 03:06 (America/Boa_Vista).

## Funcionalidade

- A busca de “Meus serviços” passa a localizar pedidos pela data de solicitação exibida em português, como `19/10/2026`.
- O mesmo pedido também pode ser localizado pela parte ISO da data, como `2026-10-19`.
- A busca continua combinável com filtros, ordenação, carregamento progressivo e exportação existentes.
- A informação reutiliza `created_at` já carregado e ignora datas inválidas sem interromper a lista.

## Evidências

- `npm ci --ignore-scripts`: aprovado.
- `npm run test:all`: 13 testes Node/PostgreSQL e 144 testes Playwright aprovados (157 no total).
- O novo cenário automatizado procura dois pedidos por formatos de data distintos, confirma o resultado correto e verifica a ausência de mutação.
- O cenário é executado em desktop e viewport Android com API controlada.
- Os testes PostgreSQL são executados no ambiente isolado; esta entrega não cria migração nem altera o banco conectado.

## Preservações e limites

- A busca opera somente sobre serviços já autorizados pelo Supabase e pelas políticas RLS existentes.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
