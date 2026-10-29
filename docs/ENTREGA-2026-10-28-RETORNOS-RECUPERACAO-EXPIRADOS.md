# Entrega: recuperação de retornos expirados do Auth

Data local: 28/10/2026 20:32:58 (America/Boa_Vista)

## Resultado funcional

Retornos de recuperação de senha que o Supabase identifica como `otp_expired`, `flow_state_expired`, `flow_state_not_found` ou `bad_code_verifier` agora seguem a mesma contingência segura de um link sem sessão válida.

A interface não oferece a definição de nova senha com um retorno inválido: remove o fragmento e os parâmetros temporários, abre diretamente **Recuperar senha** e orienta solicitar outro e-mail. Uma eventual referência protegida de serviço permanece no endereço para a autenticação posterior, mas seu código não é exibido. Nenhuma chamada adicional ao Auth é disparada e o espaço privado permanece fechado.

## Referência verificada

- O catálogo atual do Supabase Auth orienta iniciar novamente o fluxo quando o OTP ou o estado PKCE expirou ou deixou de existir; `bad_code_verifier` representa uma inconsistência no fluxo PKCE.
- O changelog do Supabase foi consultado antes da implementação. A alteração incompatível recente sobre cifras TLS 1.2 antigas não muda esta contingência do retorno de recuperação.

## Evidências automatizadas

- Cenário dirigido em desktop e viewport Android: **2/2** testes aprovados, cobrindo os quatro códigos oficiais.
- Para cada código, o painel de nova senha e o espaço privado permanecem ocultos; o formulário abre em **Recuperar senha** com foco no e-mail.
- Fragmento e parâmetro temporário são removidos; a referência protegida permanece sem ser exibida.
- Nenhuma chamada de login, cadastro, recuperação ou alteração de senha é disparada durante a correção.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **337/337** testes aprovados — 13 Node/PostgreSQL isolado e 324 Playwright.
- Nenhuma conta, sessão ou mensagem real foi criada. Banco conectado, produção, pagamentos, aprovações e privilégios administrativos permaneceram inalterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
