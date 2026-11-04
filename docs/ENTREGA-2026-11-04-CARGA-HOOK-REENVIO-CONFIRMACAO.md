# Entrega — contenção de carga inválida do hook no reenvio de confirmação

Data da validação: 04/11/2026 05:06:19 (America/Boa_Vista)

## Entrega funcional

O reenvio do e-mail de confirmação agora contém recusas determinísticas da carga enviada ao Send Email Hook do Supabase Auth:

- `hook_payload_over_size_limit` e `hook_payload_invalid_content_type` apresentam orientação neutra, sem expor a configuração interna;
- a referência interna do e-mail pendente é descartada e o botão de reenvio é ocultado;
- novas ativações na mesma abertura não repetem `resend()` contra o hook que recusou a carga;
- a conta e o espaço privado permanecem fechados;
- uma eventual referência protegida é preservada sem exibir seu código.

Não houve mudança de hook, banco, migração, configuração de Auth ou envio de e-mail real.

## Referências verificadas

O catálogo oficial atual define os dois códigos como carga acima do limite e `Content-Type` inválido. A documentação do Send Email Hook especifica o corpo esperado e a resposta de sucesso. O changelog oficial de Auth também foi conferido antes da alteração.

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
- https://supabase.com/docs/reference/javascript/auth-resend
- https://supabase.com/changelog?tags=auth

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Teste dirigido Playwright, desktop e viewport Android, cobrindo os dois códigos: **2/2 aprovados**.
3. `npm run test:all`: **385/385 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 372 testes Playwright com API controlada.
4. Após o `npm ci`, `npx playwright install chromium` recuperou o navegador pelo espelho secundário porque o CDN primário devolveu arquivos vazios; a suíte dirigida e a completa passaram.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhum e-mail real, cobrança, pagamento, aprovação de documento/profissão ou privilégio administrativo foi criado.
- A correção da configuração de um Send Email Hook real continua dependendo do ambiente autorizado e do responsável pelo hook.
- Ao informar uma entrega, distinguir teste de UI com API controlada, SQL no banco isolado, SQL no Supabase conectado e teste real ponta a ponta com contas confirmadas.
