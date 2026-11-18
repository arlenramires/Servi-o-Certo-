# Entrega: bloqueio de duplo envio do pedido de serviço

Data local: 18/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `e008915b4f25c3bb14678c89b39bedbd4a703e89`  
CI da base: execução #289 (`44396826375`), concluída com sucesso  
Commit funcional: `3c9f93c9cff2e6282f247f169372056087eaad47`  
CI do commit funcional: execução #290 (`44406604385`), concluída com sucesso

## Funcionalidade entregue

O formulário principal de solicitação agora descarta um segundo evento de envio enquanto o primeiro pedido ainda aguarda resposta.

- o botão **Solicitar profissional** fica indisponível desde o início da operação;
- um segundo `submit` simultâneo não inicia outra inserção;
- a resposta bem-sucedida continua limpando os campos transitórios e atualizando a lista;
- somente um pedido aberto aparece para o cliente;
- nenhuma cobrança, publicação ou aprovação é executada.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "client double submit creates only one service request"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos mantiveram o botão ocupado, produziram exatamente uma chamada `insert`, criaram um único pedido e atualizaram a lista autorizada.
3. `npm run test:all`: 483/483 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 470/470 testes Playwright, desktop e viewport Android.

## Problema de runtime resolvido

O Chromium não estava presente após `npm ci`, portanto a primeira execução dirigida não chegou ao produto. O CDN primário entregou arquivo vazio e o espelho secundário autorizado instalou Chromium, FFmpeg e headless shell; depois disso, o cenário dirigido e a suíte completa passaram. Nenhuma alteração de produto foi usada para contornar a ausência.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma aprovação automática foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 16 dias desta entrega. O prazo segue em risco real por dependências externas: proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica e reservar ambiente e contas de homologação sem dados de produção.
