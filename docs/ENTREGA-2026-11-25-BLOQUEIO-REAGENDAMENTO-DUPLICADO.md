# Entrega: bloqueio de reagendamento duplicado

Data local: 25/11/2026 08:33:16, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `429f5c5412d98fdbe476e553a50a9134713b4d7f`  
CI da base: execução #331 (`45600316336`), concluída com sucesso  
Commit funcional: `8423154c77305b0a9cf0511db65c1614af74f481`  
CI do commit funcional: execução #332 (`45614235120`), concluída com sucesso

## Funcionalidade entregue

A proposta de reagendamento antes do deslocamento agora descarta uma segunda ação enquanto a primeira chamada ainda aguarda resposta.

- **Propor reagendamento** fica indisponível desde o início da operação;
- um segundo evento simultâneo não inicia outra chamada `propose_service_reschedule`;
- a nova data e o motivo permanecem preenchidos enquanto a resposta está pendente;
- após a confirmação, somente uma proposta pendente aparece para decisão da outra parte;
- a ação não movimenta pagamento, cobrança ou repasse.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "provider double action proposes a reschedule only once"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - duas ações simultâneas mantiveram o botão bloqueado, preservaram o motivo e produziram exatamente uma RPC e uma proposta após a resposta.
3. `npm run test:all`: 525/525 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 512/512 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #332 concluída com sucesso sobre o commit funcional.

O Chromium 1194 não estava presente no runtime. O CDN principal respondeu HTTP 403, mas o espelho autorizado concluiu a instalação; o teste dirigido e a suíte integral foram aprovados. A imagem de execução ainda deve incluir a versão Playwright/Chromium fixada para evitar downloads repetidos.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança, repasse ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 9 dias desta entrega. O risco permanece alto: ainda faltam integrações e homologações externas — proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias com urgência: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica, reservar ambiente e contas de homologação sem dados de produção e estabilizar a imagem de testes. Não há base para garantir conclusão integral até 04/12 sem essas liberações imediatas.
