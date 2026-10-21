# Entrega — busca nos próprios serviços

Validada em 21/10/2026 às 00h41 (Boa Vista).

## Funcionalidade

- A área `Meus serviços` agora permite localizar pedidos por profissão ou trecho da descrição.
- A busca ignora diferenças entre maiúsculas, minúsculas e acentos.
- O termo pode ser combinado com os filtros `Todos`, `Ativos` e `Histórico`.
- A ação `Limpar busca` restaura a lista correspondente ao filtro atual.
- A busca atua apenas sobre os pedidos já autorizados para a conta e não altera nenhum registro.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 98 testes Playwright aprovados em desktop e viewport Android.
- Interface com API controlada: busca por profissão, busca sem acento na descrição, combinação com histórico/ativos, estado vazio e limpeza do termo.
- A primeira execução encontrou uma expectativa incorreta: ao limpar a busca, o filtro `Ativos` permanece selecionado. A asserção foi corrigida para verificar esse comportamento, e a suíte completa seguinte passou.

## Limites e preservação

Esta entrega é somente de organização da interface e não exige migração. Nenhum SQL foi aplicado ao Supabase conectado, nenhuma publicação foi feita e nenhuma operação financeira ocorreu.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
