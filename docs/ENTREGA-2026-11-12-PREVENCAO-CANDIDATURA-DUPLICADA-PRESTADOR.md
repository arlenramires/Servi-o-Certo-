# Entrega: prevenção de candidatura duplicada a prestador

Validada em 12/11/2026 às 08:34:46 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

Ao tentar enviar outra candidatura para uma profissão já solicitada, o cliente agora recebe orientação no próprio campo antes de uma nova chamada ao Supabase. A profissão é marcada como inválida e recebe foco, a nova experiência digitada permanece preenchida e nenhum segundo `insert` é enviado para `provider_applications`.

A interface usa as candidaturas do próprio usuário já carregadas sob RLS e mantém a solicitação original e seu estado visíveis. O cliente pode escolher outra profissão, mas não altera, aprova ou substitui a candidatura existente e não recebe acesso de prestador automaticamente.

Referências oficiais atuais:

- https://supabase.com/docs/reference/javascript/insert
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova confirmou uma única candidatura pendente, bloqueio da repetição antes de outro `insert`, foco e `aria-invalid` na profissão duplicada, preservação da nova experiência e ausência do painel de prestador.
- `npm run test:all`: 463/463 aprovados — 13 testes Node/PostgreSQL e 450 testes Playwright.
- Chromium, FFmpeg e o shell headless foram restaurados pelo espelho oficial da Microsoft no ambiente isolado antes da execução dos testes.
- Nenhuma migração foi criada ou aplicada. A restrição única existente em `(user_id, profession)` continua sendo a garantia final no banco; nenhum banco conectado ou de produção foi alterado.
- Não houve publicação em produção, e-mail real, cobrança, pagamento, aprovação de candidatura/profissão/documento ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta entrega comprova o comportamento da interface com uma API controlada e mantém a restrição única do banco como defesa final. Ela não substitui a homologação hospedada com contas confirmadas, a revisão real pelo proprietário nem altera as políticas RLS do projeto conectado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta integral de 04/12/2026 continua em risco e não é tratada como garantia nem reduzida a MVP.
