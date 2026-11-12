# Entrega: correção da profissão na solicitação

Validada em 12/11/2026 às 04:54:41 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

Ao criar um pedido, o cliente agora recebe orientação no próprio campo quando ainda não selecionou uma profissão. O campo é marcado como inválido e recebe foco, enquanto descrição, cidade, UF e horário permanecem preenchidos e nenhum `insert` é enviado para `service_requests`.

Depois da seleção, a marca de erro é removida e as demais validações continuam independentes. Somente quando profissão, descrição, região e horário são válidos uma única solicitação é criada.

Referências oficiais atuais:

- https://supabase.com/docs/reference/javascript/insert
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova confirmou foco e `aria-invalid` na profissão ausente, preservação de descrição, região e horário, zero inserções durante as correções de profissão, descrição e horário passado e somente uma gravação depois de todos os dados estarem válidos.
- `npm run test:all`: 461/461 aprovados — 13 testes Node/PostgreSQL e 448 testes Playwright.
- O CI #255 confirmou o commit funcional e concluiu com sucesso às 04:59:08 (America/Boa_Vista): instalação sem scripts, 13 testes Node/PostgreSQL, instalação do Chromium, 448 testes Playwright e armazenamento das evidências passaram. Execução: https://github.com/arlenramires/Servi-o-Certo-/actions/runs/43187070010.
- Nenhuma migração foi criada ou aplicada, nenhum banco conectado ou de produção foi alterado e não houve publicação em produção, e-mail real, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta entrega comprova o comportamento da interface com uma API controlada. Ela não substitui a homologação hospedada com conta de cliente confirmada nem altera as políticas RLS do projeto conectado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta integral de 04/12/2026 continua em risco e não é tratada como garantia nem reduzida a MVP.
