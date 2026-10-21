# Entrega — identificação correta do horário preferido

Validada em 21/10/2026 às 10h27 (Boa Vista).

## Funcionalidade

- Os cartões em `Meus serviços` agora exibem `Horário preferido` quando o pedido possui uma data indicada.
- O rótulo anterior `Agendado` foi removido porque a preferência do cliente, isoladamente, não confirma agenda com o prestador.
- Ao atualizar a preferência, o cartão mostra imediatamente o novo rótulo e a data.
- Ao remover a preferência, a indicação também desaparece do cartão.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 110 testes Playwright aprovados em desktop e viewport Android.
- Interface com API controlada: o teste atualizou o horário de um pedido aberto, confirmou `Horário preferido`, verificou a ausência de `Agendado` e depois removeu a data do cartão.
- A suíte PostgreSQL isolada existente foi aprovada integralmente; esta correção não precisou de nova migração.

## Limites e preservação

Esta entrega corrige somente a informação apresentada na interface; não confirma agenda, não altera schema, função ou política e não exige migração. Nenhum SQL foi aplicado ao Supabase conectado, nenhuma publicação foi feita e nenhuma operação financeira ocorreu.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
