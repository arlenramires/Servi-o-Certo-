# Entrega: bloqueio de confirmação duplicada da chegada

Data local: 25/11/2026 06:59:13, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `09980b33598903027bc67f9a20f4de068b084048`  
CI da base: execução #329 (`45594825119`), concluída com sucesso  
Commit funcional: `fd84ebd45b8c0a29afccfda005651a89ebd6a5a0`  
CI do commit funcional: execução #330 (`45599696915`), concluída com sucesso

## Funcionalidade entregue

A confirmação da chegada pelo cliente agora descarta uma segunda ação enquanto a primeira chamada ainda aguarda resposta.

- **Confirmar chegada do prestador** fica indisponível desde o início da operação;
- um segundo evento simultâneo não inicia outra chamada `confirm_provider_arrival`;
- o serviço mantém apenas os eventos `a_caminho` e `chegou_local` enquanto a resposta está pendente;
- após a confirmação, somente um evento `chegada_confirmada_cliente` aparece na linha do tempo e o prestador pode iniciar o serviço;
- a ação não movimenta pagamento, cobrança ou repasse.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "client double action confirms provider arrival only once"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - duas ações simultâneas mantiveram o botão bloqueado e produziram exatamente uma RPC e um evento `chegada_confirmada_cliente` após a resposta.
3. `npm run test:all`: 523/523 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 510/510 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #330 concluída com sucesso sobre o commit funcional.

O Chromium 1194 não estava presente no runtime. O CDN principal respondeu HTTP 403, mas o espelho autorizado concluiu a instalação; o teste dirigido e a suíte integral foram aprovados. A imagem de execução ainda deve incluir a versão Playwright/Chromium fixada para evitar downloads repetidos.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança, repasse ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 9 dias desta entrega. O risco permanece alto: ainda faltam integrações e homologações externas — proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias com urgência: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica, reservar ambiente e contas de homologação sem dados de produção e estabilizar a imagem de testes. Não há base para garantir conclusão integral até 04/12 sem essas liberações imediatas.
