# Entrega: bloqueio persistente após carga inválida do hook no pedido de recuperação

Validada em 05/11/2026 às 14:38 (America/Boa_Vista).

## Funcionalidade entregue

Quando o Supabase retorna `hook_payload_over_size_limit` ou `hook_payload_invalid_content_type` no pedido inicial de recuperação de senha, a interface agora mantém o bloqueio durante toda a abertura da página. Depois de voltar ao login, selecionar novamente a recuperação e acionar o envio apenas reapresenta a orientação; nenhuma segunda chamada de `resetPasswordForEmail` é feita contra o hook que recusou a carga. O e-mail é preservado, a área privada permanece fechada e o contexto de serviço protegido não exibe seu código.

O catálogo oficial do Supabase define esses códigos, respectivamente, como carga do Auth Hook acima do limite máximo e carga sem cabeçalho `Content-Type` válido. A documentação define `resetPasswordForEmail` como o pedido de envio da recuperação. O changelog atual não indica mudança incompatível relevante para este tratamento:

- https://supabase.com/changelog.md
- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/guides/auth/auth-hooks
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- O runtime isolado não possuía Chromium após a instalação limpa. O CDN primário do Playwright retornou arquivos vazios; o espelho oficial alternativo restaurou Chromium, shell headless e FFmpeg.
- Teste dirigido: 2/2 aprovados, em desktop e viewport Android. O cenário seleciona novamente a recuperação depois de cada uma das duas recusas e comprova somente uma chamada ao Auth.
- `npm run test:all`: 447/447 aprovados — 13 testes Node/PostgreSQL e 434 testes Playwright.
- Nenhuma migração foi aplicada, nenhum banco de produção foi alterado, nenhum e-mail real foi enviado e não houve publicação, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta prova usa API controlada e não homologa resposta real do Auth Hook, SMTP nem entrega de e-mail no ambiente conectado. A validação ponta a ponta depende de contas confirmadas, configuração autorizada e ambiente hospedado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos/contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta de concluir e homologar todo o escopo em 04/12/2026 permanece em risco; ela não é tratada como garantia nem reduzida a MVP.
