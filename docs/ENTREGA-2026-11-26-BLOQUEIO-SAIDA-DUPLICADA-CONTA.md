# Entrega: bloqueio de saída duplicada da conta

**Data local:** 26/11/2026 11:33:50 (Boa Vista)  
**Branch:** `desenvolvimento-login-supabase`  
**Commit funcional:** [21b94df832db94857ebb8fbc340ae054890b15a1](https://github.com/arlenramires/Servi-o-Certo-/commit/21b94df832db94857ebb8fbc340ae054890b15a1)

## Entrega funcional

O fluxo principal de sessão agora descarta eventos adicionais enquanto a saída local da conta está em andamento. Dois eventos disparados no mesmo ciclo não iniciam duas chamadas ao serviço de autenticação nem duas limpezas concorrentes da área privada.

O botão permanece desabilitado até a resposta. Os dados autorizados continuam visíveis enquanto a saída está pendente e são removidos somente depois da confirmação do serviço.

## Evidências

- Teste dirigido de concorrência em desktop e Android: **2/2 aprovados**.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: **561 testes aprovados** — 13 testes Node/PostgreSQL e 548 testes Playwright.
- [CI Validar Serviço Certo #368](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45849823831): **sucesso em 2min35s**.
- O teste segura artificialmente a resposta de `auth.signOut`, dispara dois eventos `click`, confirma uma única chamada com `{ scope: 'local' }` e verifica que a área privada só é fechada após a resposta.

## Escopo e segurança

- Nenhuma migração ou mutação foi aplicada ao banco de produção.
- Nenhuma publicação em produção, cobrança, pagamento ou gasto foi realizado.
- Nenhum documento, profissão ou usuário foi aprovado automaticamente.
- Nenhum administrador foi concedido e nenhuma credencial privilegiada foi exposta.
- `main`, versão pública, 82 profissões e identidade azul e branca permaneceram inalteradas.

## Riscos e dependências

O aviso já registrado sobre ações do GitHub direcionadas ao Node.js 20 permanece, sem mudança de estado e sem falha nesta execução.

Restam **8 dias** até 04/12/2026, e o risco de atraso continua alto. Permanecem dependências externas de revisão jurídica, proprietário verificado, contas confirmadas para homologação conectada, definição e credenciais de gateway sandbox, além de validações hospedadas, e-mail real, push, GPS/ETA, LGPD, Android e preparação de produção. Esta entrega elimina uma corrida de sessão, mas não representa homologação ponta a ponta do projeto completo.

