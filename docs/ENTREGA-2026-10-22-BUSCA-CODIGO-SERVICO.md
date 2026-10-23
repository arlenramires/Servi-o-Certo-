# Entrega — busca pelo código do próprio serviço

Validada em 22/10/2026 às 21:29 (America/Boa_Vista).

## Funcionalidade

- A busca de “Meus serviços” passa a localizar um pedido pelo identificador completo ou por parte do código exibido no cartão.
- Código, profissão e descrição compartilham a mesma busca normalizada, sem diferenciar maiúsculas de minúsculas.
- A busca por código continua combinável com os filtros de situação e com a ordenação existente.
- A filtragem ocorre somente sobre serviços já retornados para a sessão pelas políticas de acesso; não realiza consulta adicional nem modifica pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 134 testes Playwright aprovados.
- O novo cenário automatizado busca parte de um código em letras maiúsculas, confirma que apenas o serviço correspondente permanece visível e verifica que os pedidos originais não foram modificados.
- O cenário foi executado nos projetos desktop e viewport Android com API controlada.
- Os testes PostgreSQL foram executados no ambiente isolado; esta entrega não cria migração nem altera o banco conectado.

## Incidente de runtime

- A instalação limpa removeu o Chromium local. A primeira execução aprovou os 13 testes Node/PostgreSQL, mas os testes de interface não iniciaram por ausência do navegador.
- O Chromium foi reinstalado somente no ambiente isolado e `npm run test:all` foi repetido integralmente, com os 147 testes aprovados.

## Preservações e limites

- O código não concede acesso: a busca só considera a coleção já autorizada para a sessão pelo Supabase e pelo RLS existente.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
