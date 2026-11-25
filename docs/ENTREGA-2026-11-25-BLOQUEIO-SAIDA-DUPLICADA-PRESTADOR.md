# Entrega: bloqueio de saída duplicada do prestador

Data local: 25/11/2026 05:29:28, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `558f9279e9a4d9746ef5f3382e48a85591a32956`  
CI da base: execução #325 (`44608758597`), concluída com sucesso  
Commit funcional: `5449be9ce9e6d436de67f1c287c62523d3317b17`  
CI do commit funcional: execução #326 (`45585503173`), concluída com sucesso

## Funcionalidade entregue

O início do deslocamento do prestador agora descarta um segundo evento enquanto a primeira chamada ainda aguarda resposta.

- **Estou a caminho** fica indisponível desde o início da operação;
- um segundo evento simultâneo não inicia outra chamada `mark_provider_arrival`;
- o serviço permanece no estado anterior enquanto a resposta está pendente;
- após a confirmação, somente um evento `a_caminho` aparece na linha do tempo e os controles de chegada são liberados;
- a ação não movimenta pagamento, cobrança ou repasse.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "provider double action reports the journey start only once"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos mantiveram o botão bloqueado e produziram exatamente uma RPC e um evento `a_caminho` após a resposta.
3. `npm run test:all`: 519/519 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 506/506 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #326 concluída com sucesso sobre o commit funcional.

O Chromium 1194 não estava presente no runtime. O CDN principal respondeu HTTP 403, mas o espelho autorizado concluiu a instalação; o teste dirigido e a suíte integral foram aprovados. A imagem de execução ainda deve incluir a versão Playwright/Chromium fixada para evitar downloads repetidos.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança, repasse ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 9 dias desta entrega. O prazo está em risco alto: a branch ficou sem nova entrega remota entre 19/11 e esta rodada, e ainda restam integrações e homologações externas — proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias com urgência: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica, reservar ambiente e contas de homologação sem dados de produção e estabilizar a imagem de testes. Não há base para garantir conclusão integral até 04/12 sem essas liberações imediatas.
