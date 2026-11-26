# Entrega — bloqueio de atualização duplicada da profissão do pedido

**Data e hora local:** 25/11/2026 23:00:14 (America/Boa_Vista, UTC-4)

## Resultado funcional

Ao corrigir a profissão de um pedido ainda aberto, o botão agora permanece bloqueado durante `set_open_request_profession`. Um segundo evento é descartado, a nova profissão permanece selecionada e somente uma atualização chega ao serviço.

O cartão mantém a profissão anterior até a resposta e passa a exibir a nova especialidade somente após a confirmação. O catálogo existente não foi alterado e nenhuma profissão foi aprovada automaticamente.

## Alteração

- `auth-teste/app.js`: guarda contra nova ação enquanto o botão de atualização está bloqueado.
- `tests/ui/mock-supabase.js`: atraso controlado e isolado antes da mutação da profissão do pedido.
- `tests/ui/flows.spec.js`: cenário de duplo evento que prova uma única chamada, preservação da seleção e mudança visual somente após a resposta.

## Evidências

- Base verificada antes da alteração: `09985b16994f6ffe8006c885d8593fabf07f211f`.
- CI anterior conferido: [execução #351](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45737396865), concluída com sucesso.
- Commit funcional: [`9ba06ff00ba1cad0be2969dc4835e33604141d5e`](https://github.com/arlenramires/Servi-o-Certo-/commit/9ba06ff00ba1cad0be2969dc4835e33604141d5e).
- `npm ci --ignore-scripts`: concluído com sucesso.
- Teste dirigido da nova proteção: 2/2 aprovados.
- `npm run test:all`: 545/545 aprovados (13 testes Node/PostgreSQL e 532 testes Playwright).
- CI do commit funcional: [execução #352](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45745778139), concluída com sucesso.

A reinstalação recorrente do Chromium ultrapassou a primeira janela de acompanhamento enquanto concluía o download, mas o mesmo processo terminou com sucesso e os testes foram executados normalmente. Não houve falha de código ou CI.

## Isolamento e preservação

Os testes de interface usaram o contrato controlado do navegador e os testes de dados permaneceram no PostgreSQL isolado da suíte. Nenhuma migração foi aplicada ao banco de produção, nenhuma publicação foi feita e nenhuma cobrança real foi criada. A `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.

## Prazo e risco

Restam 9 dias corridos até a meta de 04/12/2026. O risco de atraso permanece alto: homologação com contas confirmadas, proprietário verificado, revisão jurídica e pagamentos em sandbox autorizado continuam no caminho crítico. A meta não foi alterada e esta entrega não representa conclusão ponta a ponta do produto.
