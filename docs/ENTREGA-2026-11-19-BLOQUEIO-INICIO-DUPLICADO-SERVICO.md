# Entrega: bloqueio de início duplicado do serviço

Data local: 19/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `7284453a89cf21f18725c43b47cd0526ef3e1aa9`  
CI da base: execução #311 (`44510352436`), concluída com sucesso  
Commit funcional: `77954fb9cacf7419bc7022eb6766ff5f7dfd2559`  
CI do commit funcional: execução #312 (`44531233669`), concluída com sucesso

## Funcionalidade entregue

O início do serviço pelo prestador agora descarta um segundo evento enquanto a chamada protegida ainda aguarda resposta.

- **Iniciar serviço** fica indisponível desde o início da operação;
- um segundo evento simultâneo não inicia outra chamada `start_service`;
- o pedido permanece aceito e nenhum evento de início aparece enquanto a resposta está pendente;
- após a confirmação, somente um evento `iniciado` é registrado e a execução passa para em andamento;
- a ação não movimenta pagamento, cobrança ou repasse.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "provider double action starts a service only once"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos mantiveram o botão bloqueado, produziram exatamente uma RPC e alteraram o estado somente após a resposta.
3. `npm run test:all`: 505/505 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 492/492 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #312 concluída com sucesso sobre o commit funcional.

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
