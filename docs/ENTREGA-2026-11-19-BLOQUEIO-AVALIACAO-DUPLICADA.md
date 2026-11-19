# Entrega: bloqueio de avaliação duplicada

Data local: 19/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `53b3c0b9b9517b8d66c4e6e99541afcd63474ad9`  
CI da base: execução #317 (`44558745083`), concluída com sucesso  
Commit funcional: `bddfb56bead00209f21ba5177bc7f84df4bdadb1`  
CI do commit funcional: execução #318 (`44568103004`), concluída com sucesso

## Funcionalidade entregue

O envio da avaliação após a conclusão agora descarta uma segunda submissão enquanto a primeira chamada ainda aguarda resposta.

- **Enviar avaliação** fica indisponível desde o início da operação;
- um segundo evento simultâneo não inicia outra chamada `rate_completed_service`;
- nota e comentário permanecem preenchidos enquanto a resposta está pendente;
- após a confirmação, somente uma avaliação imutável é criada e o formulário é removido;
- a ação não movimenta pagamento, cobrança ou repasse.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "client double submit creates only one immutable rating"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - duas submissões simultâneas mantiveram o botão bloqueado, preservaram o rascunho e produziram exatamente uma RPC e uma avaliação.
3. `npm run test:all`: 511/511 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 498/498 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #318 concluída com sucesso sobre o commit funcional.

## Problema de runtime resolvido

O runtime recriado não continha o Chromium `1194`; a primeira execução dirigida não chegou ao produto. O CDN primário entregou arquivos vazios e o espelho secundário autorizado instalou Chromium, FFmpeg e headless shell. O cenário dirigido e a suíte completa passaram depois da instalação, sem alteração de produto para contornar a ausência.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança, repasse ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 15 dias desta entrega. O prazo segue em risco real por dependências externas: proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica e reservar ambiente e contas de homologação sem dados de produção.
