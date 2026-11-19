# Entrega: bloqueio de duplo envio na troca de senha

Data local: 19/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `99a2987a171da839669e36a706e6116936e93416`  
CI da base: execução #299 (`44455752958`), concluída com sucesso  
Commit funcional: `9b2544f3f6989770570574bc0f1584dd169f8f26`  
CI do commit funcional: execução #300 (`44461782694`), concluída com sucesso

## Funcionalidade entregue

O formulário protegido de troca de senha agora descarta um segundo evento de envio enquanto a atualização ainda aguarda resposta.

- o botão **Atualizar senha** fica indisponível desde o início da operação;
- um segundo `submit` simultâneo não inicia outra chamada `updateUser`;
- nova senha e confirmação permanecem preenchidas enquanto a resposta está pendente;
- após a confirmação, os campos são apagados e uma única saída global encerra as sessões;
- perfil, função e permissões não são alterados.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "password recovery double submit starts only one update and global signout"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos mantiveram o botão ocupado, preservaram os campos durante a espera, produziram exatamente uma atualização e uma saída global.
3. `npm run test:all`: 493/493 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 480/480 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #300 concluída com sucesso sobre o commit funcional.

## Problema de runtime resolvido

O Chromium não estava presente após `npm ci`, portanto a primeira execução dirigida não chegou ao produto. O CDN primário entregou arquivos vazios e o espelho secundário autorizado instalou Chromium, FFmpeg e headless shell; depois disso, o cenário dirigido e a suíte completa passaram. Nenhuma alteração de produto foi usada para contornar a ausência.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança ou uso de credenciais privilegiadas.

## Compatibilidade da integração

O changelog oficial foi revisto em 19/11/2026. As mudanças recentes de OIDC, CLI v3, Flutter v3 e cifras TLS não alteram este guardião local do formulário nem a chamada fixada de atualização usada pelo projeto. Nenhuma migração ou mudança de API foi necessária.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 15 dias desta entrega. O prazo segue em risco real por dependências externas: proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica e reservar ambiente e contas de homologação sem dados de produção.
