# Entrega — bloqueio de decisão duplicada da vistoria

**Data e hora local:** 25/11/2026 21:40:07 (America/Boa_Vista, UTC-4)

## Resultado funcional

Ao aceitar ou recusar uma proposta de vistoria, as duas opções agora ficam bloqueadas durante `decide_service_inspection`. Um segundo evento, inclusive conflitante, é descartado e somente uma decisão chega ao serviço.

No cenário validado, a proposta permanece pendente até a resposta e então muda uma única vez para aceita com pagamento e confirmação ainda pendentes. Nenhum agendamento é confirmado e nenhum pagamento, cobrança, estorno ou repasse é criado.

## Alteração

- `auth-teste/inspections.js`: guarda no manipulador de decisão antes de qualquer chamada remota.
- `tests/ui/mock-supabase.js`: atraso controlado e isolado para observar a proposta ainda pendente.
- `tests/ui/flows.spec.js`: cenário que dispara aceitar e recusar em sequência, prova uma única chamada e confirma uma única transição ao final.

## Evidências

- Base verificada antes da alteração: `3a738ce007c452e5e2165369dbffc023f22d5e42`.
- CI anterior conferido: [execução #349](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45728580575), concluída com sucesso.
- Commit funcional: [`2d4eb40aec31f4e2357b266c2cd9029eb355d283`](https://github.com/arlenramires/Servi-o-Certo-/commit/2d4eb40aec31f4e2357b266c2cd9029eb355d283).
- `npm ci --ignore-scripts`: concluído com sucesso.
- Teste dirigido da nova proteção: 2/2 aprovados.
- `npm run test:all`: 543/543 aprovados (13 testes Node/PostgreSQL e 530 testes Playwright).
- CI do commit funcional: [execução #350](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45736966733), concluída com sucesso.

O Chromium foi restaurado pelo espelho autorizado da Microsoft após a instalação limpa, conforme o problema operacional recorrente já registrado. Não houve nova falha de código ou CI.

## Isolamento e preservação

Os testes de interface usaram o contrato controlado do navegador e os testes de dados permaneceram no PostgreSQL isolado da suíte. Nenhuma migração foi aplicada ao banco de produção, nenhuma publicação foi feita e nenhuma cobrança real foi criada. A `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.

## Prazo e risco

Restam 9 dias corridos até a meta de 04/12/2026. O risco de atraso permanece alto: pagamento e confirmação de vistorias dependem de gateway sandbox, e a homologação integral ainda exige contas confirmadas, proprietário verificado, revisão jurídica e integrações externas. A meta não foi alterada e esta entrega não representa conclusão ponta a ponta do produto.
