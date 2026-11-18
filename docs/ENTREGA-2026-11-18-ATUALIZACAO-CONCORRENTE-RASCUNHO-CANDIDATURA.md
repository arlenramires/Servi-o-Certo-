# Entrega: contenção de candidatura concorrente no rascunho

Data local: 18/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `8d6a6ae61768940ad6793bc455a88c68db9802e0`  
CI da base: execução #285 (`44360618530`), concluída com sucesso  
Commit funcional: `bf9d474eec0af015a52f1798d516b5b46ca3cb91`  
CI do commit funcional: execução #286 (`44369051916`), concluída com sucesso

## Funcionalidade entregue

Ao atualizar as candidaturas, se a profissão ainda selecionada no formulário tiver sido registrada em outra aba, a interface agora:

- reconhece a candidatura retornada pela leitura autorizada;
- remove explicitamente apenas a profissão que ficou obsoleta no rascunho;
- preserva integralmente a experiência ainda não enviada;
- devolve o foco à seleção e orienta a escolha de outra profissão;
- mantém a candidatura concorrente e seu estado legível na lista;
- não repete inserção, não aprova a candidatura e não concede acesso de prestador ou administrador.

A alteração usa somente a leitura já existente de `provider_applications`; não adiciona consulta, escrita, migração ou privilégio.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "client refresh removes a profession registered in another tab and preserves experience"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - comprovou duas leituras, nenhuma inserção, profissão concorrente indisponível, experiência preservada, foco devolvido ao formulário e painéis sem elevação de acesso.
3. `npm run test:all`: 479/479 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 466/466 testes Playwright, desktop e viewport Android.

## Problema de runtime resolvido

O Chromium do Playwright não estava presente depois de `npm ci`, portanto a primeira execução dirigida não chegou ao produto. O CDN primário voltou a entregar arquivo vazio; o espelho secundário autorizado instalou Chromium, FFmpeg e o headless shell, e o cenário dirigido e a suíte completa passaram. Nenhuma alteração de produto foi feita para contornar essa ausência.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta rodada não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma candidatura ou documento foi aprovado automaticamente.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 16 dias desta entrega. O prazo segue em risco real: administração auditável depende do proprietário verificado; acordos dependem de revisão jurídica; pagamentos dependem de gateway e credenciais sandbox; e-mails, push, GPS, LGPD, Android, ambiente conectado e preparação de produção ainda exigem homologação. Ações externas prioritárias: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica e reservar contas e ambiente de homologação sem dados de produção.
