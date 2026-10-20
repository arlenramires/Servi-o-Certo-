# Entrega — reagendamento bilateral com bloqueio de deslocamento

Validada em 20/10/2026 às 07h21 (Boa Vista).

## Funcionalidade

- Antes do deslocamento, cliente ou prestador pode propor uma nova data com motivo.
- A autoria é registrada em `proposed_by`; somente a outra parte pode aceitar ou recusar.
- Uma proposta pendente oculta o controle “Estou a caminho” e também bloqueia a operação no banco, evitando que a decisão fique sem efeito durante o deslocamento.
- O aceite atualiza a agenda de forma atômica. A recusa preserva a data anterior, e o histórico privado permanece imutável.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 72 testes Playwright aprovados em desktop e viewport Android.
- PostgreSQL efêmero: autoria das duas partes, decisão exclusiva da contraparte, atualização atômica da agenda, idempotência, imutabilidade, bloqueio do deslocamento com proposta pendente, escrita direta protegida e RLS contra terceiros.
- Interface com API controlada: proposta pelo cliente, proposta pelo prestador, decisão pela contraparte, agenda atualizada e bloqueio do botão de deslocamento enquanto há decisão pendente.

## Limites e preservação

Esta entrega não envia push, e-mail ou SMS e não cria ou comprova pagamento. Nenhuma cobrança, repasse, GPS, aprovação administrativa ou concessão de administrador foi realizada.

A migração `20261020112500_bilateral_service_rescheduling.sql` foi preparada e testada somente no PostgreSQL efêmero. Não foi aplicada ao Supabase conectado. A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
