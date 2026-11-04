# Entrega — contenção de timeout no pedido de reautenticação

Data da validação: 04/11/2026 06:46:29 (America/Boa_Vista)

## Entrega funcional

O pedido do código de reautenticação na recuperação de senha agora contém `request_timeout` do Supabase Auth:

- informa que a solicitação demorou mais que o esperado;
- mantém a senha inalterada e a área privada fechada;
- não exibe a entrada do código porque o envio não foi confirmado;
- consome a ação incerta e impede outro `reauthenticate()` na mesma abertura;
- orienta reabrir a recuperação antes de solicitar outro código;
- não revela uma eventual referência protegida.

Não houve mudança de banco, migração, configuração de Auth ou envio de e-mail real.

## Referências verificadas

A referência JavaScript atual confirma que `auth.reauthenticate()` envia um código de reautenticação ao e-mail ou telefone da pessoa autenticada. O catálogo oficial define `request_timeout` como processamento acima do prazo e recomenda repetir a solicitação. Como o resultado do envio é incerto, a repetição fica disponível somente após reabrir o fluxo. O changelog de Auth também foi conferido e não apresenta mudança específica incompatível com esta entrega.

- https://supabase.com/docs/reference/javascript/auth-reauthenticate
- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/changelog?tags=auth

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Teste dirigido Playwright, desktop e viewport Android: **2/2 aprovados**.
3. `npm run test:all`: **389/389 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 376 testes Playwright com API controlada.
4. A nova prova confirma que a segunda submissão não acrescenta chamadas além de `updateUser()` e do único `reauthenticate()` que expirou.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhum e-mail real, cobrança, pagamento, aprovação de documento/profissão ou privilégio administrativo foi criado.
- A homologação com contas confirmadas e serviço de e-mail real continua dependendo de ambiente e credenciais autorizados.
- Ao informar uma entrega, distinguir teste de UI com API controlada, SQL no banco isolado, SQL no Supabase conectado e teste real ponta a ponta com contas confirmadas.
