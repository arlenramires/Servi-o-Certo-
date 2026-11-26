# Entrega: bloqueio de atualização geral duplicada

**Data local:** 26/11/2026 15:46:40 (Boa Vista)  
**Branch:** `desenvolvimento-login-supabase`  
**Commit funcional:** [95f9823b999f14e7c531637768c52d7b48446983](https://github.com/arlenramires/Servi-o-Certo-/commit/95f9823b999f14e7c531637768c52d7b48446983)

## Entrega funcional

A área autenticada agora descarta eventos adicionais enquanto a atualização geral dos serviços está em andamento. Dois eventos disparados no mesmo ciclo não iniciam duas cargas concorrentes de pedidos e mensagens não lidas nem permitem que uma resposta antecipada reabilite o controle antes da carga ativa.

O botão permanece desabilitado até a resposta. A lista confirmada continua visível durante a espera e o novo estado só aparece após a conclusão da consulta única, sem alterar pedidos, mensagens ou permissões.

## Evidências

- Teste dirigido de concorrência em desktop e Android: **2/2 aprovados**.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: **569 testes aprovados** — 13 testes Node/PostgreSQL e 556 testes Playwright.
- [CI Validar Serviço Certo #376](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45885734788): **sucesso em 2min37s**.
- O teste segura artificialmente a consulta de `service_requests`, dispara dois eventos `click`, confirma somente uma carga adicional de pedidos e contagens de mensagens e verifica a atualização apenas após a resposta.
- A interface foi validada com API controlada e os testes PostgreSQL usaram somente o banco isolado da suíte; não houve homologação desta mudança com contas reais no Supabase conectado.

## Escopo e segurança

- Nenhuma migração ou mutação foi aplicada ao banco de produção.
- Nenhuma publicação em produção, cobrança, pagamento ou gasto foi realizado.
- Nenhum documento, profissão ou usuário foi aprovado automaticamente.
- Nenhum administrador foi concedido e nenhuma credencial privilegiada foi exposta.
- `main`, versão pública, 82 profissões e identidade azul e branca permaneceram inalteradas.

## Riscos e dependências

O aviso já registrado sobre ações do GitHub direcionadas ao Node.js 20 permanece, sem mudança de estado e sem falha nesta execução.

Restam **8 dias** até 04/12/2026, e o risco de atraso continua alto. Permanecem dependências externas de revisão jurídica, proprietário verificado, contas confirmadas para homologação conectada, definição e credenciais de gateway sandbox, além de validações hospedadas, e-mail real, push, GPS/ETA, LGPD, Android e preparação de produção. Esta entrega elimina uma corrida de leitura da área autenticada, mas não representa homologação ponta a ponta do projeto completo.
