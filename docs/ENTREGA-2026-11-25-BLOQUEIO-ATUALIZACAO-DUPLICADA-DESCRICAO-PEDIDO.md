# Entrega — bloqueio de atualização duplicada da descrição do pedido

**Data e hora local:** 25/11/2026 23:13:28 (America/Boa_Vista, UTC-4)

## Resultado funcional

Ao corrigir a descrição de um pedido ainda aberto, o botão agora permanece bloqueado durante `set_open_request_description`. Um segundo evento é descartado, o texto corrigido permanece no campo e somente uma atualização chega ao serviço.

O cartão conserva a descrição anterior até a resposta e passa a exibir o novo texto somente após a confirmação. Nenhuma outra informação do pedido é modificada.

## Alteração

- `auth-teste/app.js`: guarda contra nova ação enquanto o botão de descrição está bloqueado.
- `tests/ui/mock-supabase.js`: atraso controlado e isolado antes da mutação da descrição.
- `tests/ui/flows.spec.js`: cenário de duplo evento que prova uma única chamada, preservação do texto e atualização visual somente após a resposta.

## Evidências

- Base verificada antes da alteração: `a063c3ec17c087276cf7ac4a05e8fd2b2f41d2b9`.
- CI anterior conferido: [execução #353](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45746193361), concluída com sucesso.
- Commit funcional: [`0bb473d3ef3ac848d2af4b7a9c1244e723d94167`](https://github.com/arlenramires/Servi-o-Certo-/commit/0bb473d3ef3ac848d2af4b7a9c1244e723d94167).
- `npm ci --ignore-scripts`: concluído com sucesso.
- Teste dirigido da nova proteção: 2/2 aprovados.
- `npm run test:all`: 547/547 aprovados (13 testes Node/PostgreSQL e 534 testes Playwright).
- CI do commit funcional: [execução #354](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45747191064), concluída com sucesso.

O runtime local voltou a operar normalmente nesta rodada. O Chromium foi restaurado pelo espelho autorizado após a instalação limpa; não houve falha de código ou CI.

## Isolamento e preservação

Os testes de interface usaram o contrato controlado do navegador e os testes de dados permaneceram no PostgreSQL isolado da suíte. Nenhuma migração foi aplicada ao banco de produção, nenhuma publicação foi feita e nenhuma cobrança real foi criada. A `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.

## Prazo e risco

Restam 9 dias corridos até a meta de 04/12/2026. O risco de atraso permanece alto: homologação com contas confirmadas, proprietário verificado, revisão jurídica e pagamentos em sandbox autorizado continuam no caminho crítico. A meta não foi alterada e esta entrega não representa conclusão ponta a ponta do produto.
