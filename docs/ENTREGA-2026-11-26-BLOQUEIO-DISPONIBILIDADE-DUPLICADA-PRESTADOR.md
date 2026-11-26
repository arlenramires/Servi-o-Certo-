# Entrega: bloqueio de disponibilidade duplicada do prestador

**Data local:** 26/11/2026 07:22:33 (Boa Vista)  
**Branch:** `desenvolvimento-login-supabase`  
**Commit funcional:** [6abb58b2d71c80c0fa64b877b594d67bec5213ba](https://github.com/arlenramires/Servi-o-Certo-/commit/6abb58b2d71c80c0fa64b877b594d67bec5213ba)

## Entrega funcional

O fluxo principal do prestador agora descarta eventos adicionais enquanto a alteração de disponibilidade para novos serviços está em andamento. Dois eventos disparados no mesmo ciclo não enviam duas chamadas `set_provider_availability`.

O controle permanece desabilitado até a resposta e conserva o estado confirmado. A autorização continua sendo decidida pelo serviço: a mudança não aprova profissão, documento ou acesso de prestador.

## Evidências

- Teste dirigido de concorrência em desktop e Android: **2/2 aprovados**.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: **557 testes aprovados** — 13 testes Node/PostgreSQL e 544 testes Playwright.
- [CI Validar Serviço Certo #364](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45809552212): **sucesso em 2min23s**.
- O teste segura artificialmente a resposta, dispara dois eventos `change`, confirma uma única chamada com `{ p_available: true }` e verifica que o controle só é reabilitado após a resposta.

## Escopo e segurança

- Nenhuma migração ou mutação foi aplicada ao banco de produção.
- Nenhuma publicação em produção, cobrança, pagamento ou gasto foi realizado.
- Nenhum documento, profissão ou usuário foi aprovado automaticamente.
- Nenhum administrador foi concedido e nenhuma credencial privilegiada foi exposta.
- `main`, versão pública, 82 profissões e identidade azul e branca permaneceram inalteradas.

## Riscos e dependências

O aviso já registrado sobre ações do GitHub direcionadas ao Node.js 20 permanece, sem mudança de estado e sem falha nesta execução.

Restam **8 dias** até 04/12/2026, e o risco de atraso continua alto. Permanecem dependências externas de revisão jurídica, proprietário verificado, contas confirmadas para homologação conectada, definição e credenciais de gateway sandbox, além de validações hospedadas, e-mail, push, GPS/ETA, LGPD, Android e preparação de produção. Esta entrega reduz uma condição de corrida do fluxo principal, mas não representa homologação ponta a ponta do projeto completo.
