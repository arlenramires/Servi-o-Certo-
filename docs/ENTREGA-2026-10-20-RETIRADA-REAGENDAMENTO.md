# Entrega — retirada de proposta de reagendamento

Validada em 20/10/2026 às 08h41 (Boa Vista).

## Funcionalidade

- Cliente ou prestador pode retirar apenas a própria proposta de reagendamento enquanto ela estiver pendente.
- A retirada mantém o registro no histórico com autor e horário, sem apagar dados nem modificar a agenda vigente.
- A contraparte e terceiros não podem retirar a proposta.
- A operação é idempotente; uma proposta já aceita ou recusada continua imutável.
- Depois da retirada, o bloqueio do deslocamento é removido e uma nova proposta pode ser criada.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 74 testes Playwright aprovados em desktop e viewport Android.
- PostgreSQL efêmero: retirada pelo autor, bloqueio da contraparte e de terceiros, idempotência, auditoria, preservação da agenda, imutabilidade após decisão e liberação da pendência.
- Interface com API controlada: botão disponível somente ao autor, histórico marcado como retirado e controle “Estou a caminho” novamente disponível.

## Ocorrência resolvida

A manutenção do ambiente removeu o cache local do Chromium. A primeira execução da interface não iniciou os navegadores; o Chromium foi reinstalado pelo espelho alternativo do Playwright e a suíte completa passou em seguida.

## Limites e preservação

Esta entrega não envia notificações externas e não cria ou comprova pagamento. Nenhuma cobrança, repasse, GPS, aprovação administrativa ou concessão de administrador foi realizada.

A migração `20261020124000_pending_reschedule_withdrawal.sql` foi preparada e testada somente no PostgreSQL efêmero. Não foi aplicada ao Supabase conectado. A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
