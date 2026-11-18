# Entrega: bloqueio de duplo envio da mensagem

Data local: 18/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `0cfa7b5f1fec2013a1727f09e258672985e28d87`  
CI da base: execução #291 (`44407106978`), concluída com sucesso  
Commit funcional: `24849854f2b49e71b4e70d62bd2a33d3e51cc7d5`  
CI do commit funcional: execução #292 (`44415369729`), concluída com sucesso

## Funcionalidade entregue

O formulário de conversa agora descarta um segundo evento de envio enquanto a primeira mensagem ainda aguarda resposta.

- o botão **Enviar mensagem** fica indisponível desde o início da operação;
- um segundo `submit` simultâneo não inicia outra inserção;
- o texto permanece visível enquanto a gravação está pendente;
- após a confirmação, o campo é limpo e a conversa exibe uma única mensagem;
- nenhuma cobrança, aprovação ou alteração de estado do serviço é executada.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "client double submit sends only one service message"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos mantiveram o botão ocupado e o texto preservado, produziram exatamente uma chamada `insert`, gravaram uma única mensagem e atualizaram a conversa autorizada.
3. `npm run test:all`: 485/485 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 472/472 testes Playwright, desktop e viewport Android.

## Problema de runtime resolvido

O Chromium não estava presente após `npm ci`, portanto a primeira execução dirigida não chegou ao produto. O CDN primário entregou arquivo vazio e o espelho secundário autorizado instalou Chromium, FFmpeg e headless shell; depois disso, o cenário dirigido e a suíte completa passaram. Nenhuma alteração de produto foi usada para contornar a ausência.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança ou uso de credenciais privilegiadas.

## Compatibilidade da integração

O changelog oficial foi revisto em 18/11/2026. As mudanças recentes de OIDC, conta, logs, CLI v3, Flutter e cifras TLS não alteram este guardião local de envio nem a versão fixada do cliente usada pelo projeto.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma aprovação automática foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 16 dias desta entrega. O prazo segue em risco real por dependências externas: proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica e reservar ambiente e contas de homologação sem dados de produção.
