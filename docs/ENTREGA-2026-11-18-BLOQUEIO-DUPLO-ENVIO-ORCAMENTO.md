# Entrega: bloqueio de duplo envio do orçamento

Data local: 18/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `ed8ba5bb11be76ec0b16478bb4e95bd586e1a33a`  
CI da base: execução #293 (`44415851130`), concluída com sucesso  
Commit funcional: `ea0a2865e4bac87716984d9f74d827b83e24ce3a`  
CI do commit funcional: execução #294 (`44430300177`), concluída com sucesso

## Funcionalidade entregue

O formulário do prestador agora descarta um segundo evento de envio enquanto o primeiro orçamento ainda aguarda resposta.

- o botão **Enviar orçamento** fica indisponível desde o início da operação;
- um segundo `submit` simultâneo não inicia outra inserção;
- valor e escopo permanecem visíveis enquanto a gravação está pendente;
- após a confirmação, os campos são limpos e a conversa exibe uma única proposta;
- nenhuma cobrança, decisão do cliente ou aceite automático é executado.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "provider double submit sends only one service quote"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos mantiveram o botão ocupado, preservaram valor e escopo, produziram exatamente uma chamada `insert`, gravaram uma única proposta de R$ 125,50 e atualizaram a conversa autorizada.
3. `npm run test:all`: 487/487 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 474/474 testes Playwright, desktop e viewport Android.

## Problema de runtime resolvido

O Chromium não estava presente após `npm ci`, portanto a primeira execução dirigida não chegou ao produto. O CDN primário entregou arquivo vazio e o espelho secundário autorizado instalou Chromium, FFmpeg e headless shell; depois disso, o cenário dirigido e a suíte completa passaram. Nenhuma alteração de produto foi usada para contornar a ausência.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança ou uso de credenciais privilegiadas.

## Compatibilidade da integração

O changelog oficial foi revisto em 18/11/2026. As mudanças recentes de OIDC, CLI v3, exposição de novas tabelas na Data API, Flutter e cifras TLS não alteram este guardião local de envio nem a versão fixada do cliente usada pelo projeto.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança ou aprovação automática foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 16 dias desta entrega. O prazo segue em risco real por dependências externas: proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica e reservar ambiente e contas de homologação sem dados de produção.
