# Entrega: contenção de timeout no pedido de recuperação

Validada em 05/11/2026 às 01:00 (America/Boa_Vista).

## Funcionalidade entregue

Quando o pedido de recuperação de senha retorna `request_timeout`, a interface agora consome a tentativa de resultado incerto, volta ao login com o e-mail preservado e orienta o usuário a aguardar antes de solicitar novamente. A mudança impede uma repetição imediata de `resetPasswordForEmail`, mantém a área privada fechada e conserva o contexto de serviço protegido sem exibir seu código.

O catálogo oficial do Supabase define `request_timeout` como processamento acima do prazo e recomenda repetir a solicitação. Como `resetPasswordForEmail` solicita o envio de um e-mail e o endpoint de recuperação possui janela de limitação própria, a interface posterga a repetição em vez de duplicar imediatamente uma entrega de resultado incerto:

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
- https://supabase.com/docs/guides/auth/rate-limits

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- A primeira execução dirigida não iniciou os testes porque o executável do Chromium estava ausente no runtime. Chromium, shell headless e FFmpeg foram restaurados pelo espelho oficial alternativo do Playwright após o CDN primário retornar arquivos vazios.
- Repetição do teste dirigido após a correção: 2/2 aprovados, em desktop e viewport Android, verificando uma única chamada de recuperação.
- `npm run test:all`: 437/437 aprovados — 13 testes Node/PostgreSQL e 424 testes Playwright.
- Nenhuma migração foi aplicada, nenhum banco de produção foi alterado, nenhum e-mail real foi enviado e não houve publicação, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta prova usa API controlada e não homologa timeout ou entrega real de e-mail no ambiente conectado. A validação ponta a ponta depende de contas confirmadas, SMTP ou Send Email Hook autorizado e ambiente hospedado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos/contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta de concluir e homologar todo o escopo em 04/12/2026 permanece em risco; ela não é tratada como garantia nem reduzida a MVP.
