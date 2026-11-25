# Entrega — bloqueio de duplo envio da resposta à contestação

**Data e hora local:** 25/11/2026 19:02:44 (America/Boa_Vista, UTC-4)

## Resultado funcional

O formulário de manifestação da outra parte agora permanece bloqueado enquanto `respond_service_dispute` está em andamento. Um segundo evento de envio é descartado, o relato permanece preenchido até a resposta e somente uma manifestação é registrada na contestação privada.

A contestação continua explicitamente pendente de análise administrativa. A entrega não toma decisão, não aprova documento ou profissão, não concede administrador e não cria pagamento, cobrança, estorno ou repasse.

## Alteração

- `auth-teste/disputes.js`: guarda de operação em andamento, referência estável à contestação e liberação segura do botão ao final.
- `tests/ui/mock-supabase.js`: atraso controlado e isolado para observar o estado intermediário da manifestação.
- `tests/ui/flows.spec.js`: cenário de duplo envio que prova uma única chamada, contestação ainda aberta antes da resposta, preservação do relato e uma única manifestação ao final.

## Evidências

- Base verificada antes da alteração: `9aa3e63c49ebebddd553f2a051f121569ad64987`.
- CI anterior conferido: [execução #345](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45715789020), concluída com sucesso.
- Commit funcional: [`35081977827a8791cbbfaffe3a1be44efd84ec14`](https://github.com/arlenramires/Servi-o-Certo-/commit/35081977827a8791cbbfaffe3a1be44efd84ec14).
- `npm ci --ignore-scripts`: concluído com sucesso.
- Teste dirigido da nova proteção: 2/2 aprovados após correção do runtime.
- `npm run test:all`: 539/539 aprovados (13 testes Node/PostgreSQL e 526 testes Playwright).
- CI do commit funcional: [execução #346](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45717710052), concluída com sucesso.

O teste dirigido inicialmente não executou porque o Chromium havia desaparecido novamente do runtime. O navegador foi reinstalado pelo espelho autorizado da Microsoft e o teste foi repetido com sucesso. A recorrência da ausência da imagem permanece um risco operacional e consome tempo de cada rodada.

## Isolamento e preservação

Os testes de interface usaram o contrato controlado do navegador e os testes de dados permaneceram no PostgreSQL isolado da suíte. Nenhuma migração foi aplicada ao banco de produção, nenhuma publicação foi feita e nenhuma cobrança real foi criada. A `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.

## Prazo e risco

Restam 9 dias corridos até a meta de 04/12/2026. O risco de atraso permanece alto: a homologação integral ainda depende de contas confirmadas, administração com proprietário verificado, revisão jurídica e integrações externas, especialmente pagamento em sandbox autorizado. A meta não foi alterada e esta entrega não representa conclusão ponta a ponta do produto.
