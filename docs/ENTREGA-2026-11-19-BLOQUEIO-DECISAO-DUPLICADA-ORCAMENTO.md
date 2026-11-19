# Entrega: bloqueio de decisão duplicada no orçamento

Data local: 19/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `97340d71b8a6a5f555f621ae46a45505ba3f6bc9`  
CI da base: execução #307 (`44492500888`), concluída com sucesso  
Commit funcional: `8d11bca7bb62a3cb646769d7655a3d7d5f9bf1b9`  
CI do commit funcional: execução #308 (`44507477738`), concluída com sucesso

## Funcionalidade entregue

A decisão do cliente sobre um orçamento agora descarta um segundo evento enquanto a primeira inserção protegida ainda aguarda resposta.

- **Aceitar orçamento** e **Recusar orçamento** ficam indisponíveis desde o início da decisão;
- um segundo evento simultâneo não inicia outra inserção em `service_quote_decisions`;
- nenhuma decisão é exibida como concluída antes da resposta;
- após a confirmação, somente uma decisão do cliente é registrada para a proposta;
- aceitar o orçamento não cria pagamento, cobrança ou aceite do acordo.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "client double action records only one quote decision"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos bloquearam as duas ações, produziram exatamente uma inserção e somente uma decisão após a resposta.
3. `npm run test:all`: 501/501 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 488/488 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #308 concluída com sucesso sobre o commit funcional.

## Problema de runtime resolvido

Após `npm ci`, a versão bloqueada do Playwright passou a exigir o Chromium `1194`, ainda ausente no runtime. A primeira execução dirigida não chegou ao produto. O CDN primário entregou arquivos vazios e o espelho secundário autorizado instalou Chromium, FFmpeg e headless shell; o cenário dirigido e a suíte completa passaram em seguida. Nenhuma alteração de produto contornou a ausência.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 15 dias desta entrega. O prazo segue em risco real por dependências externas: proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica e reservar ambiente e contas de homologação sem dados de produção.
