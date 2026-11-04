# Entrega — contenção de OTP desativado no pedido de reautenticação

Data da validação: 04/11/2026 12:14:31 (America/Boa_Vista)

## Entrega funcional

O pedido do código de reautenticação na recuperação de senha agora contém `otp_disabled` do Supabase Auth:

- informa que o envio do código está temporariamente indisponível;
- mantém a senha inalterada e a área privada fechada;
- não exibe a entrada do código porque o envio não ocorreu;
- consome a tentativa e impede novos `updateUser()`/`reauthenticate()` na mesma abertura;
- orienta reabrir a recuperação mais tarde antes de outra tentativa;
- não revela a referência protegida nem detalhes internos do Auth.

Não houve mudança de banco, migração, configuração de autenticação ou envio de OTP real.

## Referências verificadas

A referência JavaScript atual confirma que `auth.reauthenticate()` envia o OTP de reautenticação. O catálogo oficial define `otp_disabled` como indisponibilidade porque o login por OTP está desativado e confirma que erros de Auth originados no servidor possuem um `code` estável para tratamento. O changelog de Auth foi conferido; não foi encontrada incompatibilidade nova específica com este fluxo.

- https://supabase.com/docs/reference/javascript/auth-reauthenticate
- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/changelog?tags=auth

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. A primeira execução dirigida detectou ausência do Chromium no runtime, antes de executar a aplicação. O navegador foi reinstalado pelo espelho alternativo do Playwright, sem mudança funcional no projeto.
3. Testes dirigidos Playwright, desktop e viewport Android: **2/2 aprovados**.
4. `npm run test:all`: **407/407 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 394 testes Playwright com API controlada.
5. As provas confirmam que a segunda submissão não acrescenta chamadas além de um `updateUser()` e um `reauthenticate()`.

## Prazo e dependências

A meta definida pelo proprietário permanece em 04/12/2026, sem redução de escopo. Há risco real de atraso enquanto pagamentos, contas confirmadas, proprietário administrativo verificado, documentos privados e homologação hospedada dependerem de decisões, credenciais sandbox e validações autorizadas. Esta entrega reduz uma falha independente do caminho crítico, mas não remove esses bloqueios de integração.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhum OTP ou e-mail real, cobrança, pagamento, aprovação de documento/profissão ou privilégio administrativo foi criado.
- A homologação com contas confirmadas e serviço real de entrega de OTP continua dependendo de ambiente e credenciais autorizados.
- Ao informar uma entrega, distinguir teste de UI com API controlada, SQL no banco isolado, SQL no Supabase conectado e teste real ponta a ponta com contas confirmadas.
