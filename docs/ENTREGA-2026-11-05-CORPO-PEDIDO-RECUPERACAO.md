# Entrega: recuperação após corpo recusado no pedido de recuperação

Validada em 05/11/2026 às 05:30 (America/Boa_Vista).

## Funcionalidade entregue

Quando o pedido de recuperação retorna `bad_json`, a interface agora consome a tentativa, volta ao login com o e-mail preservado e orienta o usuário a reabrir o fluxo antes de tentar novamente. A mudança impede repetição imediata do mesmo corpo fixo em `resetPasswordForEmail`, mantém a área privada fechada e conserva o contexto de serviço protegido sem exibir seu código.

O catálogo oficial do Supabase define `bad_json` como um corpo HTTP que não é JSON válido. A referência de `resetPasswordForEmail` confirma que a chamada solicita o envio do e-mail de recuperação:

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- O CDN primário do Playwright retornou arquivos vazios; o espelho oficial alternativo restaurou Chromium, shell headless e FFmpeg no runtime isolado.
- Teste dirigido: 2/2 aprovados, em desktop e viewport Android, verificando uma única chamada de recuperação.
- `npm run test:all`: 445/445 aprovados — 13 testes Node/PostgreSQL e 432 testes Playwright.
- Nenhuma migração foi aplicada, nenhum banco de produção foi alterado, nenhum e-mail real foi enviado e não houve publicação, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta prova usa API controlada e não homologa a recusa real do Auth nem entrega de e-mail no ambiente conectado. A validação ponta a ponta depende de contas confirmadas, SMTP ou Send Email Hook autorizado e ambiente hospedado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos/contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta de concluir e homologar todo o escopo em 04/12/2026 permanece em risco; ela não é tratada como garantia nem reduzida a MVP.
