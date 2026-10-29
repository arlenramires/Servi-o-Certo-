# Entrega — contenção de degradação do Auth no reenvio de confirmação

Data da validação: 29/10/2026 13:42:00 (America/Boa_Vista)

## Entrega funcional

O reenvio do e-mail de confirmação agora contém a degradação inesperada do Supabase Auth:

- `unexpected_failure` apresenta orientação neutra para tentar novamente mais tarde;
- a referência interna do e-mail pendente é descartada e o botão de reenvio é ocultado;
- novas ativações na mesma abertura não repetem `resend()`, evitando solicitações duplicadas durante a indisponibilidade;
- a conta e o espaço privado permanecem fechados;
- uma eventual referência protegida é preservada sem exibir seu código.

Não houve mudança de banco, migração, configuração de Auth ou envio de e-mail real.

## Referências verificadas

O catálogo oficial atual define `unexpected_failure` como degradação do serviço Auth ou falha sem causa específica. A referência JavaScript confirma que `auth.resend()` reenvia a confirmação de cadastro. O changelog atual foi consultado e não apresentou mudança incompatível aplicável ao fluxo.

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/reference/javascript/auth-resend
- https://supabase.com/changelog?tags=auth

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Teste dirigido Playwright, desktop e viewport Android: **2/2 aprovados**.
3. `npm run test:all`: **377/377 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 364 testes Playwright com API controlada.
4. Após o `npm ci`, `npx playwright install chromium` recuperou o navegador pelo espelho secundário porque o CDN primário devolveu arquivos vazios; a suíte dirigida e a completa passaram.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhum e-mail real, cobrança, pagamento, aprovação de documento/profissão ou privilégio administrativo foi criado.
- A homologação com contas confirmadas e serviço de e-mail real continua dependendo de ambiente e credenciais autorizados.
