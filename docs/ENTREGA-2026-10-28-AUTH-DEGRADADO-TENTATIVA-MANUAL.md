# Entrega: nova tentativa manual após indisponibilidade do Auth

Data local: 28/10/2026 18:36:21 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase responde ao login com `unexpected_failure`, a interface agora informa que o serviço de acesso está temporariamente indisponível e orienta tentar novamente mais tarde, sem expor detalhes internos da falha.

O e-mail e uma eventual referência protegida permanecem disponíveis para uma nova tentativa manual, a senha é apagada, o foco volta ao campo de senha, nenhuma autenticação é repetida automaticamente e o espaço privado continua fechado.

## Referência verificada

- O catálogo atual de erros do Supabase Auth define `unexpected_failure` quando o serviço de autenticação está degradado ou ocorre uma falha sem motivo específico.
- A interface traduz essa condição para uma orientação acionável sem prometer que a tentativa foi concluída.
- O changelog do Supabase foi consultado antes da implementação. A alteração incompatível recente sobre cifras TLS 1.2 antigas não muda este tratamento do Auth.

## Evidências automatizadas

- Cenário dirigido em desktop e viewport Android: **2/2** testes aprovados.
- A API controlada devolve `unexpected_failure` em uma única chamada de login.
- E-mail e referência protegida são preservados sem exibir o código; a senha é apagada e o foco retorna ao campo correto.
- Nenhuma nova autenticação é disparada e a área privada permanece fechada.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **333/333** testes aprovados — 13 Node/PostgreSQL isolado e 320 Playwright.
- Nenhuma conta, sessão ou mensagem real foi criada. Banco conectado, produção, pagamentos, aprovações e privilégios administrativos permaneceram inalterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
