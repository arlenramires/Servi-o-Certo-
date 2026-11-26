# Entrega: bloqueio de cancelamento duplicado da recuperação

**Data local:** 26/11/2026 12:27:08 (Boa Vista)  
**Branch:** `desenvolvimento-login-supabase`  
**Commit funcional:** [2edac4d6f7f72c59d4549192d6ea77e69308db87](https://github.com/arlenramires/Servi-o-Certo-/commit/2edac4d6f7f72c59d4549192d6ea77e69308db87)

## Entrega funcional

O fluxo principal de recuperação de senha agora descarta eventos adicionais enquanto o cancelamento local está em andamento. Dois eventos disparados no mesmo ciclo não iniciam duas chamadas ao serviço de autenticação nem duas transições concorrentes para a tela de acesso.

O botão permanece desabilitado até a resposta. A recuperação e os campos preenchidos continuam visíveis enquanto a saída local está pendente; depois da confirmação, a tela retorna ao acesso e limpa os campos sem alterar a senha, o perfil ou as permissões.

## Evidências

- Teste dirigido de concorrência em desktop e Android: **2/2 aprovados**.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: **563 testes aprovados** — 13 testes Node/PostgreSQL e 550 testes Playwright.
- [CI Validar Serviço Certo #370](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45858380057): **sucesso em 2min29s**.
- O teste segura artificialmente a resposta de `auth.signOut`, dispara dois eventos `click`, confirma uma única chamada com `{ scope: 'local' }`, preserva os campos durante a espera e verifica a limpeza somente após a resposta.

## Escopo e segurança

- Nenhuma migração ou mutação foi aplicada ao banco de produção.
- Nenhuma publicação em produção, cobrança, pagamento ou gasto foi realizado.
- Nenhum documento, profissão ou usuário foi aprovado automaticamente.
- Nenhum administrador foi concedido e nenhuma credencial privilegiada foi exposta.
- `main`, versão pública, 82 profissões e identidade azul e branca permaneceram inalteradas.

## Riscos e dependências

O aviso já registrado sobre ações do GitHub direcionadas ao Node.js 20 permanece, sem mudança de estado e sem falha nesta execução.

Restam **8 dias** até 04/12/2026, e o risco de atraso continua alto. Permanecem dependências externas de revisão jurídica, proprietário verificado, contas confirmadas para homologação conectada, definição e credenciais de gateway sandbox, além de validações hospedadas, e-mail real, push, GPS/ETA, LGPD, Android e preparação de produção. Esta entrega elimina uma corrida no cancelamento da recuperação, mas não representa homologação ponta a ponta do projeto completo.
