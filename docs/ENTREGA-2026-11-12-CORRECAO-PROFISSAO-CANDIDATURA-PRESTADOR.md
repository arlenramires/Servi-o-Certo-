# Entrega: correção da profissão na candidatura a prestador

Validada em 12/11/2026 às 07:30:16 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

Ao solicitar análise para atuar como prestador, o cliente agora recebe orientação no próprio campo quando ainda não selecionou uma profissão. O campo é marcado como inválido e recebe foco, a experiência digitada permanece preenchida e nenhum `insert` é enviado para `provider_applications`.

Depois da seleção, a marca de erro é removida e uma única candidatura é registrada como pendente. A interface continua no perfil de cliente e não exibe controles de prestador: esta entrega não aprova a candidatura, profissão ou documentos e não concede privilégios automaticamente.

Referências oficiais atuais:

- https://supabase.com/docs/reference/javascript/insert
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova confirmou foco e `aria-invalid` na profissão ausente, preservação da experiência, zero candidaturas durante a correção, somente uma candidatura pendente depois da seleção e permanência no perfil de cliente sem painel de prestador.
- `npm run test:all`: 463/463 aprovados — 13 testes Node/PostgreSQL e 450 testes Playwright.
- O Chromium não estava presente após a instalação limpa; Chromium, FFmpeg e o shell headless foram restaurados pelo espelho oficial da Microsoft, e os testes foram repetidos depois da correção do runtime.
- Nenhuma migração foi criada ou aplicada, nenhum banco conectado ou de produção foi alterado e não houve publicação em produção, e-mail real, cobrança, pagamento, aprovação de candidatura/profissão/documento ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta entrega comprova o comportamento da interface com uma API controlada. Ela não substitui a homologação hospedada com contas confirmadas, a revisão real pelo proprietário nem altera as políticas RLS do projeto conectado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta integral de 04/12/2026 continua em risco e não é tratada como garantia nem reduzida a MVP.
