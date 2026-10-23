# Entrega — busca pela região do próprio serviço

Validada em 22/10/2026 às 21:54 (America/Boa_Vista).

## Funcionalidade

- A busca de “Meus serviços” passa a localizar pedidos pela cidade ou pela UF exibidas no cartão.
- A pesquisa por cidade ignora diferenças entre maiúsculas, minúsculas e acentos; por exemplo, “sao paulo” encontra “São Paulo”.
- Código, profissão, descrição e região compartilham o mesmo campo e continuam combináveis com filtros e ordenação.
- A filtragem ocorre somente sobre serviços já retornados para a sessão pelas políticas de acesso; não realiza consulta adicional nem modifica pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 136 testes Playwright aprovados (149 no total).
- O novo cenário automatizado localiza serviços distintos por cidade sem acento e por UF, confirma o cartão correspondente e verifica que os pedidos originais não foram modificados.
- O cenário foi executado nos projetos desktop e viewport Android com API controlada.
- Os testes PostgreSQL foram executados no ambiente isolado; esta entrega não cria migração nem altera o banco conectado.

## Incidente de runtime

A primeira execução completa encontrou uma expectativa desatualizada no teste existente de busca por código após a ampliação do rótulo do campo: os 13 testes Node/PostgreSQL e 134 testes de interface passaram, enquanto 2 testes de interface falharam apenas pela redação antiga. A expectativa foi atualizada e o comando completo foi repetido, encerrando com os 149 testes aprovados.

## Preservações e limites

- A região só é pesquisada dentro da coleção já autorizada para a sessão pelo Supabase e pelo RLS existente.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
