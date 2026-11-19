# Entrega: bloqueio de andamento duplicado do serviço

Data local: 19/11/2026 16:25:46, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `95e61f894c19f82a9c564c581a8fe0cb3fda0443`  
CI da base: execução #323 (`44599061029`), concluída com sucesso  
Commit funcional: `652b68bc9aca4d873b4605b40f88aa4c2ced051d`  
CI do commit funcional: execução #324 (`44608041150`), concluída com sucesso

## Funcionalidade entregue

O registro percentual do andamento agora descarta um segundo evento enquanto a primeira chamada ainda aguarda resposta.

- **Registrar andamento** fica indisponível desde o início da operação;
- um segundo evento simultâneo não inicia outra chamada `add_service_progress_update`;
- percentual e resumo permanecem preenchidos enquanto a resposta está pendente;
- após a confirmação, somente uma atualização aparece na linha do tempo do cliente e do prestador;
- a ação não movimenta pagamento, cobrança ou repasse.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "provider double action registers only one service progress update"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos mantiveram o botão bloqueado, preservaram o resumo e produziram exatamente uma RPC e uma atualização.
3. `npm run test:all`: 517/517 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 504/504 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #324 concluída com sucesso sobre o commit funcional.

O Chromium 1194 voltou a faltar no início desta rodada porque a instalação anterior não persistiu no runtime. O navegador foi recuperado pelo espelho autorizado após o CDN principal devolver arquivos vazios; o teste dirigido e a suíte integral foram repetidos e aprovados. Ação operacional recomendada: disponibilizar a versão Playwright/Chromium fixada na imagem de execução para evitar downloads repetidos e reduzir risco de atraso nas validações.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança, repasse ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 15 dias desta entrega. O prazo segue em risco real pelas integrações e homologações restantes: proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. A recorrência da instalação do navegador também consome tempo de cada rodada, embora não bloqueie o desenvolvimento. Ações necessárias: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica, reservar ambiente e contas de homologação sem dados de produção e estabilizar a imagem de testes.
