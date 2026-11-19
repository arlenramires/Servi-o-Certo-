# Entrega: bloqueio de duplo envio no acesso

Data local: 19/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `0cecbfd38331ab922ec2c6e7a882da91069e01c2`  
CI da base: execução #297 (`44448538208`), concluída com sucesso  
Commit funcional: `9fd59368d345ff0b8d4aa82b297b39801de45b8f`  
CI do commit funcional: execução #298 (`44455291984`), concluída com sucesso

## Funcionalidade entregue

O formulário de acesso agora descarta um segundo evento de envio enquanto a autenticação ainda aguarda resposta.

- o botão **Entrar** fica indisponível desde o início da operação;
- um segundo `submit` simultâneo não inicia outra chamada `signInWithPassword`;
- a senha permanece no campo enquanto a resposta está pendente;
- após a confirmação, a área autenticada abre, a senha é apagada e o botão volta a ficar disponível;
- nenhuma função, aprovação ou permissão é derivada de dados enviados pelo cliente.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "login double submit starts only one authentication request"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos mantiveram o botão ocupado, preservaram a senha durante a espera e produziram exatamente uma chamada ao Auth antes de abrir a área privada.
3. `npm run test:all`: 491/491 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 478/478 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #298 concluída com sucesso sobre o commit funcional.

## Problema de runtime resolvido

O Chromium não estava presente após `npm ci`, portanto a primeira execução dirigida não chegou ao produto. O CDN primário entregou arquivos vazios e o espelho secundário autorizado instalou Chromium, FFmpeg e headless shell; depois disso, o cenário dirigido e a suíte completa passaram. Nenhuma alteração de produto foi usada para contornar a ausência.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança ou uso de credenciais privilegiadas.

## Compatibilidade da integração

O changelog oficial foi revisto em 19/11/2026. As mudanças recentes de OIDC, CLI v3, Flutter v3 e cifras TLS não alteram este guardião local do formulário nem a chamada fixada de autenticação usada pelo projeto. Nenhuma migração ou mudança de API foi necessária.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 15 dias desta entrega. O prazo segue em risco real por dependências externas: proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica e reservar ambiente e contas de homologação sem dados de produção.
