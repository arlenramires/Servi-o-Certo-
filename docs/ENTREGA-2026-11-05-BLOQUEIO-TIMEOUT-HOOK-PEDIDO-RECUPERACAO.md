# Entrega: bloqueio persistente após timeout do hook no pedido de recuperação

Validada em 05/11/2026 às 10:06 (America/Boa_Vista).

## Funcionalidade entregue

Quando o Supabase retorna `hook_timeout` ou `hook_timeout_after_retry` no pedido inicial de recuperação de senha, a interface agora mantém o bloqueio da tentativa durante toda a abertura da página. Depois de voltar ao login, selecionar novamente a recuperação e acionar o envio apenas reapresenta a orientação para aguardar; nenhuma segunda chamada de `resetPasswordForEmail` é feita quando o resultado do envio anterior é incerto. O e-mail é preservado, a área privada permanece fechada e o contexto de serviço protegido não exibe seu código.

O catálogo oficial do Supabase define os dois códigos como falha de alcance do hook dentro do prazo, a documentação de Auth Hooks estabelece limites de execução e `resetPasswordForEmail` é o método que solicita o e-mail de recuperação:

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/guides/auth/auth-hooks
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
- https://supabase.com/docs/guides/auth/rate-limits

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- O CDN primário do Playwright retornou arquivos vazios; o espelho oficial alternativo restaurou Chromium, shell headless e FFmpeg no runtime isolado.
- Teste dirigido: 2/2 aprovados, em desktop e viewport Android. O cenário seleciona novamente a recuperação após `hook_timeout` e `hook_timeout_after_retry` e comprova que somente a primeira chamada chega ao Auth.
- `npm run test:all`: 447/447 aprovados — 13 testes Node/PostgreSQL e 434 testes Playwright.
- Nenhuma migração foi aplicada, nenhum banco de produção foi alterado, nenhum e-mail real foi enviado e não houve publicação, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta prova usa API controlada e não homologa resposta real do Auth, hook, SMTP nem entrega de e-mail no ambiente conectado. A validação ponta a ponta depende de contas confirmadas, configuração autorizada e ambiente hospedado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos/contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta de concluir e homologar todo o escopo em 04/12/2026 permanece em risco; ela não é tratada como garantia nem reduzida a MVP.
