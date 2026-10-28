# Entrega: nova tentativa manual após timeout no login

Data local: 28/10/2026 15:24:21 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase encerra uma tentativa de login com `request_timeout`, a interface informa que a solicitação demorou mais que o esperado e permite que a pessoa tente novamente manualmente.

O e-mail e uma eventual referência protegida de serviço permanecem disponíveis, sem exibir o código do serviço. A senha é apagada, o foco retorna ao campo de senha, a etapa continua em **Entrar** e nenhuma autenticação é repetida automaticamente. A área privada permanece fechada.

## Referência verificada

- O catálogo atual de erros do Supabase Auth define `request_timeout` quando o processamento demora demais e recomenda uma nova tentativa.
- A nova tentativa permanece sob ação explícita da pessoa; o cliente não cria um ciclo automático de autenticação.
- O changelog do Supabase foi consultado antes da implementação. A alteração incompatível recente sobre cifras TLS 1.2 antigas não muda este tratamento do erro de autenticação.

## Evidências automatizadas

- Cenário dirigido em desktop e viewport Android: **2/2** testes aprovados.
- A API controlada retorna `request_timeout` para uma única chamada de login.
- A mensagem orienta nova tentativa, mas nenhuma segunda chamada é disparada automaticamente.
- O e-mail e o link protegido são preservados, a senha é apagada e a área privada não abre.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **327/327** testes aprovados — 13 Node/PostgreSQL isolado e 314 Playwright.
- Nenhuma conta real foi acessada e nenhuma alteração foi aplicada ao banco conectado, produção, pagamentos, aprovações ou privilégios administrativos.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
