# Entrega — contenção de carga inválida do hook no pedido de reautenticação

Data da validação: 04/11/2026 10:37:31 (America/Boa_Vista)

## Entrega funcional

O pedido do código de reautenticação na recuperação de senha agora contém `hook_payload_over_size_limit` e `hook_payload_invalid_content_type` do Supabase Auth:

- informa de forma neutra que o serviço recusou a solicitação;
- mantém a senha inalterada e a área privada fechada;
- não exibe a entrada do código porque o envio não foi confirmado;
- consome a ação e impede novos `updateUser()`/`reauthenticate()` na mesma abertura;
- orienta reabrir a recuperação mais tarde;
- não revela o tamanho, o tipo de conteúdo nem a configuração interna do hook.

Não houve mudança de banco, migração, configuração de Auth Hook ou envio de e-mail real.

## Referências verificadas

A referência JavaScript atual confirma que `auth.reauthenticate()` envia o OTP de reautenticação. O catálogo oficial identifica separadamente a carga acima do limite e o tipo de conteúdo inválido. A documentação do Send Email Hook confirma que esse hook substitui o envio nativo e que uma resposta HTTP 200 vazia é considerada sucesso.

- https://supabase.com/docs/reference/javascript/auth-reauthenticate
- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Testes dirigidos Playwright, desktop e viewport Android: **4/4 aprovados**, cobrindo os dois códigos isoladamente.
3. `npm run test:all`: **401/401 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 388 testes Playwright com API controlada.
4. As provas confirmam que a segunda submissão não acrescenta chamadas além de um `updateUser()` e um `reauthenticate()` para cada cenário.

## Prazo e dependências

A meta definida pelo proprietário permanece em 04/12/2026, sem redução de escopo. Há risco real de atraso enquanto pagamentos, contas confirmadas, proprietário administrativo verificado, documentos privados e homologação hospedada dependerem de decisões, credenciais sandbox e validações autorizadas. Esta entrega reduz uma falha independente do caminho crítico, mas não remove esses bloqueios de integração.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhum e-mail real, cobrança, pagamento, aprovação de documento/profissão ou privilégio administrativo foi criado.
- A homologação com contas confirmadas e serviço de e-mail real continua dependendo de ambiente e credenciais autorizados.
- Ao informar uma entrega, distinguir teste de UI com API controlada, SQL no banco isolado, SQL no Supabase conectado e teste real ponta a ponta com contas confirmadas.
