# Entrega: bloqueio de decisão duplicada do reagendamento

Data local: 25/11/2026 11:38:43, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `c86bbb10c22feb744ce60d1c4ae660b397d6684f`  
CI da base: execução #333 (`45615047584`), concluída com sucesso  
Commit funcional: `53b0a217d702d476cb018da8ab3a50b00121f37a`  
CI do commit funcional: execução #334 (`45646881563`), concluída com sucesso

## Funcionalidade entregue

A decisão sobre uma proposta de reagendamento agora descarta ações simultâneas enquanto a primeira chamada ainda aguarda resposta.

- **Aceitar nova data** e **Recusar nova data** ficam indisponíveis juntas desde o início da operação;
- um segundo evento simultâneo não inicia outra chamada `decide_service_reschedule`;
- a proposta permanece pendente e a data original não muda enquanto a resposta está em andamento;
- após a confirmação, somente uma decisão é aplicada e, no aceite, a nova data passa a valer;
- a ação não movimenta pagamento, cobrança ou repasse.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "client double action decides a reschedule only once"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - duas ações simultâneas bloquearam aceitar e recusar, mantiveram a proposta pendente e produziram exatamente uma RPC e uma decisão após a resposta.
3. `npm run test:all`: 527/527 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 514/514 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #334 concluída com sucesso sobre o commit funcional.

O Chromium 1194 não estava presente no runtime. O CDN principal respondeu HTTP 403, mas o espelho autorizado concluiu a instalação; o teste dirigido e a suíte integral foram aprovados. A imagem de execução ainda deve incluir a versão Playwright/Chromium fixada para evitar downloads repetidos.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança, repasse ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 9 dias desta entrega. O risco permanece alto: ainda faltam integrações e homologações externas — proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias com urgência: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica, reservar ambiente e contas de homologação sem dados de produção e estabilizar a imagem de testes. Não há base para garantir conclusão integral até 04/12 sem essas liberações imediatas.
