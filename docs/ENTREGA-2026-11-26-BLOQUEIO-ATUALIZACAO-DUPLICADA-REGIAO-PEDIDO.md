# Entrega — bloqueio de atualização duplicada da região do pedido

**Data e hora local:** 26/11/2026 00:42:20 (America/Boa_Vista, UTC-4)

## Resultado funcional

Ao corrigir cidade e UF de um pedido ainda aberto, o botão agora permanece bloqueado durante `set_open_request_location`. Um segundo evento é descartado, os valores corrigidos permanecem nos campos e somente uma atualização chega ao serviço.

O cartão conserva a região anterior até a resposta e passa a exibir a nova cidade e UF somente após a confirmação. Nenhuma outra informação do pedido é modificada.

## Alteração

- `auth-teste/app.js`: guarda contra nova ação enquanto o botão de região está bloqueado.
- `tests/ui/mock-supabase.js`: atraso controlado e isolado antes da mutação de cidade e UF.
- `tests/ui/flows.spec.js`: cenário de duplo evento que prova uma única chamada, preservação dos valores e atualização visual somente após a resposta.

## Evidências

- Base verificada antes da alteração: `acdedf546534089401b769af8552de1bc35588b0`.
- CI anterior conferido: [execução #355](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45747757192), concluída com sucesso.
- Commit funcional: [`93bd6f32db9d9d29ceabaa540ac9e212f65094ab`](https://github.com/arlenramires/Servi-o-Certo-/commit/93bd6f32db9d9d29ceabaa540ac9e212f65094ab).
- `npm ci --ignore-scripts`: concluído com sucesso.
- Teste dirigido da nova proteção: 4/4 aprovados nos viewports desktop e Android.
- `npm run test:all`: 549/549 aprovados (13 testes Node/PostgreSQL e 536 testes Playwright).
- CI do commit funcional: [execução #356](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45756635178), concluída com sucesso.

Após a instalação limpa, a primeira execução dirigida encontrou apenas a ausência local do Chromium. O navegador foi restaurado pelo espelho autorizado e tanto o teste dirigido quanto a suíte completa passaram; não houve falha de código ou CI.

## Isolamento e preservação

Os testes de interface usaram o contrato controlado do navegador e os testes de dados permaneceram no PostgreSQL isolado da suíte. Nenhuma migração foi aplicada ao banco de produção, nenhuma publicação foi feita e nenhuma cobrança real foi criada. A `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.

## Prazo e risco

Restam 8 dias corridos até a meta de 04/12/2026. O risco de atraso permanece alto: homologação com contas confirmadas, proprietário verificado, revisão jurídica e pagamentos em sandbox autorizado continuam no caminho crítico. A meta não foi alterada e esta entrega não representa conclusão ponta a ponta do produto.
