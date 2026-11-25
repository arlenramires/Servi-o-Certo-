# Entrega: bloqueio de atualização duplicada da previsão de chegada

Data local: 25/11/2026 14:18:49, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `e79b00e527f8815064fb9f01366a818d3e0ebfa5`  
CI da base: execução #337 (`45663140811`), concluída com sucesso  
Commit funcional: `10565d1b5793d91f2bb1b98f0065737194b0601c`  
CI do commit funcional: execução #338 (`45673295161`), concluída com sucesso

## Funcionalidade entregue

O registro ou a atualização da previsão manual de chegada agora descarta uma segunda ação enquanto a primeira chamada ainda aguarda resposta.

- **Informar previsão** ou **Atualizar previsão** fica indisponível desde o início da operação;
- um segundo evento simultâneo não inicia outra chamada `set_provider_eta`;
- o intervalo selecionado permanece visível e nenhuma previsão aparece enquanto a resposta está pendente;
- após a confirmação, somente uma previsão é persistida e exibida ao cliente;
- a ação não coleta GPS e não movimenta pagamento, cobrança ou repasse.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "provider double action updates the arrival estimate only once"`;
   - resultado final: 2/2 aprovados, desktop e viewport Android;
   - duas ações simultâneas mantiveram os 45 minutos selecionados, produziram exatamente uma RPC e somente uma previsão após a resposta.
3. `npm run test:all`: 531/531 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 518/518 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #338 concluída com sucesso sobre o commit funcional.

Na primeira execução dirigida, o Chromium 1194 não estava presente no runtime. O navegador e o headless shell foram instalados pelo espelho Microsoft autorizado; o teste foi repetido com sucesso e a suíte integral também foi aprovada. A imagem de execução ainda deve incluir a versão Playwright/Chromium fixada para evitar downloads repetidos.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança, repasse, GPS ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 9 dias desta entrega. O risco permanece alto: ainda faltam integrações e homologações externas — proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS automático, LGPD, Android e preparação de produção. Ações necessárias com urgência: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica, reservar ambiente e contas de homologação sem dados de produção e estabilizar a imagem de testes. Não há base para garantir conclusão integral até 04/12 sem essas liberações imediatas.
