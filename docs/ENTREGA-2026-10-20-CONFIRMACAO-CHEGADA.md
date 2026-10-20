# Entrega — confirmação da chegada pelo cliente

Validada em 20/10/2026 às 03h25 (Boa Vista).

## Funcionalidade

- Depois que o prestador informa **Cheguei ao local**, o cliente recebe a ação **Confirmar chegada do prestador**.
- O cliente é orientado a confirmar somente quando o prestador estiver no local.
- O prestador vê que aguarda a confirmação e não recebe o botão **Iniciar serviço** antes dela.
- A regra também é aplicada no banco: somente o cliente do serviço pode confirmar, a confirmação exige a chegada anterior e a repetição é idempotente.
- O histórico registra a confirmação separadamente e continua privado para os participantes.

## Evidências

- `npm ci --ignore-scripts`.
- `npm run test:all`: 12 testes Node/PostgreSQL e 56 testes Playwright aprovados em desktop e viewport Android.
- Banco isolado: confirmação prematura bloqueada por `SE013`, confirmação pelo próprio prestador bloqueada, início sem confirmação bloqueado por `SE014`, idempotência e RLS contra terceiros validadas.
- Interface controlada: cliente confirma a chegada sem receber controles do prestador; prestador só inicia após a confirmação.

O primeiro cache novo do Chromium ficou incompleto durante o download. A suíte foi repetida com o headless shell isolado e íntegro já validado no ambiente, e passou integralmente.

## Limites e preservação

A confirmação é manual e não comprova geolocalização, identidade presencial, pagamento ou conclusão do serviço. Não houve mutação no Supabase conectado.

A migração `20261020072000_client_arrival_confirmation.sql` foi preparada e testada somente no PostgreSQL efêmero. A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
