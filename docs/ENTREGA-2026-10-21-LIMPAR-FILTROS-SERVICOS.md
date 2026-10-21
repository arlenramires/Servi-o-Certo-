# Entrega — limpeza conjunta dos filtros dos próprios serviços

Validada em 21/10/2026 às 06h48 (Boa Vista).

## Funcionalidade

- A área `Meus serviços` agora oferece a ação `Limpar filtros` para cliente e prestador.
- Um único acionamento limpa o termo de busca, restaura a situação para `Todos` e a ordenação para `Mais recentes`.
- A lista é atualizada imediatamente com os critérios padrão, sem excluir, editar ou reordenar os registros persistidos.
- A ação `Limpar busca` continua disponível para quem deseja remover somente o termo e manter os demais critérios.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 106 testes Playwright aprovados em desktop e viewport Android.
- Interface com API controlada: o cenário combinou busca por `pintura`, histórico e ordem mais antiga; a nova ação restaurou os três controles, exibiu os três serviços em ordem recente e confirmou que seus identificadores persistidos não mudaram.
- A suíte PostgreSQL isolada existente foi aprovada integralmente; esta alteração não precisou de nova migração.

## Limites e preservação

Esta entrega não altera schema, função ou política e não exige migração. Nenhum SQL foi aplicado ao Supabase conectado, nenhuma publicação foi feita e nenhuma operação financeira ocorreu.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
