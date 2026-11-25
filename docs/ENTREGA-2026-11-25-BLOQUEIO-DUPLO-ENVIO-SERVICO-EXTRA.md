# Entrega: bloqueio de duplo envio do serviço extra

Data local: 25/11/2026 15:32:39, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `f5cb0fc8c067e2a99101c31c9e72d42a0f7cd99e`  
CI da base: execução #339 (`45673969313`), concluída com sucesso  
Commit funcional: `5bf990f86c3627f9f3ee6cf76d869fd710e81310`  
CI do commit funcional: execução #340 (`45685799717`), concluída com sucesso

## Funcionalidade entregue

O envio de um serviço extra durante a execução agora descarta uma segunda submissão enquanto a primeira chamada ainda aguarda resposta.

- **Enviar extra para aprovação** fica indisponível desde o início da operação;
- um segundo evento de `submit` simultâneo não inicia outra chamada `propose_service_extra`;
- descrição e valor permanecem preenchidos enquanto a resposta está pendente;
- após a confirmação, somente um extra pendente aparece para decisão do cliente;
- a proposta não cria cobrança, pagamento ou repasse.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "provider double submit proposes only one service extra"`;
   - resultado final: 2/2 aprovados, desktop e viewport Android;
   - duas submissões simultâneas preservaram `25,50` e a descrição, produziram exatamente uma RPC e somente um extra após a resposta.
3. `npm run test:all`: 533/533 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 520/520 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #340 concluída com sucesso sobre o commit funcional.

Na primeira execução dirigida, o Chromium 1194 não estava presente no runtime. O navegador e o headless shell foram reinstalados pelo espelho Microsoft autorizado; o teste foi repetido com sucesso e a suíte integral também foi aprovada. A recorrência confirma a necessidade de fixar Playwright/Chromium na imagem de execução.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança, repasse ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 9 dias desta entrega. O risco permanece alto: ainda faltam integrações e homologações externas — proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS automático, LGPD, Android e preparação de produção. Ações necessárias com urgência: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica, reservar ambiente e contas de homologação sem dados de produção e estabilizar a imagem de testes. Não há base para garantir conclusão integral até 04/12 sem essas liberações imediatas.
