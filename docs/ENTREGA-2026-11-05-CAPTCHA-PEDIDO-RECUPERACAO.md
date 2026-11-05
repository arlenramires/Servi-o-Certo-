# Entrega: contenção de CAPTCHA recusado no pedido de recuperação

Validada em 05/11/2026 às 07:23 (America/Boa_Vista).

## Funcionalidade entregue

Quando o Supabase retorna `captcha_failed` no pedido inicial de recuperação de senha, a interface agora consome essa tentativa e bloqueia novas chamadas de `resetPasswordForEmail` na mesma abertura. A mensagem preservada orienta o usuário a recarregar a página antes de tentar novamente. Login e cadastro continuam permitindo sua correção manual, a área privada permanece fechada e o contexto de serviço protegido não exibe seu código.

O Supabase oferece CAPTCHA nos formulários de login, cadastro e recuperação de senha, e define `captcha_failed` como falha de verificação do desafio pelo provedor:

- https://supabase.com/docs/guides/auth/auth-captcha
- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
- https://supabase.com/docs/guides/deployment/going-into-prod

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- O CDN primário do Playwright retornou arquivos vazios; o espelho oficial alternativo restaurou Chromium, shell headless e FFmpeg no runtime isolado.
- Teste dirigido: 2/2 aprovados, em desktop e viewport Android. O cenário repete o acionamento após `captcha_failed` e comprova que somente a primeira chamada chega ao Auth.
- `npm run test:all`: 445/445 aprovados — 13 testes Node/PostgreSQL e 432 testes Playwright.
- Nenhuma migração foi aplicada, nenhum banco de produção foi alterado, nenhum CAPTCHA ou e-mail real foi acionado e não houve publicação, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta prova usa API controlada e não homologa hCaptcha/Turnstile, SMTP nem entrega de e-mail no ambiente conectado. A validação ponta a ponta depende de CAPTCHA configurado, contas confirmadas, configuração autorizada e ambiente hospedado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos/contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta de concluir e homologar todo o escopo em 04/12/2026 permanece em risco; ela não é tratada como garantia nem reduzida a MVP.
