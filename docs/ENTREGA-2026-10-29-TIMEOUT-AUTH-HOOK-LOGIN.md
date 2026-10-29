# Entrega: nova tentativa manual após timeout de Auth Hook no login

Data local: 29/10/2026 01:06:53 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase Auth recusa o login com `hook_timeout` ou `hook_timeout_after_retry`, a interface agora informa apenas que o serviço demorou para responder e orienta aguardar antes de uma tentativa manual.

O e-mail e uma eventual referência protegida de serviço permanecem disponíveis, sem revelar o código do serviço. A senha é apagada, o foco retorna ao campo correto e a área privada continua fechada. Nenhuma autenticação ou consulta privada é repetida automaticamente, e a existência ou configuração do Auth Hook não é exposta.

## Referência verificada

- O catálogo atual do Supabase Auth descreve `hook_timeout` como impossibilidade de alcançar o hook no prazo e `hook_timeout_after_retry` como a mesma condição depois das tentativas internas máximas do serviço.
- O changelog atual do Supabase foi consultado antes da implementação. A remoção futura de cifras TLS 1.2 antigas não altera este tratamento no cliente.

## Evidências automatizadas

- Cenário dirigido em desktop e viewport Android: **2/2** aprovados, cobrindo os dois códigos.
- Cada cenário confirma somente uma chamada de login, senha apagada, foco devolvido à senha e preservação do link protegido sem exibir seu código.
- O painel de conta e o espaço privado permanecem ocultos; a mensagem não contém referência a hook.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **347/347** testes aprovados — 13 Node/PostgreSQL isolado e 334 Playwright.
- Nenhuma conta ou sessão real foi criada. Banco conectado, produção, pagamentos, aprovações e privilégios administrativos permaneceram inalterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
