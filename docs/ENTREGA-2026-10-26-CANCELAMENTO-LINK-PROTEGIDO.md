# Entrega — cancelamento da abertura de link protegido

Horário da validação: 26/10/2026 às 10:31:16 (America/Boa_Vista).

## Resultado funcional

- O formulário de acesso informa de modo neutro quando foi aberto por um link protegido.
- A pessoa pode cancelar a abertura do link e permanecer no login normal.
- A ação remove somente o parâmetro `?servico=` do endereço, sem autenticar, consultar ou alterar pedidos.
- O identificador do serviço não é exibido no conteúdo da página.

## Evidências

- `npm ci --ignore-scripts`: aprovado.
- Teste dirigido do fluxo de link autenticado: 10/10 cenários aprovados em desktop e viewport Android.
- `npm run test:all`: 261/261 testes aprovados — 13 testes Node/PostgreSQL e 248 testes Playwright.
- O Chromium isolado estava ausente após a instalação limpa; foi reinstalado e todas as validações foram executadas com sucesso.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade e segurança

A entrega atua somente no estado local do endereço e da interface. Não altera Supabase Auth, RLS, esquema, migrações ou consultas.

## Arquivos alterados

- `auth-teste/index.html`
- `auth-teste/app.js`
- `tests/ui/deep-link-focus.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-26-CANCELAMENTO-LINK-PROTEGIDO.md`
