# Entrega — contenção de conta bloqueada no pedido de reautenticação

Data da validação: 04/11/2026 13:41:54 (America/Boa_Vista)

## Entrega funcional

O pedido do código de reautenticação na recuperação de senha agora contém `user_banned` do Supabase Auth:

- apresenta uma orientação neutra, sem revelar o motivo administrativo do bloqueio;
- mantém a senha inalterada e a área privada fechada;
- não exibe a entrada do código porque o envio não ocorreu;
- consome a tentativa e impede novos `updateUser()`/`reauthenticate()` na mesma abertura;
- orienta procurar o suporte antes de reabrir a recuperação;
- preserva uma referência protegida sem revelar seu código.

Não houve mudança de banco, desbloqueio de usuário, concessão administrativa ou envio real de OTP.

## Referências verificadas

A referência JavaScript atual confirma que `auth.reauthenticate()` envia o OTP de reautenticação. O catálogo oficial informa que erros do servidor Auth possuem `code` estável e determina que, após `user_banned`, não sejam feitas novas requisições até a liberação do bloqueio. O changelog de Auth foi conferido; a alteração futura encontrada refere-se à desativação de cifras TLS antigas em 10/11/2026, sem incompatibilidade específica com este fluxo em navegador moderno.

- https://supabase.com/docs/reference/javascript/auth-reauthenticate
- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/changelog?tags=auth

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. A primeira execução dirigida detectou ausência do Chromium no runtime antes de executar a aplicação. O navegador foi restaurado pelo espelho alternativo do Playwright e os testes foram repetidos.
3. Testes dirigidos Playwright, desktop e viewport Android: **2/2 aprovados**.
4. `npm run test:all`: **409/409 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 396 testes Playwright com API controlada.
5. As provas confirmam que a segunda submissão não acrescenta chamadas além de um `updateUser()` e um `reauthenticate()`.

## Prazo e dependências

A meta definida pelo proprietário permanece em 04/12/2026, sem redução de escopo. Há risco real de atraso enquanto pagamentos, contas confirmadas, proprietário administrativo verificado, documentos privados e homologação hospedada dependerem de decisões, credenciais sandbox e validações autorizadas. Esta entrega reduz uma falha independente de autenticação, mas não remove esses bloqueios de integração.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhuma conta foi desbloqueada, aprovada ou promovida; nenhum OTP real, cobrança ou pagamento foi criado.
- A homologação com contas confirmadas e o tratamento administrativo real continuam dependendo de ambiente e proprietário verificado.
- Ao informar uma entrega, distinguir teste de UI com API controlada, SQL no banco isolado, SQL no Supabase conectado e teste real ponta a ponta com contas confirmadas.
