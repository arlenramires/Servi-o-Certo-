# Entrega: bloqueio de duplo envio do acordo

Data local: 19/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `4f5543dfb6a8dbf6731ee82d803ad59bfce59aba`  
CI da base: execução #303 (`44480359675`), concluída com sucesso  
Commit funcional: `58a0867e7422a30bebc79f3d7059c820d019c807`  
CI do commit funcional: execução #304 (`44489187689`), concluída com sucesso

## Funcionalidade entregue

O formulário usado pelo prestador para propor uma versão do acordo agora descarta um segundo evento de envio enquanto a operação protegida ainda aguarda resposta.

- o botão **Propor acordo** fica indisponível desde o início da operação;
- um segundo `submit` simultâneo não inicia outra chamada `propose_service_contract`;
- datas, responsabilidades e etapas permanecem preenchidas enquanto a resposta está pendente;
- após a confirmação, somente a versão 1 do acordo é criada;
- nenhum aceite automático, pagamento ou cobrança é criado.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "provider double submit creates only one contract version"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos mantiveram o botão ocupado e o rascunho visível, produziram exatamente uma RPC e um acordo na versão 1.
3. `npm run test:all`: 497/497 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 484/484 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #304 concluída com sucesso sobre o commit funcional.

## Problema de runtime resolvido

O Chromium não estava presente após `npm ci`, portanto a primeira execução dirigida não chegou ao produto. O CDN primário entregou arquivos vazios e o espelho secundário autorizado instalou Chromium, FFmpeg e headless shell; depois disso, o cenário dirigido e a suíte completa passaram. Nenhuma alteração de produto foi usada para contornar a ausência.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança ou uso de credenciais privilegiadas.

## Compatibilidade da integração

O changelog oficial do Supabase foi revisto em 19/11/2026. As mudanças recentes de OIDC, CLI v3, Flutter v3 e cifras TLS não alteram este guardião local do formulário nem a RPC versionada usada pelo projeto. Nenhuma migração ou mudança de API foi necessária.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 15 dias desta entrega. O prazo segue em risco real por dependências externas: proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica e reservar ambiente e contas de homologação sem dados de produção.
