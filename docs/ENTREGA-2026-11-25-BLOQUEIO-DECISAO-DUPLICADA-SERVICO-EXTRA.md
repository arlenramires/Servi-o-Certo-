# Entrega: bloqueio de decisão duplicada do serviço extra

Data local: 25/11/2026 16:58:32, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `e76084c5b5100f4723f8976e25edc95f6c808466`  
CI da base: execução #341 (`45686350251`), concluída com sucesso  
Commit funcional: `37d0e7b65ef687bea874f8052e168f1fd1633b14`  
CI do commit funcional: execução #342 (`45699533445`), concluída com sucesso

## Funcionalidade entregue

A decisão do cliente sobre um serviço extra pendente agora descarta ações simultâneas enquanto a primeira chamada ainda aguarda resposta.

- **Aceitar serviço extra** e **Recusar serviço extra** ficam indisponíveis juntas desde o início da operação;
- um segundo evento simultâneo não inicia outra chamada `decide_service_extra`;
- o extra permanece proposto enquanto a resposta está pendente;
- após a confirmação, somente uma decisão é aplicada e exibida;
- o aceite registra a decisão, mas não cria cobrança, pagamento ou repasse.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "client double action decides a service extra only once"`;
   - resultado final: 2/2 aprovados, desktop e viewport Android;
   - aceitar e recusar simultaneamente bloquearam as duas ações, mantiveram o extra proposto e produziram exatamente uma RPC e um aceite após a resposta.
3. `npm run test:all`: 535/535 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 522/522 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #342 concluída com sucesso sobre o commit funcional.

O Chromium 1194 não estava presente no início da rodada. O navegador e o headless shell foram reinstalados pelo espelho Microsoft autorizado; o teste dirigido e a suíte integral foram aprovados. A recorrência mantém aberta a necessidade de fixar Playwright/Chromium na imagem de execução.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança, repasse ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 9 dias desta entrega. O risco permanece alto: ainda faltam integrações e homologações externas — proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS automático, LGPD, Android e preparação de produção. Ações necessárias com urgência: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica, reservar ambiente e contas de homologação sem dados de produção e estabilizar a imagem de testes. Não há base para garantir conclusão integral até 04/12 sem essas liberações imediatas.
