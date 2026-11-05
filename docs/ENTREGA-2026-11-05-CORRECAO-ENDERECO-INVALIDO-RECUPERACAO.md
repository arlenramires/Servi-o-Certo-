# Entrega: correção controlada de endereço inválido na recuperação

Validada em 05/11/2026 às 16:57 (America/Boa_Vista).

## Funcionalidade entregue

Quando o Supabase retorna `email_address_invalid` no pedido de recuperação, a interface memoriza o endereço recusado durante a abertura da página. Repetir exatamente esse endereço reapresenta a orientação sem chamar `resetPasswordForEmail` novamente; corrigir o campo para outro endereço continua permitido e inicia uma nova solicitação. A área privada permanece fechada e o contexto de serviço protegido não exibe seu código.

O catálogo oficial define `email_address_invalid` como um endereço não aceito pelo Auth e recomenda usar outro endereço. A referência atual define `resetPasswordForEmail` como a operação que envia o pedido de recuperação:

- https://supabase.com/changelog.md
- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
- https://supabase.com/docs/guides/auth/passwords

## Evidências

- `npm ci --ignore-scripts`: concluído sem erro.
- Teste dirigido `server-rejected email returns focus to the address without retrying`: 2/2 cenários aprovados (desktop e viewport Android). O cenário confirmou uma única chamada para o endereço recusado e uma segunda chamada somente depois da correção do endereço.
- `npm run test:all`: 449/449 testes aprovados — 13 testes Node/PostgreSQL e 436 testes Playwright.
- Nenhuma migração foi aplicada, nenhum banco de produção foi alterado, nenhum e-mail real foi enviado e não houve publicação, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta prova usa API controlada e não homologa entrega de e-mail no ambiente conectado. A validação ponta a ponta depende de contas confirmadas, provedor autorizado e ambiente hospedado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos/contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta de concluir e homologar todo o escopo em 04/12/2026 permanece em risco; ela não é tratada como garantia nem reduzida a MVP.
