# Entrega: contenção de conflito no pedido de recuperação

Validada em 05/11/2026 às 02:58 (America/Boa_Vista).

## Funcionalidade entregue

Quando o pedido de recuperação de senha retorna `conflict`, a interface agora consome a tentativa, volta ao login com o e-mail preservado e orienta o usuário a aguardar antes de tentar novamente. A mudança impede repetição imediata de `resetPasswordForEmail`, mantém a área privada fechada e conserva o contexto de serviço protegido sem exibir seu código.

O catálogo oficial do Supabase define `conflict` como conflito de banco, possivelmente causado por solicitações concorrentes, e recomenda revisar a simultaneidade da aplicação e aplicar espera progressiva. A referência de `resetPasswordForEmail` confirma que a chamada solicita o envio do e-mail de recuperação:

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- Chromium, shell headless e FFmpeg foram restaurados no runtime isolado; o CDN primário retornou arquivos vazios e o espelho oficial alternativo concluiu os downloads.
- Teste dirigido: 2/2 aprovados, em desktop e viewport Android, verificando uma única chamada de recuperação.
- `npm run test:all`: 441/441 aprovados — 13 testes Node/PostgreSQL e 428 testes Playwright.
- Nenhuma migração foi aplicada, nenhum banco de produção foi alterado, nenhum e-mail real foi enviado e não houve publicação, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta prova usa API controlada e não homologa conflito real do Auth nem entrega de e-mail no ambiente conectado. A validação ponta a ponta depende de contas confirmadas, SMTP ou Send Email Hook autorizado e ambiente hospedado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos/contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta de concluir e homologar todo o escopo em 04/12/2026 permanece em risco; ela não é tratada como garantia nem reduzida a MVP.
