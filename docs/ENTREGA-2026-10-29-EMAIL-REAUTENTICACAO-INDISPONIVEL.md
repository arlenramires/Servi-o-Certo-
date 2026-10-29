# Entrega — contenção de e-mail de reautenticação indisponível

Data da validação: 29/10/2026 08:22:32 (America/Boa_Vista)

## Entrega funcional

O fluxo de definição de nova senha agora contém falhas permanentes ou operacionais no envio do código de reautenticação:

- `email_provider_disabled` informa que o envio do código está temporariamente indisponível;
- `email_address_invalid` e `email_address_not_authorized` orientam procurar suporte, pois o endereço da sessão de recuperação não pode ser trocado na tela;
- a falha é tratada tanto no primeiro `reauthenticate()` quanto no reenvio manual após `otp_expired`;
- a ação de reenvio é consumida antes da chamada e permanece oculta após a recusa;
- novas submissões na mesma abertura são bloqueadas localmente, sem repetir `updateUser()` ou `reauthenticate()`;
- as senhas são apagadas, o código e o espaço privado permanecem protegidos.

A implementação reutiliza um único tratamento para os dois pontos de envio. Não houve mudança de banco, migração, configuração de Auth ou envio de e-mail real.

## Referência verificada

O catálogo oficial atual do Supabase Auth identifica `email_provider_disabled`, `email_address_invalid` e `email_address_not_authorized` como recusas de envio/configuração. A referência de `reauthenticate()` confirma que essa operação envia um nonce ao e-mail ou telefone da conta autenticada.

- https://supabase.com/docs/reference/javascript/auth-reauthenticate
- https://supabase.com/docs/guides/auth/debugging/error-codes

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Testes dirigidos Playwright, desktop e viewport Android: **4/4 aprovados**.
3. `npm run test:all`: **367/367 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 354 testes Playwright com API controlada.
4. O primeiro teste dirigido não iniciou porque o `npm ci` removeu o Chromium do cache. `npx playwright install chromium` recuperou o navegador pelo espelho secundário após o CDN primário devolver um arquivo vazio.
5. A primeira execução funcional revelou que o nonce fictício do teste excedia o `maxlength=20` do campo e era truncado. O dado de teste foi corrigido para respeitar o contrato da interface; os quatro cenários dirigidos e a suíte completa passaram em seguida.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhum e-mail real, cobrança, pagamento, aprovação de documento/profissão ou privilégio administrativo foi criado.
- A homologação com contas confirmadas e SMTP configurado continua dependendo de ambiente e credenciais autorizados.
