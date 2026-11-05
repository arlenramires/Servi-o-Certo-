# Entrega: contenção de validação recusada no pedido de recuperação

Validada em 05/11/2026 às 08:22 (America/Boa_Vista).

## Funcionalidade entregue

Quando o Supabase retorna `validation_failed` no pedido inicial de recuperação de senha, a interface agora consome a tentativa, retorna ao login com o e-mail preservado e orienta reabrir o fluxo para conferir os dados. Mesmo que o usuário selecione novamente a recuperação na mesma abertura, a chamada de `resetPasswordForEmail` não é repetida. Login e cadastro mantêm a correção manual existente, a área privada permanece fechada e o contexto de serviço protegido não exibe seu código.

O catálogo oficial do Supabase define `validation_failed` como parâmetros fora do formato esperado, e `resetPasswordForEmail` envia o pedido de recuperação ao endereço informado:

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
- https://supabase.com/docs/guides/auth/passwords

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- O CDN primário do Playwright retornou arquivos vazios; o espelho oficial alternativo restaurou Chromium, shell headless e FFmpeg no runtime isolado.
- Teste dirigido: 2/2 aprovados, em desktop e viewport Android. O cenário seleciona novamente a recuperação após a recusa e comprova que somente a primeira chamada chega ao Auth.
- `npm run test:all`: 447/447 aprovados — 13 testes Node/PostgreSQL e 434 testes Playwright.
- Nenhuma migração foi aplicada, nenhum banco de produção foi alterado, nenhum e-mail real foi enviado e não houve publicação, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta prova usa API controlada e não homologa validação real, SMTP nem entrega de e-mail no ambiente conectado. A validação ponta a ponta depende de contas confirmadas, configuração autorizada e ambiente hospedado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos/contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta de concluir e homologar todo o escopo em 04/12/2026 permanece em risco; ela não é tratada como garantia nem reduzida a MVP.
