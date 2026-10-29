# Entrega — contenção do limite geral na reautenticação

Data da validação: 29/10/2026 09:12:38 (America/Boa_Vista)

## Entrega funcional

O fluxo de definição de nova senha agora contém o limite geral de requisições do Supabase durante o envio do código de reautenticação:

- `over_request_rate_limit` informa que houve tentativas demais e orienta aguardar alguns minutos;
- a falha é tratada tanto no primeiro `reauthenticate()` quanto no reenvio manual após `otp_expired`;
- a ação de reenvio é consumida antes da chamada e permanece indisponível após a recusa;
- novas submissões na mesma abertura são bloqueadas localmente, sem repetir `updateUser()` ou `reauthenticate()`;
- as senhas são apagadas, o código e o espaço privado permanecem protegidos.

A implementação compartilha o mesmo tratamento nos dois pontos de envio. Não houve mudança de banco, migração, configuração de Auth ou envio de e-mail real.

## Referência verificada

O catálogo oficial atual do Supabase Auth descreve `over_request_rate_limit` como excesso de requisições do cliente ou IP e orienta tentar novamente depois de alguns minutos. A referência de `reauthenticate()` confirma que essa operação envia um nonce à conta autenticada.

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/reference/javascript/auth-reauthenticate

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Testes dirigidos Playwright, desktop e viewport Android: **4/4 aprovados**.
3. `npm run test:all`: **371/371 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 358 testes Playwright com API controlada.
4. O primeiro teste dirigido não iniciou porque o `npm ci` removeu o Chromium do cache. `npx playwright install chromium` recuperou o navegador pelo espelho secundário após o CDN primário devolver arquivos vazios; os testes dirigidos e a suíte completa passaram depois disso.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhum e-mail real, cobrança, pagamento, aprovação de documento/profissão ou privilégio administrativo foi criado.
- A homologação com contas confirmadas e SMTP configurado continua dependendo de ambiente e credenciais autorizados.
