# Entrega — ordenação dos próprios serviços

Validada em 21/10/2026 às 01h15 (Boa Vista).

## Funcionalidade

- A área `Meus serviços` agora pode ordenar pedidos por mais recentes, mais antigos ou urgentes primeiro.
- `Urgentes primeiro` mantém os pedidos mais recentes no topo dentro de cada nível de prioridade.
- A ordenação pode ser combinada com a busca por texto e os filtros `Todos`, `Ativos` e `Histórico`.
- A operação atua apenas sobre os pedidos já autorizados para a conta e não altera nenhum registro.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 100 testes Playwright aprovados em desktop e viewport Android.
- Interface com API controlada: ordem cronológica crescente/decrescente, prioridade urgente, combinação com filtro e preservação dos registros.
- Após a instalação limpa, a primeira abertura do Playwright encontrou o navegador ausente e foi interrompida. O Chromium foi reinstalado pelo espelho alternativo do instalador; a suíte completa seguinte passou.

## Limites e preservação

Esta entrega é somente de organização da interface e não exige migração. Nenhum SQL foi aplicado ao Supabase conectado, nenhuma publicação foi feita e nenhuma operação financeira ocorreu.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
