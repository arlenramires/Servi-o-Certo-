# Entrega: normalização do bloqueio de endereço na recuperação

Validada em 05/11/2026 às 17:52 (America/Boa_Vista).

## Funcionalidade entregue

Depois que o Supabase recusa um endereço no pedido de recuperação, a interface agora usa uma chave normalizada em minúsculas para o bloqueio durante a abertura da página. Alterar somente a capitalização do mesmo endereço reapresenta a orientação sem chamar `resetPasswordForEmail` novamente; informar outro endereço continua permitido e inicia uma nova solicitação. A área privada permanece fechada e o contexto de serviço protegido não exibe seu código.

O código oficial do Supabase Auth normaliza endereços para minúsculas ao armazenar usuários e identidades, e o histórico oficial registra a correção de normalização na validação de e-mails. A referência atual define `resetPasswordForEmail` como a operação que envia o pedido de recuperação:

- https://supabase.com/changelog.md
- https://github.com/supabase/auth/blob/master/CHANGELOG.md
- https://github.com/supabase/auth/blob/master/internal/models/user.go
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail

## Evidências

- `npm ci --ignore-scripts`: concluído sem erro.
- Teste dirigido `server-rejected email returns focus to the address without retrying`: 2/2 cenários aprovados (desktop e viewport Android). O cenário confirmou que a mesma capitalização e uma variação em maiúsculas consumiram somente a primeira chamada, enquanto um endereço diferente permaneceu disponível.
- `npm run test:all`: 449/449 testes aprovados — 13 testes Node/PostgreSQL e 436 testes Playwright.
- O Chromium não estava presente no runtime. O CDN primário devolveu arquivos vazios, mas a origem alternativa oficial do instalador restaurou Chromium, FFmpeg e o shell headless; depois disso, o teste dirigido e a suíte integral passaram.
- Nenhuma migração foi aplicada, nenhum banco de produção foi alterado, nenhum e-mail real foi enviado e não houve publicação, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta prova usa API controlada e não homologa entrega de e-mail no ambiente conectado. A validação ponta a ponta depende de contas confirmadas, provedor autorizado e ambiente hospedado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos/contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta de concluir e homologar todo o escopo em 04/12/2026 permanece em risco; ela não é tratada como garantia nem reduzida a MVP.
