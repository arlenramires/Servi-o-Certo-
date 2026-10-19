# Entrega — acordo versionado com aceite das partes

19/10/2026 · Serviço Certo · desenvolvimento

## Código funcional

- Prestador atribuído ao pedido propõe o acordo depois do aceite de orçamento pelo cliente.
- O servidor copia o escopo e o valor da proposta aceita; o navegador não pode escolher um valor diferente para o documento.
- Documento registra participantes, profissão, cidade/UF, prazo de início/fim, responsabilidades e etapas com seus valores e condições.
- Soma das etapas deve corresponder exatamente ao orçamento aceito. Os valores são centavos inteiros positivos; entrada fracionária ou fora do intervalo seguro é rejeitada.
- Cada versão guarda uma cópia fixa do conteúdo e seu SHA-256. O hash identifica o conteúdo; não representa certificado digital, assinatura ICP-Brasil ou validação jurídica.
- Cliente e prestador decidem separadamente, usando a identidade autenticada no servidor. A interface exige marcar a leitura da versão antes do aceite; recusa também é registrada.
- Uma recusa permite propor nova versão. Conteúdo e decisões anteriores permanecem no histórico; não são reaproveitados no novo documento.
- Repetir a mesma decisão é idempotente. Alterar uma decisão já registrada, aceitar documento com hash diferente, aceitar versão antiga e decidir por terceiro são operações bloqueadas.
- A criação de versões e os aceites usam bloqueio na linha do pedido para serializar as transições. Teste de concorrência entre sessões independentes ainda pendente.

## Segurança e integração

Migração aplicada sob autorização do proprietário nesta sessão: `20261019062428_versioned_service_contracts`.

Novas tabelas `service_contracts` e `service_contract_decisions` têm RLS e somente leitura para participantes autenticados. Nenhuma gravação direta é concedida aos usuários da API. As operações de criação/decisão passam por wrappers públicos `SECURITY INVOKER`; funções privadas validam identidade, participantes, estado e conteúdo antes de gravar.

A interface está em `auth-teste/contracts.js`, integrada à conversa do serviço. O acordo não inicia execução, cria cobrança, libera repasse nem muda o status do pedido automaticamente. As etapas são o plano registrado do acordo; não são lançamentos financeiros.

## Evidências observadas

- `npm test`: 4 testes aprovados — três cenários PostgreSQL e validação de valores.
- `npm run test:ui`: 24 testes aprovados — 12 desktop e 12 em viewport Pixel 7 no Chromium, com API controlada.
- `supabase/tests/contract-flow.sql`: passou no PostgreSQL do Supabase conectado antes e depois da migração. Dados sintéticos revertidos por `ROLLBACK`.
- Verificações SQL: cópia fiel da proposta; soma e tipo dos valores das etapas; datas; hash; negação de acesso a terceiros; gravação direta/falsificação negadas; duplicação idempotente; recusa imutável; histórico; nova versão sem assinatura herdada; aceite separado das duas partes; acesso anônimo negado; nenhuma execução iniciada pelo aceite.
- Advisor de segurança após migração: `lints: []`. Não é auditoria independente de todo o produto.
- A execução hospedada será associada ao commit desta entrega no GitHub Actions. Conferir o resultado observado antes de declarar CI aprovado.

## Limites e continuidade

Esta é uma implementação de aceite eletrônico em homologação. Revisão jurídica do texto e do processo, comprovação de identidade e qualificação dos prestadores, proteção/retenção de documentos e homologação real com contas confirmadas continuam necessárias para lançamento.

Faltam gateway sandbox, pagamento por etapas, split, retenção quando suportada/contratada, estornos, execução e conclusão com provas, repasse e avaliação de ponta a ponta. Nenhum pagamento ou assinatura certificada foi realizado.

Código preparado em checkout e branch auxiliares para reduzir conflito com a rotina automática; integração na branch de desenvolvimento depende de HEAD conferido e atualização com `expected_sha`. A versão pública continua preservada.

## Consolidação da rodada automática

Durante esta entrega, a rotina automática registrou a implementação preliminar no commit `d1d451b9d72e542ae501236d9f63a38cac97621f`. A migração preparada por essa rodada ainda não havia sido aplicada ao projeto conectado. Como as duas implementações usavam estruturas diferentes para a mesma tabela, foi necessário consolidar o código antes da integração.

A migração preliminar foi preservada em `docs/archive/20261019062000_contracts_from_accepted_quotes.sql`, fora da pasta executável de migrações. O histórico do commit original permanece. A migração efetivamente aplicada, `20261019062428_versioned_service_contracts`, é a referência operacional desta entrega e dos testes; o documento agora comporta prazos, etapas negociadas, recusa e novas versões. Nenhuma migração já aplicada foi reescrita.
