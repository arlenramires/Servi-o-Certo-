# Entrega: contenção dos limites no pedido de recuperação

Validada em 05/11/2026 às 06:10 (America/Boa_Vista).

## Funcionalidade entregue

Quando o pedido de recuperação retorna `over_request_rate_limit` ou `over_email_send_rate_limit`, a interface agora bloqueia novas chamadas de `resetPasswordForEmail` na mesma abertura e preserva a orientação correspondente. O usuário pode continuar corrigindo erros de validação, mas precisa reabrir o fluxo depois do intervalo para solicitar outro e-mail. A área privada permanece fechada e o contexto de serviço protegido não exibe seu código.

O Supabase aplica limites contra abuso nos endpoints de autenticação. A documentação atual informa uma janela padrão de 60 segundos entre pedidos de recuperação para o mesmo usuário, além de limites por IP e por envio de e-mail:

- https://supabase.com/docs/guides/auth/rate-limits
- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- O CDN primário do Playwright retornou arquivos vazios; o espelho oficial alternativo restaurou Chromium, shell headless e FFmpeg no runtime isolado.
- Testes dirigidos: 4/4 aprovados, em desktop e viewport Android, cobrindo limite geral e limite de envio e comprovando que o segundo acionamento não chama o Auth.
- `npm run test:all`: 445/445 aprovados — 13 testes Node/PostgreSQL e 432 testes Playwright.
- Nenhuma migração foi aplicada, nenhum banco de produção foi alterado, nenhum e-mail real foi enviado e não houve publicação, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta prova usa API controlada e não homologa limites reais, SMTP, Send Email Hook nem entrega de e-mail no ambiente conectado. A validação ponta a ponta depende de contas confirmadas, configuração autorizada e ambiente hospedado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos/contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta de concluir e homologar todo o escopo em 04/12/2026 permanece em risco; ela não é tratada como garantia nem reduzida a MVP.
