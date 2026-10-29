# Entrega — contenção de timeout do hook no reenvio de confirmação

Data da validação: 29/10/2026 11:49:24 (America/Boa_Vista)

## Entrega funcional

O reenvio do e-mail de confirmação agora contém respostas incertas do hook de envio do Supabase Auth:

- `hook_timeout` e `hook_timeout_after_retry` apresentam uma orientação neutra para aguardar;
- a referência interna do e-mail pendente é descartada e o botão de reenvio é ocultado após o timeout;
- novas ativações na mesma abertura não repetem `resend()`, evitando uma possível entrega duplicada;
- a conta e o espaço privado permanecem fechados;
- uma eventual referência protegida é preservada sem exibir seu código.

Não houve mudança de banco, migração, configuração de Auth ou envio de e-mail real.

## Referências verificadas

O catálogo oficial atual define `hook_timeout` como a impossibilidade de alcançar o hook no prazo máximo e `hook_timeout_after_retry` como falha após o número máximo de tentativas. A documentação confirma que `auth.resend()` reenvia a confirmação de cadastro e que o Send Email Hook é executado para e-mails do Auth. O changelog atual foi consultado e não apresentou mudança incompatível aplicável ao fluxo.

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/reference/javascript/auth-resend
- https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
- https://supabase.com/changelog?tags=auth

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Testes dirigidos Playwright, desktop e viewport Android, cobrindo os dois códigos: **2/2 aprovados**.
3. `npm run test:all`: **375/375 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 362 testes Playwright com API controlada.
4. Após o `npm ci`, `npx playwright install chromium` recuperou o navegador pelo espelho secundário porque o CDN primário devolveu arquivos vazios; os testes dirigidos e a suíte completa passaram.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhum e-mail real, cobrança, pagamento, aprovação de documento/profissão ou privilégio administrativo foi criado.
- A homologação com contas confirmadas e Send Email Hook configurado continua dependendo de ambiente e credenciais autorizados.
