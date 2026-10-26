# Entrega — foco no serviço aberto por link autenticado

Horário da validação: 26/10/2026, 05:23:13 (America/Boa_Vista).

## Resultado funcional

- Após o login, o cartão autorizado identificado por `?servico=` recebe foco visual e de teclado.
- A mensagem de estado confirma que o serviço do link foi localizado.
- O foco ocorre apenas uma vez e não interrompe atualizações posteriores da lista.
- Um código indisponível continua sem revelar se o serviço existe em outra conta.
- A ação não realiza consulta adicional nem altera o pedido.

## Evidências

- `npm ci --ignore-scripts`: concluído sem erro.
- Teste dirigido: 2/2 aprovados (desktop e Android).
- `npm run test:all`: 253/253 aprovados — 13 testes de domínio/PostgreSQL e 240 testes de interface.
- O teste confirma o foco único, a mensagem de localização, a preservação integral do pedido e a ausência de mutação.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade e segurança

A entrega não altera Supabase Auth, RLS, esquema, migrações ou consultas ao banco. O link continua exibindo somente serviços autorizados para a conta participante.

## Arquivos alterados

- `auth-teste/app.js`
- `auth-teste/style.css`
- `tests/ui/deep-link-focus.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-26-FOCO-SERVICO-LINK-AUTENTICADO.md`
