# Entrega — troca de conta no link autenticado indisponível

Horário da validação: 26/10/2026 às 09:44:39 (America/Boa_Vista).

## Resultado funcional

- Quando o serviço do link não está disponível para a conta autenticada, o estado neutro oferece **Entrar com outra conta**.
- A ação encerra a sessão atual e retorna ao formulário de acesso.
- O parâmetro `?servico=` permanece no endereço para que a próxima conta tente abrir exatamente o mesmo serviço.
- O código não é exibido no conteúdo da página e nenhum pedido é alterado.

## Evidências

- `npm ci --ignore-scripts`: aprovado.
- Teste dirigido do fluxo de link autenticado: 8/8 cenários aprovados em desktop e viewport Android.
- `npm run test:all`: 259/259 testes aprovados — 13 testes Node/PostgreSQL e 246 testes Playwright.
- O Chromium isolado estava ausente após a instalação limpa; foi reinstalado e todas as validações foram executadas com sucesso.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade e segurança

A entrega usa somente o encerramento normal da sessão Supabase e mantém a autorização dependente da conta que entrar em seguida. Não altera Auth, RLS, esquema, migrações ou consultas.

## Arquivos alterados

- `auth-teste/app.js`
- `tests/ui/deep-link-focus.spec.js`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-26-TROCA-CONTA-LINK-AUTENTICADO.md`
