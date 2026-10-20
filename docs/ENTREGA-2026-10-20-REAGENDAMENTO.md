# Entrega — reagendamento antes do deslocamento

Validada em 20/10/2026 às 06h13 (Boa Vista).

## Funcionalidade

- Antes de iniciar o deslocamento, o prestador pode propor uma nova data e informar o motivo.
- O cliente visualiza a proposta e aceita ou recusa explicitamente.
- Somente o aceite atualiza a data agendada do pedido; a recusa preserva o horário anterior.
- Propostas e decisões formam um histórico privado e imutável. Depois de uma decisão, o prestador pode enviar outra proposta se ainda não estiver a caminho.
- O banco bloqueia proposta ou decisão depois do início do deslocamento.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 68 testes Playwright aprovados em desktop e viewport Android.
- Banco isolado: autoria, etapa, data futura, idempotência, imutabilidade, aceite com atualização atômica da agenda, bloqueio de escrita direta e RLS contra terceiros.
- Interface controlada: prestador propõe a nova data; cliente aceita e a agenda do pedido é atualizada sem receber controles do prestador.

## Limites e preservação

Esta entrega registra a decisão de agenda, mas não envia push, e-mail ou SMS e não confirma pagamento. Nenhuma cobrança, repasse, GPS ou decisão administrativa foi criada.

A migração `20261020102000_service_rescheduling.sql` foi preparada e testada somente no PostgreSQL efêmero. Não foi aplicada ao Supabase conectado. A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
