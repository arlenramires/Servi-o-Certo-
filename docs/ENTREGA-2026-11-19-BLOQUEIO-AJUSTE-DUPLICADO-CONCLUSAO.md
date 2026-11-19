# Entrega: bloqueio de ajuste duplicado na conclusão

Data local: 19/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `c44197502ebf0fe407d892bcef526cc392521ab6`  
CI da base: execução #319 (`44568839079`), concluída com sucesso  
Commit funcional: `2bc391d29cf6d4a6782b828197a11015dbc3a296`  
CI do commit funcional: execução #320 (`44570277552`), concluída com sucesso

## Funcionalidade entregue

O pedido de ajuste antes da confirmação da conclusão agora descarta um segundo evento enquanto a primeira chamada ainda aguarda resposta.

- **Solicitar ajuste** fica indisponível desde o início da operação;
- um segundo evento simultâneo não inicia outra chamada `request_completion_adjustment`;
- o texto do ajuste permanece preenchido enquanto a resposta está pendente;
- após a confirmação, somente um ajuste pendente é criado e a conclusão continua bloqueada até a resposta do prestador;
- a ação não movimenta pagamento, cobrança ou repasse.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "client double action requests only one completion adjustment"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos mantiveram o botão bloqueado, preservaram o texto e produziram exatamente uma RPC e um ajuste.
3. `npm run test:all`: 513/513 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 500/500 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #320 concluída com sucesso sobre o commit funcional.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança, repasse ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 15 dias desta entrega. O prazo segue em risco real por dependências externas: proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica e reservar ambiente e contas de homologação sem dados de produção.
