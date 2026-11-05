# Entrega: bloqueio persistente quando o provedor de recuperação está desativado

Validada em 05/11/2026 às 15:13 (America/Boa_Vista).

## Funcionalidade entregue

Quando o Supabase retorna `email_provider_disabled` no pedido de recuperação de senha, a interface agora consome a falha, volta ao login e mantém o bloqueio durante toda a abertura da página. Selecionar novamente a recuperação apenas reapresenta a indisponibilidade; nenhuma segunda chamada de `resetPasswordForEmail` é enviada ao provedor desativado. O e-mail é preservado, a área privada permanece fechada e o contexto de serviço protegido não exibe seu código.

O catálogo oficial identifica `email_provider_disabled` como indisponibilidade do provedor de e-mail. A documentação de senhas confirma que o fluxo de recuperação depende de SMTP, e o changelog registra que a recuperação continua enviando mensagens mesmo quando a confirmação de cadastro está desligada:

- https://supabase.com/changelog.md
- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- O runtime isolado não possuía Chromium após a instalação limpa. O CDN primário do Playwright retornou arquivos vazios; o espelho oficial alternativo restaurou Chromium, shell headless e FFmpeg.
- Teste dirigido: 2/2 aprovados, em desktop e viewport Android. O cenário seleciona novamente a recuperação depois da recusa e comprova somente uma chamada ao Auth.
- `npm run test:all`: 449/449 aprovados — 13 testes Node/PostgreSQL e 436 testes Playwright.
- Nenhuma migração foi aplicada, nenhum banco de produção foi alterado, nenhum e-mail real foi enviado e não houve publicação, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta prova usa API controlada e não homologa SMTP nem entrega de e-mail no ambiente conectado. A validação ponta a ponta depende de contas confirmadas, provedor autorizado e ambiente hospedado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos/contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta de concluir e homologar todo o escopo em 04/12/2026 permanece em risco; ela não é tratada como garantia nem reduzida a MVP.
