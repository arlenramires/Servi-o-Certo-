# Entrega: referência única no link protegido

Data local: 26/10/2026 16:49:17 (America/Boa_Vista)

## Resultado funcional

O acesso agora exige exatamente uma ocorrência do parâmetro `servico`. Quando o endereço contém referências duplicadas, nenhuma delas é escolhida silenciosamente: todas são removidas do URL, o aviso contextual permanece oculto e o login normal continua disponível com a mesma mensagem neutra usada para links inválidos.

A neutralização acontece antes de autenticação, consulta de pedidos ou construção de retornos de cadastro e recuperação. Nenhum valor recebido é exibido na interface ou propagado para outro URL. Links válidos com uma única referência continuam inalterados.

## Evidências automatizadas

- Teste dirigido de interface verifica referência duplicada em desktop e Android: URL limpa, login visível, aviso protegido oculto, mensagem neutra, ausência de consultas e ausência dos dois valores na página.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- Teste dirigido `tests/ui/deep-link-focus.spec.js`: **18/18** cenários aprovados (desktop e Android).
- `npm run test:all`: **269/269** testes aprovados — 13 testes Node/PostgreSQL e 256 testes Playwright.
- Banco de produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/deep-link-focus.spec.js`
