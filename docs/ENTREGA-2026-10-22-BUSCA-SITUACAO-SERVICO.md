# Entrega — busca pela situação do próprio serviço

Validada em 22/10/2026 às 23:12 (America/Boa_Vista).

## Funcionalidade

- A busca de “Meus serviços” passa a localizar pedidos pela situação exata, incluindo “aceito”, “em andamento” e “concluído”.
- Termos técnicos internos com sublinhado são convertidos em palavras e os rótulos apresentados no cartão também participam da pesquisa.
- A pesquisa ignora diferenças entre maiúsculas, minúsculas e acentos e permanece combinável com filtros e ordenação.
- A filtragem ocorre somente sobre serviços já retornados para a sessão pelas políticas de acesso; não realiza consulta adicional nem modifica pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 138 testes Playwright aprovados (151 no total).
- O novo cenário automatizado pesquisa separadamente serviços aceitos, em andamento e concluídos e confirma que os pedidos originais não foram modificados.
- O cenário foi executado nos projetos desktop e viewport Android com API controlada.
- Os testes PostgreSQL foram executados no ambiente isolado; esta entrega não cria migração nem altera o banco conectado.

## Incidente de runtime

- A instalação limpa removeu o Chromium local. A primeira execução aprovou os 13 testes Node/PostgreSQL, mas os testes de interface não iniciaram por ausência do navegador.
- O primeiro endereço de download retornou arquivos inválidos de tamanho zero; o instalador usou automaticamente o endereço alternativo autorizado, restaurou o Chromium no ambiente isolado e `npm run test:all` foi repetido integralmente com os 151 testes aprovados.

## Preservações e limites

- A situação não concede acesso: a busca considera somente a coleção já autorizada para a sessão pelo Supabase e pelo RLS existente.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
