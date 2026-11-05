# Entrega: contenção de timeout do hook no pedido de recuperação

Validada em 05/11/2026 às 00:14 (America/Boa_Vista).

## Funcionalidade entregue

Quando o pedido de recuperação de senha retorna `hook_timeout` ou `hook_timeout_after_retry`, a interface agora consome a tentativa de entrega incerta, volta ao login com o e-mail preservado e orienta o usuário a aguardar antes de solicitar novamente. Isso impede chamadas repetidas imediatas ao `resetPasswordForEmail`, mantém a área privada fechada e conserva o contexto de serviço protegido sem exibir seu código.

A documentação oficial do Supabase define esses códigos como falha de contato com o hook dentro do tempo máximo, antes ou depois das tentativas previstas. O pedido de redefinição é uma operação de envio de e-mail e pode usar um Send Email Hook personalizado:

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- Chromium, shell headless e FFmpeg do Playwright instalados no runtime isolado; o CDN primário retornou arquivo vazio, mas o espelho oficial concluiu os downloads sem alterar o projeto.
- Teste dirigido: 2/2 aprovados, em desktop e viewport Android, exercitando `hook_timeout` e `hook_timeout_after_retry` e verificando uma única chamada de recuperação.
- `npm run test:all`: 435/435 aprovados — 13 testes Node/PostgreSQL e 422 testes Playwright.
- Nenhuma migração foi aplicada, nenhum banco de produção foi alterado, nenhum e-mail real foi enviado e não houve publicação, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta entrega valida a reação da interface com API controlada; não homologa a entrega real de e-mail nem um Send Email Hook conectado. A homologação ponta a ponta ainda depende de contas confirmadas, provedor de e-mail/hook autorizado e ambiente hospedado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário para administração; armazenamento privado e análise de documentos/contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta de concluir e homologar todo o escopo em 04/12/2026 permanece em risco; ela não é tratada como garantia nem reduzida a MVP.
