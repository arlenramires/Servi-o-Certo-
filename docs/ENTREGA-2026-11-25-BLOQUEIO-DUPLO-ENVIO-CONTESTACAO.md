# Entrega — bloqueio de duplo envio da contestação

**Data e hora local:** 25/11/2026 18:43:38 (America/Boa_Vista, UTC-4)

## Resultado funcional

O formulário de contestação agora permanece bloqueado enquanto `open_service_dispute` está em andamento. Um segundo evento de envio é descartado, os campos de categoria e relato permanecem preenchidos até a resposta e somente uma contestação privada é criada.

A entrega não toma decisão administrativa, não aprova documento ou profissão, não concede administrador e não cria pagamento, cobrança, estorno ou repasse.

## Alteração

- `auth-teste/disputes.js`: guarda de operação em andamento antes da chamada remota e liberação segura do botão ao final.
- `tests/ui/mock-supabase.js`: atraso controlado e isolado para observar o estado intermediário da abertura.
- `tests/ui/flows.spec.js`: cenário de duplo envio que prova uma única chamada, nenhuma persistência antes da resposta, preservação do formulário e uma única contestação após a conclusão.

## Evidências

- Base verificada antes da alteração: `1299a673625bb9222b386e66e2ef9ee3462d5792`.
- CI anterior conferido: [execução #343](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45700109545), concluída com sucesso.
- Commit funcional: [`eb149c83123ee00bcee54f3ef37cda54e94c3ce0`](https://github.com/arlenramires/Servi-o-Certo-/commit/eb149c83123ee00bcee54f3ef37cda54e94c3ce0).
- `npm ci --ignore-scripts`: concluído com sucesso.
- Teste dirigido da nova proteção: 2/2 aprovados.
- `npm run test:all`: 537/537 aprovados (13 testes Node/PostgreSQL e 524 testes Playwright).
- CI do commit funcional: [execução #344](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45715152968), concluída com sucesso.

O Chromium necessário ao Playwright não estava presente no runtime e foi reinstalado pelo espelho autorizado da Microsoft antes da validação. A recorrência da ausência da imagem permanece um risco operacional, mas não bloqueou esta rodada.

## Isolamento e preservação

Os testes de interface usaram o contrato controlado do navegador e os testes de dados permaneceram no PostgreSQL isolado da suíte. Nenhuma migração foi aplicada ao banco de produção, nenhuma publicação foi feita e nenhuma cobrança real foi criada. A `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.

## Prazo e risco

Restam 9 dias corridos até a meta de 04/12/2026. O risco de atraso é alto porque a homologação integral ainda depende de várias entregas do fluxo principal e de integrações externas, especialmente pagamento em sandbox autorizado e decisões do proprietário. A meta não foi alterada e esta entrega não representa conclusão ponta a ponta do produto.
