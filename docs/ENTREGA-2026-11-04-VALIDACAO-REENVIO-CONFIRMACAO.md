# Entrega — recuperação após validação recusada no reenvio de confirmação

Data da validação: 04/11/2026 04:26:29 (America/Boa_Vista)

## Entrega funcional

O reenvio do e-mail de confirmação agora contém a recusa `validation_failed` do Supabase Auth:

- informa que o reenvio não pôde ser validado e orienta entrar novamente com o e-mail;
- descarta a referência interna imutável do e-mail pendente e oculta o botão de reenvio;
- novas ativações na mesma abertura não repetem `resend()` com os mesmos parâmetros recusados;
- a conta e o espaço privado permanecem fechados;
- uma eventual referência protegida é preservada sem exibir seu código.

O fluxo precisa ser reaberto manualmente pelo login antes de uma nova solicitação. Não houve mudança de banco, migração, configuração de Auth ou envio de e-mail real.

## Referências verificadas

O catálogo oficial atual define `validation_failed` como parâmetros fora do formato esperado. A referência JavaScript confirma os campos fixos usados por `auth.resend()` no reenvio de confirmação de cadastro. O changelog oficial de Auth e as mudanças incompatíveis publicadas também foram conferidos; não há mudança específica de `resend()` aplicável a esta entrega.

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/reference/javascript/auth-resend
- https://supabase.com/changelog?tags=auth
- https://supabase.com/changelog?types=breaking-change

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Teste dirigido Playwright, desktop e viewport Android: **2/2 aprovados**.
3. `npm run test:all`: **383/383 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 370 testes Playwright com API controlada.
4. Após o `npm ci`, `npx playwright install chromium` recuperou o navegador pelo espelho secundário porque o CDN primário devolveu arquivos vazios; a suíte dirigida e a completa passaram.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhum e-mail real, cobrança, pagamento, aprovação de documento/profissão ou privilégio administrativo foi criado.
- A homologação com contas confirmadas e serviço de e-mail real continua dependendo de ambiente e credenciais autorizados.
- Ao informar uma entrega, distinguir teste de UI com API controlada, SQL no banco isolado, SQL no Supabase conectado e teste real ponta a ponta com contas confirmadas.
