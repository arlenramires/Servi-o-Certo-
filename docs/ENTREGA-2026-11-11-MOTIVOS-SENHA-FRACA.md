# Entrega: orientação pelos motivos de senha fraca

Validada em 11/11/2026 às 06:26:16 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

Cadastro e recuperação de senha agora interpretam os motivos estruturados do `AuthWeakPasswordError`. Quando o Supabase informa `characters`, a interface orienta combinar letras, números e símbolos; quando informa `length`, orienta escolher uma senha mais longa. A mensagem anterior permanece como fallback seguro quando o serviço retorna somente `weak_password` sem detalhes.

Nos dois fluxos, as senhas recusadas são apagadas, o foco retorna ao campo correto, a área privada permanece fechada e a solicitação não é repetida automaticamente. A orientação para o motivo `pwned`, entregue anteriormente, continua tendo precedência.

Referências oficiais atuais:

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/guides/auth/password-security
- https://github.com/supabase/supabase-js/blob/master/packages/core/auth-js/src/lib/types.ts

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído sem erro.
- Testes dirigidos de `characters` no cadastro e `length` na recuperação: 4/4 aprovados em desktop e viewport Android.
- `npm run test:all`: 455/455 verificações aprovadas — 13 testes Node/PostgreSQL e 442 testes Playwright.
- O runtime inicialmente não tinha o Chromium do Playwright. A instalação pelo espelho oficial da Microsoft resolveu a ausência depois de o CDN primário devolver artefatos vazios; os testes dirigidos e a suíte completa foram repetidos e aprovados.
- Nenhuma migração foi aplicada, nenhum banco conectado ou de produção foi alterado, nenhum e-mail real foi enviado e não houve publicação, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta prova usa API controlada no navegador e não substitui a homologação hospedada contra a política de senhas efetivamente configurada no projeto conectado. A interface orienta sem presumir o tamanho mínimo definido no servidor.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta de concluir e homologar todo o escopo em 04/12/2026 continua em risco; ela não é tratada como garantia nem reduzida a MVP.
