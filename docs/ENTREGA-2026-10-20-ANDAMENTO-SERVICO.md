# Entrega — atualizações de andamento do serviço

Validada em 20/10/2026 às 04h57 (Boa Vista).

## Funcionalidade

- Durante a execução e antes de solicitar a conclusão, o prestador registra marcos de 25%, 50%, 75% ou 90% com um resumo.
- Cliente e prestador visualizam o histórico cronológico dentro do serviço.
- O banco aceita somente percentuais crescentes e mantém cada registro imutável e idempotente.
- Escrita é exclusiva do prestador atribuído; a leitura é protegida por RLS e limitada aos participantes.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 12 testes Node/PostgreSQL e 64 testes Playwright aprovados em desktop e viewport Android.
- Banco isolado: validação de etapa, autoria, percentual e texto; idempotência; bloqueio de regressão, alteração, escrita direta e acesso de terceiros.
- Interface controlada: prestador registra dois marcos crescentes e o cliente acompanha o histórico sem receber controles de escrita.

## Limites e preservação

O andamento é uma informação manual do prestador, não uma medição automática nem prova de execução, conclusão ou pagamento. Nenhuma cobrança, repasse, GPS ou decisão administrativa foi criada.

A migração `20261020090000_service_progress_updates.sql` foi preparada e testada somente no PostgreSQL efêmero. Não foi aplicada ao Supabase conectado. A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
