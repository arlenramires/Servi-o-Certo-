# Entrega — contenção do limite geral no reenvio de confirmação

Data da validação: 29/10/2026 11:23:33 (America/Boa_Vista)

## Entrega funcional

O reenvio do e-mail de confirmação agora contém o limite geral de requisições do Supabase Auth:

- `over_request_rate_limit` orienta aguardar alguns minutos;
- a referência interna do e-mail pendente é descartada e o botão de reenvio é ocultado após a recusa;
- novas ativações na mesma abertura não repetem `resend()`;
- a conta e o espaço privado permanecem fechados;
- uma eventual referência protegida é preservada sem exibir seu código.

Não houve mudança de banco, migração, configuração de Auth ou envio de e-mail real.

## Referências verificadas

O catálogo oficial atual descreve `over_request_rate_limit` como excesso de requisições do cliente/IP e orienta tentar novamente depois de alguns minutos. A documentação de limites inclui `/auth/v1/resend` no limite por IP e informa que excedê-lo produz HTTP 429. O changelog de Auth e as mudanças incompatíveis vigentes foram revisados; nenhuma alteração aplicável exige adaptação adicional deste fluxo.

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/guides/auth/rate-limits
- https://supabase.com/changelog?tags=auth

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Testes dirigidos Playwright, desktop e viewport Android: **2/2 aprovados**.
3. `npm run test:all`: **373/373 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 360 testes Playwright com API controlada.
4. O primeiro teste dirigido não iniciou porque o `npm ci` removeu o Chromium do cache. `npx playwright install chromium` recuperou o navegador pelo espelho secundário após o CDN primário devolver arquivos vazios; os testes dirigidos e a suíte completa passaram depois disso.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhum e-mail real, cobrança, pagamento, aprovação de documento/profissão ou privilégio administrativo foi criado.
- A homologação com contas confirmadas e SMTP configurado continua dependendo de ambiente e credenciais autorizados.
