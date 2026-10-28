# Entrega: login sem enumeração de usuário ausente

Data local: 28/10/2026 17:42:31 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase responde ao login com `user_not_found`, a interface agora exibe exatamente a mesma mensagem usada para `invalid_credentials`: **E-mail ou senha incorretos.** Assim, a resposta visível não confirma se o endereço informado possui uma conta.

O e-mail e uma eventual referência protegida permanecem disponíveis para uma nova tentativa, a senha é apagada, o foco volta ao campo de senha, nenhuma autenticação é repetida automaticamente e o espaço privado continua fechado.

## Referência verificada

- O catálogo atual de erros do Supabase Auth define `user_not_found` para uma requisição relacionada a um usuário que não existe mais.
- A resposta neutra evita transformar essa diferença interna em um indicador de existência de conta.
- O changelog do Supabase foi consultado antes da implementação. A alteração incompatível recente sobre cifras TLS 1.2 antigas não muda este tratamento do Auth.

## Evidências automatizadas

- Cenário dirigido em desktop e viewport Android: **2/2** testes aprovados.
- A API controlada devolve `user_not_found` em uma única chamada de login.
- A mensagem é idêntica à de credenciais inválidas, sem oferecer reenvio de confirmação ou outra pista sobre a conta.
- A senha é apagada, o e-mail e o link protegido são preservados sem exibir o código, e a área privada permanece fechada.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **331/331** testes aprovados — 13 Node/PostgreSQL isolado e 318 Playwright.
- Nenhuma conta, sessão ou mensagem real foi criada. Banco conectado, produção, pagamentos, aprovações e privilégios administrativos permaneceram inalterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
