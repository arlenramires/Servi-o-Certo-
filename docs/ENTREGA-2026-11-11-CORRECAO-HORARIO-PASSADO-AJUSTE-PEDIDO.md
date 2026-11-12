# Entrega: correção de horário passado ao ajustar o pedido

Validada em 11/11/2026 às 22:46:22 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

Ao editar o horário preferido de um pedido próprio ainda aberto e sem prestador, o cliente agora recebe orientação no próprio campo quando escolhe uma data que já passou. O campo é marcado como inválido e recebe foco, o pedido permanece preenchido e nenhuma chamada é enviada à função protegida `set_open_request_schedule`.

Depois de informar um horário futuro, a marca de erro é removida e uma única chamada atualiza a preferência. O cliente continua podendo remover o horário posteriormente sem transformar a preferência em agendamento confirmado.

Referências oficiais atuais:

- https://supabase.com/docs/reference/javascript/rpc
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova confirmou foco e `aria-invalid` no horário passado, preservação do pedido, zero chamadas RPC antes da correção, uma atualização com horário futuro e a remoção posterior da preferência.
- `npm run test:all`: 461/461 aprovados — 13 testes Node/PostgreSQL e 448 testes Playwright.
- Nenhuma migração foi criada ou aplicada, nenhum banco conectado ou de produção foi alterado e não houve publicação em produção, e-mail real, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta entrega comprova o comportamento da interface com uma API controlada. Ela não substitui a homologação hospedada com conta de cliente confirmada nem altera as políticas RLS do projeto conectado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta integral de 04/12/2026 continua em risco e não é tratada como garantia nem reduzida a MVP.
