# Entrega — resumo quantitativo dos próprios serviços

Validada em 21/10/2026 às 02h04 (Boa Vista).

## Funcionalidade

- A área `Meus serviços` agora informa quantos pedidos pertencem à conta, quantos estão ativos e quantos fazem parte do histórico.
- As opções `Todos`, `Ativos` e `Histórico` exibem suas contagens atualizadas.
- O resumo distingue a quantidade atualmente exibida da quantidade total, refletindo busca e filtro combinados.
- As contagens usam somente os pedidos já autorizados para a conta e não alteram nenhum registro.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 102 testes Playwright aprovados em desktop e viewport Android.
- Interface com API controlada: quatro estados foram contados, filtrados e pesquisados, mantendo os registros e estados originais.

## Limites e preservação

Esta entrega é somente de organização da interface e não exige migração. Nenhum SQL foi aplicado ao Supabase conectado, nenhuma publicação foi feita e nenhuma operação financeira ocorreu.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
