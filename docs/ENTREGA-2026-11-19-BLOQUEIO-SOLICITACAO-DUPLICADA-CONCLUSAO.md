# Entrega: bloqueio de solicitação duplicada de conclusão

Data local: 19/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `9219a0b1c1cd698777e0f49b91af54ddb53a4be9`  
CI da base: execução #313 (`44531903156`), concluída com sucesso  
Commit funcional: `75d4aa9a8cff215e62fe5599a48839db2a11e530`  
CI do commit funcional: execução #314 (`44541537950`), concluída com sucesso

## Funcionalidade entregue

A solicitação de confirmação de conclusão pelo prestador agora descarta um segundo evento enquanto a chamada protegida ainda aguarda resposta.

- **Solicitar confirmação de conclusão** fica indisponível desde o início da operação;
- um segundo evento simultâneo não inicia outra chamada `request_service_completion`;
- o serviço permanece em andamento e nenhum evento de conclusão solicitada aparece enquanto a resposta está pendente;
- após a confirmação, somente um evento `conclusao_solicitada` é registrado e o cliente passa a receber a ação de confirmação;
- a ação não movimenta pagamento, cobrança ou repasse.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "provider double action requests completion only once"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos mantiveram o botão bloqueado, produziram exatamente uma RPC e alteraram o estado somente após a resposta.
3. `npm run test:all`: 507/507 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 494/494 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #314 concluída com sucesso sobre o commit funcional.

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
