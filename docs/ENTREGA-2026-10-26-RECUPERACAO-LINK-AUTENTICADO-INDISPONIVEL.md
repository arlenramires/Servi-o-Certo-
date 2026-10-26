# Entrega — recuperação de link autenticado indisponível

Horário da validação: 26/10/2026 às 08:22:03 (America/Boa_Vista).

## Resultado funcional

- Quando `?servico=` não corresponde a um pedido autorizado, a mensagem permanece neutra.
- O estado vazio oferece **Ver todos os serviços** para remover o código do endereço e restaurar a lista autorizada.
- A interface não mostra o código indisponível nem informa se ele existe para outra conta.
- Nenhum pedido é alterado.

## Evidências

- `npm ci --ignore-scripts`: aprovado.
- Teste dirigido do novo fluxo e da proteção legada: 10/10 cenários aprovados em desktop e viewport Android.
- `npm run test:all`: 257/257 testes aprovados — 13 testes Node/PostgreSQL e 244 testes Playwright.
- O Chromium isolado estava ausente após a instalação limpa; foi reinstalado e todas as validações foram repetidas com sucesso.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade e segurança

A entrega não altera Supabase Auth, RLS, esquema, migrações ou consultas. A recuperação reutiliza somente a lista já autorizada para a conta participante.

## Arquivos alterados

- `auth-teste/app.js`
- `tests/ui/deep-link-focus.spec.js`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-26-RECUPERACAO-LINK-AUTENTICADO-INDISPONIVEL.md`
