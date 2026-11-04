# Entrega — recuperação após corpo recusado no reenvio de confirmação

Data da validação: 04/11/2026 06:28:16 (America/Boa_Vista)

## Entrega funcional

O reenvio do e-mail de confirmação agora contém a recusa `bad_json` do Supabase Auth:

- informa que os dados da solicitação foram recusados e orienta reabrir o fluxo;
- descarta a referência interna do e-mail pendente e oculta o botão de reenvio;
- novas ativações na mesma abertura não repetem `resend()` com o mesmo corpo fixo;
- a conta e o espaço privado permanecem fechados;
- uma eventual referência protegida é preservada sem exibir seu código.

Não houve mudança de banco, migração, configuração de Auth ou envio de e-mail real.

## Referências verificadas

O catálogo oficial atual define `bad_json` como corpo HTTP que não é JSON válido. A referência JavaScript confirma a estrutura de `auth.resend()` para confirmação de cadastro. O changelog oficial de Auth e as mudanças incompatíveis publicadas também foram conferidos; não há mudança específica de `resend()` aplicável a esta entrega.

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/reference/javascript/auth-resend
- https://supabase.com/changelog?tags=auth
- https://supabase.com/changelog?types=breaking-change

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Teste dirigido Playwright, desktop e viewport Android: **2/2 aprovados**.
3. `npm run test:all`: **387/387 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 374 testes Playwright com API controlada.
4. Após o `npm ci`, `npx playwright install chromium` recuperou o navegador pelo espelho secundário porque o CDN primário devolveu arquivos vazios; a suíte dirigida e a completa passaram.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhum e-mail real, cobrança, pagamento, aprovação de documento/profissão ou privilégio administrativo foi criado.
- A homologação com contas confirmadas e serviço de e-mail real continua dependendo de ambiente e credenciais autorizados.
- Ao informar uma entrega, distinguir teste de UI com API controlada, SQL no banco isolado, SQL no Supabase conectado e teste real ponta a ponta com contas confirmadas.
