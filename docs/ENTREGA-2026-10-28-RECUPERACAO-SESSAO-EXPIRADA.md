# Entrega: recuperação após sessão do link expirar

Data local: 28/10/2026 22:18:20 (America/Boa_Vista)

## Resultado funcional

Quando a sessão de um link de recuperação expira antes da abertura ou durante o envio da nova senha, a interface agora descarta a sessão e os dados privados remanescentes, remove os parâmetros temporários e abre diretamente a solicitação de outro e-mail.

A contingência cobre `session_expired`, `session_not_found`, `refresh_token_not_found`, `refresh_token_already_used` e `bad_jwt`. Uma eventual referência protegida de serviço permanece no endereço para a autenticação posterior, mas seu código não é exibido. Nenhuma tentativa de renovação, autenticação ou alteração de senha é repetida automaticamente.

## Referência verificada

- O catálogo atual do Supabase Auth descreve os cinco códigos como sessão expirada ou inexistente, token de renovação ausente ou revogado e JWT inválido.
- O changelog do Supabase foi consultado antes da implementação. A remoção futura de cifras TLS 1.2 antigas não altera esta contingência no cliente.

## Evidências automatizadas

- Cenários dirigidos em desktop e viewport Android: **4/4** aprovados, cobrindo os cinco códigos tanto no carregamento quanto no envio da nova senha.
- A primeira execução dirigida encontrou estado de conta ainda visível depois do erro durante o envio; o fluxo passou a zerar usuário, geração e dados privados antes de exibir a recuperação, e a repetição foi aprovada.
- Para cada código, o painel de nova senha, a conta e o espaço privado ficam ocultos; o foco retorna ao e-mail e a referência protegida permanece sem ser exibida.
- No erro durante a alteração, existe somente a chamada original a `updateUser`; nenhuma saída, renovação ou nova autenticação automática é disparada.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **343/343** testes aprovados — 13 Node/PostgreSQL isolado e 330 Playwright.
- Nenhuma conta, sessão ou mensagem real foi criada. Banco conectado, produção, pagamentos, aprovações e privilégios administrativos permaneceram inalterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
