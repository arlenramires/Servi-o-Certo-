# Entrega — retorno à lista após abrir link autenticado

Horário da validação: 26/10/2026, 05:53:25 (America/Boa_Vista).

## Resultado funcional

- O cartão localizado por `?servico=` oferece a ação contextual **Ver todos os serviços**.
- A ação remove o código do endereço, limpa o recorte e restaura a lista autorizada completa.
- A mensagem de estado confirma o retorno à lista.
- Nenhuma descrição privada é levada ao URL e nenhum pedido é alterado.

## Evidências

- `npm ci --ignore-scripts`: concluído sem erro.
- Teste dirigido após instalar o Chromium isolado: 4/4 aprovados (desktop e Android).
- `npm run test:all`: 255/255 aprovados — 13 testes de domínio/PostgreSQL e 242 testes de interface.
- O teste confirma a remoção do parâmetro, o retorno à lista completa, a mensagem de estado e a preservação integral dos pedidos.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade e segurança

A entrega não altera Supabase Auth, RLS, esquema, migrações ou consultas ao banco. A lista restaurada permanece limitada aos serviços autorizados para a conta participante.

## Arquivos alterados

- `auth-teste/app.js`
- `tests/ui/deep-link-focus.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-26-RETORNO-LISTA-LINK-AUTENTICADO.md`
