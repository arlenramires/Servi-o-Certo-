# Entrega: bloqueio de confirmação duplicada de conclusão

Data local: 19/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `fbd51b8ecff47d8bb8610dc424e5da48bf02c0d1`  
CI da base: execução #315 (`44542208640`), concluída com sucesso  
Commit funcional: `ec666350771449d8a02db2621dfea2f9b22fdd22`  
CI do commit funcional: execução #316 (`44558032317`), concluída com sucesso

## Funcionalidade entregue

A confirmação da conclusão pelo cliente agora descarta um segundo evento enquanto a chamada protegida ainda aguarda resposta.

- **Confirmar serviço concluído** fica indisponível desde o início da operação;
- um segundo evento simultâneo não inicia outra chamada `confirm_service_completion`;
- o serviço permanece em andamento e nenhum evento de confirmação aparece enquanto a resposta está pendente;
- após a confirmação, somente um evento `conclusao_confirmada` é registrado e o serviço passa para concluído;
- pagamento e repasse permanecem separados e não são movimentados pela ação.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "client double action confirms completion only once"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos mantiveram o botão bloqueado, produziram exatamente uma RPC e alteraram o estado somente após a resposta.
3. `npm run test:all`: 509/509 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 496/496 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #316 concluída com sucesso sobre o commit funcional.

## Problema de runtime resolvido

O runtime recriado não continha o Chromium `1194`; a primeira execução dirigida não chegou ao produto. O CDN primário entregou arquivos vazios e o espelho secundário autorizado instalou Chromium, FFmpeg e headless shell. O cenário dirigido e a suíte completa passaram depois da instalação, sem alteração de produto para contornar a ausência.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança, repasse ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 15 dias desta entrega. O prazo segue em risco real por dependências externas: proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica e reservar ambiente e contas de homologação sem dados de produção.
