# Entrega — bloqueio de atualização duplicada do horário preferido do pedido

**Data e hora local:** 26/11/2026 04:10:26 (America/Boa_Vista, UTC-4)

## Resultado funcional

Ao corrigir o horário preferido de um pedido ainda aberto, o botão agora permanece bloqueado durante `set_open_request_schedule`. Um segundo evento é descartado, o valor corrigido permanece no campo e somente uma atualização chega ao serviço.

O cartão conserva o horário anterior — ou a ausência de preferência — até a resposta e passa a exibir a nova preferência somente após a confirmação. Nenhuma outra informação do pedido é modificada.

## Alteração

- `auth-teste/app.js`: guarda contra nova ação enquanto o botão de horário está bloqueado.
- `tests/ui/mock-supabase.js`: atraso controlável da RPC de horário para reproduzir concorrência sem acessar produção.
- `tests/ui/flows.spec.js`: cenário funcional em desktop e viewport Android que dispara dois eventos, comprova um único RPC, preserva o campo e verifica a atualização do cartão apenas após a resposta.

## Evidências

- Base relida antes da escrita: `b20021840d5c534efa21f71d040bf4e2cdb314bf`.
- Commit funcional: `789b2bea8d86ac434bf223036899b30ef7827af2`.
- Instalação limpa: `npm ci --ignore-scripts` concluído.
- Cenário dirigido: 2/2 aprovados (desktop e Android).
- Validação local: `npm run test:all` aprovado, com 13 testes Node/PostgreSQL e 538 testes Playwright — 551 no total.
- CI funcional #358: aprovado em 2m33s — https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45758592011.
- O Chromium removido pelo `npm ci` foi reinstalado no runtime isolado e os testes foram repetidos com sucesso; o problema de execução ficou resolvido.

## Limites e preservação

- Nenhuma migração ou alteração foi aplicada ao banco de produção.
- Nenhum deploy, cobrança, pagamento, aprovação de documento/profissão ou concessão administrativa foi executado.
- `main`, a versão pública, o catálogo das 82 profissões e a identidade azul e branca não foram alterados.
- O teste de UI usa a API controlada local; os testes PostgreSQL usam banco isolado. Esta rodada não equivale à homologação ponta a ponta com contas reais confirmadas.

## Prazo e risco

A meta do proprietário permanece 04/12/2026, a oito dias desta entrega. O risco de atraso é alto porque gateway sandbox, homologação conectada com contas confirmadas, proprietário administrativo verificado, e-mails/notificações, LGPD, Android e preparação de produção ainda dependem de integrações ou decisões externas. A entrega reduz um risco concreto de duplicidade no caminho principal, mas não torna o projeto integralmente homologado.
