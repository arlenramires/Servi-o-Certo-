# Entrega: contenção de carga inválida do hook no pedido de recuperação

Validada em 05/11/2026 às 04:06 (America/Boa_Vista).

## Funcionalidade entregue

Quando o pedido de recuperação retorna `hook_payload_over_size_limit` ou `hook_payload_invalid_content_type`, a interface agora consome a tentativa, volta ao login com o e-mail preservado e orienta o usuário a tentar novamente mais tarde. A mudança impede repetição imediata de `resetPasswordForEmail`, mantém a área privada fechada e conserva o contexto de serviço protegido sem exibir seu código.

O catálogo oficial do Supabase define esses códigos como carga do Auth Hook acima do limite ou sem um cabeçalho `Content-Type` válido. A referência de `resetPasswordForEmail` confirma que a chamada solicita o envio do e-mail de recuperação:

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- A primeira prova dirigida não iniciou porque a instalação limpa removeu o Chromium; não houve falha funcional. O CDN primário retornou arquivos vazios e o espelho oficial alternativo restaurou Chromium, shell headless e FFmpeg no runtime isolado.
- Teste dirigido após a restauração: 2/2 aprovados, em desktop e viewport Android, cobrindo os dois códigos e verificando uma única chamada de recuperação em cada cenário.
- `npm run test:all`: 443/443 aprovados — 13 testes Node/PostgreSQL e 430 testes Playwright.
- Nenhuma migração foi aplicada, nenhum banco de produção foi alterado, nenhum e-mail real foi enviado e não houve publicação, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta prova usa API controlada e não homologa um Send Email Hook real nem entrega de e-mail no ambiente conectado. A validação ponta a ponta depende de contas confirmadas, SMTP ou hook autorizado e ambiente hospedado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos/contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta de concluir e homologar todo o escopo em 04/12/2026 permanece em risco; ela não é tratada como garantia nem reduzida a MVP.
