# Entrega: bloqueio de retirada duplicada do reagendamento

Data local: 25/11/2026 13:16:33, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `719e8c5a0f4ddf5780434a54e9535edb16a2542e`  
CI da base: execução #335 (`45647675208`), concluída com sucesso  
Commit funcional: `9dc9bca82bc7c690ec6f5623e9344b51ac6b67fe`  
CI do commit funcional: execução #336 (`45662409603`), concluída com sucesso

## Funcionalidade entregue

A retirada da própria proposta pendente de reagendamento agora descarta uma segunda ação enquanto a primeira chamada ainda aguarda resposta.

- **Retirar proposta** fica indisponível desde o início da operação;
- um segundo evento simultâneo não inicia outra chamada `cancel_service_reschedule`;
- a proposta permanece pendente e o deslocamento continua bloqueado enquanto a resposta está em andamento;
- após a confirmação, somente uma retirada é registrada e o fluxo anterior de deslocamento é liberado;
- a ação não movimenta pagamento, cobrança ou repasse.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "proposer double action withdraws a reschedule only once"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - duas ações simultâneas mantiveram a proposta pendente, preservaram o bloqueio do deslocamento e produziram exatamente uma RPC e uma retirada após a resposta.
3. `npm run test:all`: 529/529 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 516/516 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #336 concluída com sucesso sobre o commit funcional.

O Chromium 1194 não estava presente no runtime. O CDN principal respondeu HTTP 403, mas o espelho Microsoft autorizado concluiu a instalação; o teste dirigido e a suíte integral foram aprovados. A imagem de execução ainda deve incluir a versão Playwright/Chromium fixada para evitar downloads repetidos.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança, repasse ou uso de credenciais privilegiadas.

## Incidente resolvido

Na rodada anterior, quatro tentativas protegidas de atualizar a branch falharam por um timeout e erros GraphQL do conector GitHub. Nesta rodada, o HEAD foi relido e permaneceu em `719e8c5a0f4ddf5780434a54e9535edb16a2542e`; a atualização foi repetida com esse `expected_sha`, sem force push, e concluída com sucesso.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 9 dias desta entrega. O risco permanece alto: ainda faltam integrações e homologações externas — proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias com urgência: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica, reservar ambiente e contas de homologação sem dados de produção e estabilizar a imagem de testes. Não há base para garantir conclusão integral até 04/12 sem essas liberações imediatas.
