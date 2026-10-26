# Entrega — continuidade do link protegido nos e-mails de acesso

Horário da validação: 26/10/2026 às 15:14:16 (America/Boa_Vista).

## Resultado funcional

- O cadastro iniciado por um link protegido envia ao Supabase um retorno que preserva `?servico=` após a confirmação do e-mail.
- A recuperação de senha iniciada pelo mesmo fluxo preserva a referência no e-mail e depois da definição da nova senha.
- O formulário continua sem exibir o identificador do serviço.
- Nenhum pedido é consultado ou alterado antes da autenticação de uma conta participante.

## Evidências

- `npm ci --ignore-scripts`: aprovado.
- Teste dirigido do fluxo de link autenticado: 14/14 cenários aprovados em desktop e viewport Android.
- `npm run test:all`: 265/265 testes aprovados — 13 testes Node/PostgreSQL e 252 testes Playwright.
- O Chromium isolado estava ausente após a instalação limpa; foi reinstalado e todas as validações foram executadas com sucesso.
- Testes executados com API e banco controlados, sem envio real de e-mail, conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade e segurança

A entrega usa as opções oficiais `emailRedirectTo` e `redirectTo` do Supabase Auth. O endereço de retorno continua limitado à origem e ao caminho atuais, acrescentando somente a referência já presente no link protegido.

## Arquivos alterados

- `auth-teste/app.js`
- `tests/ui/deep-link-focus.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-26-CONTINUIDADE-LINK-EMAIL-ACESSO.md`
