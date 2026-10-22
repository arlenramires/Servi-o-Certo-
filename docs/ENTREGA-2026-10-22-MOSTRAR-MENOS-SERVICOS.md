# Entrega — recolhimento da lista expandida de serviços

Validada em 22/10/2026 às 14:51 (America/Boa_Vista).

## Funcionalidade

- Depois de usar `Mostrar mais`, a lista “Meus serviços” passa a oferecer a ação `Mostrar menos`.
- A ação retorna a exibição aos dez primeiros resultados correspondentes.
- Busca, situação e ordenação atuais permanecem selecionadas.
- A ação desaparece quando a lista já está no recorte inicial ou contém até dez resultados.
- O recolhimento é somente de apresentação: não exclui, reordena no banco nem modifica pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 124 testes Playwright aprovados.
- O novo cenário automatizado cria quinze pedidos, expande a lista, volta aos dez primeiros, confirma a restauração de `Mostrar mais` e verifica que filtros, ordenação e coleção original não mudaram.
- Os testes de interface foram executados em desktop e viewport Android com API controlada.
- Os testes PostgreSQL passaram no ambiente isolado; esta entrega não cria migração nem altera banco conectado.

## Preservações e limites

- A consulta continua limitada aos cem serviços mais recentes já autorizados pela API; paginação completa no servidor permanece uma evolução futura.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
