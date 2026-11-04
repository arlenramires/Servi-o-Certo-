# Entrega — contenção de conflito no pedido de reautenticação

Data da validação: 04/11/2026 07:48:52 (America/Boa_Vista)

## Entrega funcional

O pedido do código de reautenticação na recuperação de senha agora contém `conflict` do Supabase Auth:

- informa que existe outra atualização de acesso em andamento;
- mantém a senha inalterada e a área privada fechada;
- não exibe a entrada do código porque o envio não foi confirmado;
- consome a ação e impede novos `updateUser()`/`reauthenticate()` na mesma abertura;
- orienta aguardar e reabrir a recuperação antes de pedir outro código;
- não revela uma eventual referência protegida.

Não houve mudança de banco, migração, configuração de Auth ou envio de e-mail real.

## Referências verificadas

A referência JavaScript atual confirma que `auth.reauthenticate()` envia o código necessário para a troca protegida de senha. O catálogo oficial define `conflict` como concorrência sobre recursos que não devem ser atualizados simultaneamente e orienta identificar e reduzir chamadas concorrentes. O changelog de Auth também foi conferido; não há mudança específica incompatível com esta entrega.

- https://supabase.com/docs/reference/javascript/auth-reauthenticate
- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/changelog?tags=auth

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Teste dirigido Playwright, desktop e viewport Android: **2/2 aprovados**.
3. `npm run test:all`: **393/393 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 380 testes Playwright com API controlada.
4. A nova prova confirma que a segunda submissão não acrescenta chamadas além de um `updateUser()` e um `reauthenticate()`.
5. A primeira execução dirigida encontrou uma expectativa textual desatualizada no teste; ela foi alinhada à mensagem existente do produto e a prova dirigida e a suíte completa passaram. Não houve falha funcional remanescente.

## Prazo e dependências

A meta definida pelo proprietário permanece em 04/12/2026, sem redução de escopo. O risco externo permanece: pagamentos, contas confirmadas, proprietário administrativo verificado, documentos privados e homologação hospedada ainda dependem de decisões, credenciais sandbox e validações autorizadas. Esta entrega avança uma pendência independente do caminho crítico, mas não elimina essas dependências.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhum e-mail real, cobrança, pagamento, aprovação de documento/profissão ou privilégio administrativo foi criado.
- A homologação com contas confirmadas e serviço de e-mail real continua dependendo de ambiente e credenciais autorizados.
- Ao informar uma entrega, distinguir teste de UI com API controlada, SQL no banco isolado, SQL no Supabase conectado e teste real ponta a ponta com contas confirmadas.
