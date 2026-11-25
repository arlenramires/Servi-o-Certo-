# Entrega: bloqueio de chegada duplicada do prestador

Data local: 25/11/2026 06:24:07, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `5fd84cfab40fd3107a20dd6939d7e00906e69590`  
CI da base: execução #327 (`45586060838`), concluída com sucesso  
Commit funcional: `6e10a529b89cdeca89d137dfd5686ca325d7c4b9`  
CI do commit funcional: execução #328 (`45594205234`), concluída com sucesso

## Funcionalidade entregue

A confirmação de chegada do prestador agora descarta uma segunda ação enquanto a primeira chamada ainda aguarda resposta.

- **Cheguei ao local** fica indisponível desde o início da operação;
- um segundo evento simultâneo não inicia outra chamada `mark_provider_arrival`;
- o serviço permanece no estado **a caminho** enquanto a resposta está pendente;
- após a confirmação, somente um evento `chegou_local` aparece na linha do tempo e o cliente passa a ver a chegada pendente de confirmação;
- a ação não movimenta pagamento, cobrança ou repasse.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "provider double action reports the local arrival only once"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - duas ações simultâneas mantiveram o botão bloqueado e produziram exatamente uma RPC e um evento `chegou_local` após a resposta.
3. `npm run test:all`: 521/521 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 508/508 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #328 concluída com sucesso sobre o commit funcional.

O Chromium 1194 não estava presente no runtime. O CDN principal respondeu HTTP 403, mas o espelho autorizado concluiu a instalação; o teste dirigido e a suíte integral foram aprovados. A imagem de execução ainda deve incluir a versão Playwright/Chromium fixada para evitar downloads repetidos.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança, repasse ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 9 dias desta entrega. O risco permanece alto: ainda faltam integrações e homologações externas — proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias com urgência: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica, reservar ambiente e contas de homologação sem dados de produção e estabilizar a imagem de testes. Não há base para garantir conclusão integral até 04/12 sem essas liberações imediatas.
