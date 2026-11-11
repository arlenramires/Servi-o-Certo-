# Entrega: orientação para senha exposta na recuperação

Validada em 11/11/2026 às 05:37 (America/Boa_Vista).

## Funcionalidade entregue

Quando a definição de nova senha retorna `weak_password` com o motivo estruturado `pwned`, a recuperação agora informa que a senha apareceu em vazamentos conhecidos e orienta escolher outra que não seja reutilizada em outros serviços. Os dois campos de senha são apagados, o foco volta para a nova senha, o painel protegido permanece aberto e a área privada continua fechada. A interface não repete `updateUser()` automaticamente.

A implementação anterior simulava um código `password_rejected`, que não existe na tabela atual de erros do Supabase Auth. O cenário controlado foi corrigido para reproduzir `AuthWeakPasswordError`, preservando `weak_password` e `reasons: ['pwned']`, conforme o contrato atual.

Referências oficiais atuais:

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/guides/auth/password-security
- https://github.com/supabase/supabase-js/blob/master/packages/core/auth-js/src/lib/types.ts

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído sem erro.
- Teste dirigido `password recovery explains when Supabase rejects a leaked password`: aprovado em desktop e viewport Android, verificando a mensagem específica, a limpeza dos campos, o foco, a permanência no fluxo protegido e exatamente uma chamada a `updateUser()`.
- `npm run test:all`: 451/451 testes aprovados — 13 testes Node/PostgreSQL e 438 testes Playwright.
- A primeira tentativa dirigida não abriu o navegador porque o Chromium não estava presente no runtime efêmero. `npx playwright install chromium` restaurou Chromium, FFmpeg e o shell headless pelo espelho oficial da Microsoft após o CDN primário devolver arquivos vazios; o teste dirigido e a suíte completa foram então repetidos e aprovados.
- Nenhuma migração foi aplicada, nenhum banco conectado ou de produção foi alterado, nenhum e-mail real foi enviado e não houve publicação, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta prova usa API controlada no navegador e não substitui a homologação hospedada com uma política de proteção contra senhas vazadas habilitada no projeto conectado. A proteção de senhas vazadas depende da configuração do Supabase e, segundo a documentação atual, está disponível no plano Pro ou superior; nenhuma configuração, assinatura ou cobrança foi criada nesta rodada.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta de concluir e homologar todo o escopo em 04/12/2026 continua em risco; ela não é tratada como garantia nem reduzida a MVP.
