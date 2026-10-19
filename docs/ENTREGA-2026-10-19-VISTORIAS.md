# Entrega — proposta de vistoria antes do orçamento

Horário da validação local: **2026-10-19 10:21:55 -04:00**.

## Funcionalidade entregue

- O prestador atribuído pode propor uma única vistoria antes de enviar o orçamento principal, informando finalidade, data futura e valor previsto em centavos.
- O cliente pode aceitar ou recusar expressamente. A decisão é imutável e uma repetição idêntica é idempotente.
- O aceite registra o estado `aceita_pendente_pagamento`: não confirma agenda, não cria cobrança e não autoriza execução da visita.
- Uma vistoria não pode ser proposta após existir orçamento para o pedido nem quando o pedido saiu do estado `aceito`.
- A tabela usa RLS para leitura exclusiva das partes. Escrita direta foi revogada; proposta e decisão passam por funções autenticadas que validam prestador e cliente.

## Evidências

- `npm ci --ignore-scripts`: concluído com 4 pacotes instalados e sem execução de scripts de dependências.
- `npm run test:all`: aprovado.
  - 9/9 testes Node/PostgreSQL no PGlite isolado.
  - 44/44 testes Playwright, sendo 22 desktop e 22 em viewport Android.
- Cobertura nova de banco: valor em centavos, data futura, etapa pré-orçamento, autoria, decisão exclusiva do cliente, idempotência, imutabilidade, RLS, negação de escrita direta e bloqueio de terceiros.
- Cobertura nova de UI: proposta do prestador sem cobrança e aceite do cliente explicitamente pendente de pagamento, em desktop e viewport Android.

## Limites e pendências

A migração `20261019143000_prequote_inspection_proposal.sql` foi executada somente no PostgreSQL efêmero dos testes. Não foi aplicada ao Supabase conectado nem à produção. A confirmação e realização da vistoria, cálculo por distância, regra de repasse e eventual abatimento no serviço principal dependem da definição comercial e do gateway sandbox autorizado.

Não houve publicação, gasto, aprovação de documentos/profissões, concessão de administrador ou alteração da branch `main`. O aplicativo público, as 82 profissões e a identidade azul e branca permanecem preservados.
