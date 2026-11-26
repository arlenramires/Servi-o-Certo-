# Entrega: bloqueio de atualização duplicada das candidaturas

**Data local:** 26/11/2026 14:46:12 (Boa Vista)  
**Branch:** `desenvolvimento-login-supabase`  
**Commit funcional:** [0aa113606a587234345be5cc9eabc57c960fe946](https://github.com/arlenramires/Servi-o-Certo-/commit/0aa113606a587234345be5cc9eabc57c960fe946)

## Entrega funcional

O fluxo cliente para candidatura a prestador agora descarta eventos adicionais enquanto a atualização das candidaturas está em andamento. Dois eventos disparados no mesmo ciclo não iniciam duas consultas concorrentes nem permitem que uma resposta antecipada reabilite o controle antes da consulta ativa.

O botão permanece desabilitado até a resposta. A lista já confirmada, a profissão selecionada e o resumo de experiência continuam visíveis durante a espera; somente uma nova consulta chega ao serviço e nenhuma permissão de prestador é concedida.

## Evidências

- Teste dirigido de concorrência em desktop e Android: **2/2 aprovados**.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: **567 testes aprovados** — 13 testes Node/PostgreSQL e 554 testes Playwright.
- [CI Validar Serviço Certo #374](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45878090973): **sucesso em 2min47s**.
- O teste segura artificialmente a consulta de `provider_applications`, dispara dois eventos `click`, confirma uma única consulta adicional e verifica que lista e rascunho permanecem preservados até a resposta.
- A interface foi validada com API controlada e os testes PostgreSQL usaram somente o banco isolado da suíte; não houve homologação desta mudança com contas reais no Supabase conectado.

## Escopo e segurança

- Nenhuma migração ou mutação foi aplicada ao banco de produção.
- Nenhuma publicação em produção, cobrança, pagamento ou gasto foi realizado.
- Nenhum documento, profissão ou usuário foi aprovado automaticamente.
- Nenhum administrador foi concedido e nenhuma credencial privilegiada foi exposta.
- `main`, versão pública, 82 profissões e identidade azul e branca permaneceram inalteradas.

## Riscos e dependências

O aviso já registrado sobre ações do GitHub direcionadas ao Node.js 20 permanece, sem mudança de estado e sem falha nesta execução.

Restam **8 dias** até 04/12/2026, e o risco de atraso continua alto. Permanecem dependências externas de revisão jurídica, proprietário verificado, contas confirmadas para homologação conectada, definição e credenciais de gateway sandbox, além de validações hospedadas, e-mail real, push, GPS/ETA, LGPD, Android e preparação de produção. Esta entrega elimina uma corrida na atualização de candidaturas, mas não representa homologação ponta a ponta do projeto completo.
