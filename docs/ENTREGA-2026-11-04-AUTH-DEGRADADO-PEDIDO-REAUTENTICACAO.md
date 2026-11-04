# Entrega — contenção de Auth degradado no pedido de reautenticação

Data da validação: 04/11/2026 07:11:05 (America/Boa_Vista)

## Entrega funcional

O pedido do código de reautenticação na recuperação de senha agora contém `unexpected_failure` do Supabase Auth:

- informa de forma neutra que o serviço de acesso está temporariamente indisponível;
- mantém a senha inalterada e a área privada fechada;
- não exibe a entrada do código porque o envio não foi confirmado;
- consome a ação e impede novos `updateUser()`/`reauthenticate()` na mesma abertura;
- orienta reabrir a recuperação mais tarde;
- não revela uma eventual referência protegida.

Não houve mudança de banco, migração, configuração de Auth ou envio de e-mail real.

## Referências verificadas

A referência JavaScript atual confirma que `auth.reauthenticate()` envia o código necessário para a troca protegida de senha. O catálogo oficial define `unexpected_failure` como degradação do Auth ou falha sem motivo específico e recomenda identificar erros de API pelo código. O changelog de Auth também foi conferido; não há mudança específica incompatível com esta entrega.

- https://supabase.com/docs/reference/javascript/auth-reauthenticate
- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/changelog?tags=auth

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Teste dirigido Playwright, desktop e viewport Android: **2/2 aprovados**.
3. `npm run test:all`: **391/391 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 378 testes Playwright com API controlada.
4. A nova prova confirma que a segunda submissão não acrescenta chamadas além de um `updateUser()` e um `reauthenticate()`.

## Prazo e dependências

A meta definida pelo proprietário permanece em 04/12/2026, sem redução de escopo. Há risco real enquanto pagamentos, contas confirmadas, proprietário administrativo verificado, documentos privados e homologação hospedada dependerem de decisões, credenciais sandbox e validações externas. Esta entrega avança uma pendência independente do caminho crítico, mas não elimina essas dependências.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhum e-mail real, cobrança, pagamento, aprovação de documento/profissão ou privilégio administrativo foi criado.
- A homologação com contas confirmadas e serviço de e-mail real continua dependendo de ambiente e credenciais autorizados.
- Ao informar uma entrega, distinguir teste de UI com API controlada, SQL no banco isolado, SQL no Supabase conectado e teste real ponta a ponta com contas confirmadas.
