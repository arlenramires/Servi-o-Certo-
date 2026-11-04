# Entrega — contenção de timeout do hook no pedido de reautenticação

Data da validação: 04/11/2026 09:43:23 (America/Boa_Vista)

## Entrega funcional

O pedido do código de reautenticação na recuperação de senha agora contém `hook_timeout` e `hook_timeout_after_retry` do Supabase Auth:

- informa de forma neutra que o serviço de acesso demorou para responder;
- mantém a senha inalterada e a área privada fechada;
- não exibe a entrada do código porque o envio não foi confirmado;
- consome a ação e impede novos `updateUser()`/`reauthenticate()` na mesma abertura;
- orienta aguardar e reabrir a recuperação antes de pedir outro código;
- não revela a configuração do hook nem uma eventual referência protegida.

Não houve mudança de banco, migração, configuração de Auth Hook ou envio de e-mail real.

## Referências verificadas

A referência JavaScript atual confirma que `auth.reauthenticate()` envia o código necessário para a troca protegida de senha. A documentação de Auth Hooks confirma que hooks HTTP e Postgres retornam timeout quando excedem o prazo, e o catálogo oficial diferencia a falha inicial daquela após as tentativas. O changelog de Auth também foi conferido; não há mudança específica incompatível com esta entrega.

- https://supabase.com/docs/reference/javascript/auth-reauthenticate
- https://supabase.com/docs/guides/auth/auth-hooks
- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/changelog?tags=auth

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Testes dirigidos Playwright, desktop e viewport Android: **4/4 aprovados**, cobrindo `hook_timeout` e `hook_timeout_after_retry` isoladamente.
3. `npm run test:all`: **397/397 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 384 testes Playwright com API controlada.
4. As provas confirmam que a segunda submissão não acrescenta chamadas além de um `updateUser()` e um `reauthenticate()` para cada cenário.
5. A primeira execução dirigida expôs interferência de estado entre dois cenários agrupados na mesma página de teste; os casos foram separados em páginas independentes e todos os testes passaram. Não houve falha funcional remanescente.

## Prazo e dependências

A meta definida pelo proprietário permanece em 04/12/2026, sem redução de escopo. O risco externo permanece: pagamentos, contas confirmadas, proprietário administrativo verificado, documentos privados e homologação hospedada ainda dependem de decisões, credenciais sandbox e validações autorizadas. Esta entrega avança uma pendência independente do caminho crítico, mas não elimina essas dependências.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhum e-mail real, cobrança, pagamento, aprovação de documento/profissão ou privilégio administrativo foi criado.
- A homologação com contas confirmadas e serviço de e-mail real continua dependendo de ambiente e credenciais autorizados.
- Ao informar uma entrega, distinguir teste de UI com API controlada, SQL no banco isolado, SQL no Supabase conectado e teste real ponta a ponta com contas confirmadas.
