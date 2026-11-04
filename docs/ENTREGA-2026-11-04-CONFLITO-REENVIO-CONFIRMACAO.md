# Entrega — contenção de conflito no reenvio de confirmação

Data da validação: 04/11/2026 03:23:25 (America/Boa_Vista)

## Entrega funcional

O reenvio do e-mail de confirmação agora contém conflitos de solicitações concorrentes informados pelo Supabase Auth:

- `conflict` apresenta orientação neutra para aguardar e tentar novamente;
- a referência interna do e-mail pendente é descartada e o botão de reenvio é ocultado;
- novas ativações na mesma abertura não repetem `resend()`, evitando solicitações concorrentes adicionais;
- a conta e o espaço privado permanecem fechados;
- uma eventual referência protegida é preservada sem exibir seu código.

Não houve mudança de banco, migração, configuração de Auth ou envio de e-mail real.

## Referências verificadas

O catálogo oficial atual define `conflict` como conflito geral de banco, inclusive solicitações concorrentes sobre recursos que não devem ser modificados ao mesmo tempo, e recomenda espera progressiva. A referência JavaScript confirma que `auth.resend()` reenvia a confirmação de cadastro. O changelog oficial de Auth também foi consultado antes da alteração.

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/reference/javascript/auth-resend
- https://supabase.com/changelog?tags=auth

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Teste dirigido Playwright, desktop e viewport Android: **2/2 aprovados**.
3. `npm run test:all`: **381/381 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 368 testes Playwright com API controlada.
4. Após o `npm ci`, `npx playwright install chromium` recuperou o navegador pelo espelho secundário porque o CDN primário devolveu arquivos vazios; a suíte dirigida e a completa passaram.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhum e-mail real, cobrança, pagamento, aprovação de documento/profissão ou privilégio administrativo foi criado.
- A homologação com contas confirmadas e serviço de e-mail real continua dependendo de ambiente e credenciais autorizados.
- Ao informar uma entrega, distinguir teste de UI com API controlada, SQL no banco isolado, SQL no Supabase conectado e teste real ponta a ponta com contas confirmadas.
