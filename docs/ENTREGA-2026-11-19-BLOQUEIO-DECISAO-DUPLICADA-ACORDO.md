# Entrega: bloqueio de decisão duplicada no acordo

Data local: 19/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `118bd6e1ef9b4402940da68188bdd6f6c9e278a1`  
CI da base: execução #305 (`44489818837`), concluída com sucesso  
Commit funcional: `ea05485e00ca6b6f2842f20f164913476522d610`  
CI do commit funcional: execução #306 (`44491943919`), concluída com sucesso

## Funcionalidade entregue

A decisão do cliente sobre a versão exata do acordo agora descarta um segundo evento enquanto a primeira operação protegida ainda aguarda resposta.

- **Aceitar esta versão** e **Recusar esta versão** ficam indisponíveis desde o início da decisão;
- um segundo evento simultâneo não inicia outra chamada `decide_service_contract`;
- nenhuma decisão é exibida como concluída antes da resposta;
- após a confirmação, somente um aceite do cliente é registrado para o hash e a versão apresentados;
- o aceite permanece separado do aceite do prestador e não cria pagamento ou cobrança.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "client double action records only one contract acceptance"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos bloquearam as duas ações, produziram exatamente uma RPC e somente um registro de aceite do cliente após a resposta.
3. `npm run test:all`: 499/499 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 486/486 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #306 concluída com sucesso sobre o commit funcional.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 15 dias desta entrega. O prazo segue em risco real por dependências externas: proprietário administrador verificado, revisão jurídica do acordo, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica e reservar ambiente e contas de homologação sem dados de produção.
