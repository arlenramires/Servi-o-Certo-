# Entrega: bloqueio de aceite duplicado do chamado

Data local: 19/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `4acd438a3b16ea1ef7782297fdac00cf0275f271`  
CI da base: execução #309 (`44508065229`), concluída com sucesso  
Commit funcional: `dd0aba6bff084791dea1fbb025cf043128b312dc`  
CI do commit funcional: execução #310 (`44509773386`), concluída com sucesso

## Funcionalidade entregue

O aceite de uma oportunidade pelo prestador agora descarta um segundo evento enquanto a primeira chamada protegida ainda aguarda resposta.

- **Aceitar chamado** e **Não tenho interesse** ficam indisponíveis desde o início da operação;
- um segundo evento simultâneo não inicia outra chamada `accept_request`;
- a oportunidade permanece visível enquanto a resposta está pendente;
- após a confirmação, somente um aceite é registrado e o chamado sai da fila de oportunidades;
- a mesma proteção cobre eventos concorrentes entre aceitar e recusar, sem aprovar profissão ou documento.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "provider double action accepts an opportunity only once"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos bloquearam as duas ações, produziram exatamente uma RPC e removeram a oportunidade somente após a resposta positiva.
3. `npm run test:all`: 503/503 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 490/490 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #310 concluída com sucesso sobre o commit funcional.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança, aprovação de profissão ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 15 dias desta entrega. O prazo segue em risco real por dependências externas: proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica e reservar ambiente e contas de homologação sem dados de produção.
