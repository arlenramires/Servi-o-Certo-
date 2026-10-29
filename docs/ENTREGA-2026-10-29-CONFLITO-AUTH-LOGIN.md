# Entrega: nova tentativa manual após conflito no Auth

Data local: 29/10/2026 02:07:30 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase Auth recusa o login com `conflict`, a interface agora informa que outra atualização de acesso está em andamento e orienta aguardar antes de tentar novamente manualmente.

O e-mail e uma eventual referência protegida de serviço permanecem disponíveis, sem revelar o código do serviço. A senha é apagada, o foco retorna ao campo correto e a área privada continua fechada. Nenhuma autenticação, renovação de sessão ou consulta privada é repetida automaticamente.

## Referência verificada

- O catálogo atual do Supabase Auth descreve `conflict` como conflito geral de banco, frequentemente associado a solicitações concorrentes de renovação de sessão, e recomenda verificar concorrência e aplicar espera antes de tentar novamente.
- O changelog atual do Supabase foi consultado antes da implementação. A remoção futura de cifras TLS 1.2 antigas não altera este tratamento no cliente.

## Evidências automatizadas

- Cenário dirigido em desktop e viewport Android: **2/2** aprovados.
- Cada cenário confirma somente uma chamada de login, senha apagada, foco devolvido à senha e preservação do link protegido sem exibir seu código.
- O painel de conta e o espaço privado permanecem ocultos; nenhuma tentativa automática é iniciada.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **349/349** testes aprovados — 13 Node/PostgreSQL isolado e 336 Playwright.
- Nenhuma conta ou sessão real foi criada. Banco conectado, produção, pagamentos, aprovações e privilégios administrativos permaneceram inalterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
