# Entrega — bloqueio de duplo envio da proposta de vistoria

**Data e hora local:** 25/11/2026 20:24:02 (America/Boa_Vista, UTC-4)

## Resultado funcional

O formulário de proposta de vistoria agora permanece bloqueado enquanto `propose_service_inspection` está em andamento. Um segundo evento de envio é descartado, finalidade, data e valor permanecem preenchidos até a resposta e somente uma proposta privada é criada.

A proposta não confirma agendamento nem cria pagamento, cobrança, estorno ou repasse. A confirmação continua condicionada à integração futura com gateway em sandbox autorizado.

## Alteração

- `auth-teste/inspections.js`: guarda de operação em andamento e liberação segura do botão ao final.
- `tests/ui/mock-supabase.js`: atraso controlado e isolado para observar o estado intermediário da proposta.
- `tests/ui/flows.spec.js`: cenário de duplo envio que prova uma única chamada, ausência de persistência antes da resposta, preservação dos três campos e uma única proposta ao final.

## Evidências

- Base verificada antes da alteração: `83e6c070f8cb8dfaae14bf880cd1202594bc0e43`.
- CI anterior conferido: [execução #347](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45718348713), concluída com sucesso.
- Commit funcional: [`63068fba0e3d624980368dd9a01b732aabcbd9f8`](https://github.com/arlenramires/Servi-o-Certo-/commit/63068fba0e3d624980368dd9a01b732aabcbd9f8).
- `npm ci --ignore-scripts`: concluído com sucesso.
- Teste dirigido da nova proteção: 2/2 aprovados.
- `npm run test:all`: 541/541 aprovados (13 testes Node/PostgreSQL e 528 testes Playwright).
- CI do commit funcional: [execução #348](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45728100627), concluída com sucesso.

O Chromium continuou ausente após a instalação limpa e foi reinstalado pelo espelho autorizado da Microsoft antes de repetir o teste dirigido. A recorrência já registrada permanece um risco operacional de tempo, mas não bloqueou a entrega.

## Isolamento e preservação

Os testes de interface usaram o contrato controlado do navegador e os testes de dados permaneceram no PostgreSQL isolado da suíte. Nenhuma migração foi aplicada ao banco de produção, nenhuma publicação foi feita e nenhuma cobrança real foi criada. A `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.

## Prazo e risco

Restam 9 dias corridos até a meta de 04/12/2026. O risco de atraso permanece alto: confirmação/pagamento de vistorias depende do gateway sandbox e a homologação integral ainda exige contas confirmadas, proprietário verificado, revisão jurídica e outras integrações externas. A meta não foi alterada e esta entrega não representa conclusão ponta a ponta do produto.
