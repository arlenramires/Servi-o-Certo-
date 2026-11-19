# Entrega: bloqueio de duplo envio no cancelamento

Data local: 19/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `149e7ce5584b2ba96319d29e01cda77bef6e893a`  
CI da base: execução #301 (`44462230050`), concluída com sucesso  
Commit funcional: `989efb3058fe3d0b67d80eaeaab7a6b9a7e46632`  
CI do commit funcional: execução #302 (`44472999798`), concluída com sucesso

## Funcionalidade entregue

O formulário de cancelamento agora descarta um segundo evento de envio enquanto a operação protegida ainda aguarda resposta.

- o botão **Confirmar cancelamento** fica indisponível desde o início da operação;
- um segundo `submit` simultâneo não inicia outra chamada `cancel_service_before_start`;
- o motivo permanece preenchido enquanto a resposta está pendente;
- após a confirmação, somente um registro auditável de cancelamento existe;
- para prestadores, a proteção também impede a criação concorrente de dois chamados substitutos;
- nenhuma taxa, cobrança ou aprovação é criada.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "double submit starts only one cancellation"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos mantiveram o botão ocupado e o motivo visível, produziram exatamente uma RPC, um registro auditável e uma mudança de estado.
3. `npm run test:all`: 495/495 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 482/482 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #302 concluída com sucesso sobre o commit funcional.

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
