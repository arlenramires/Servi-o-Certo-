# Entrega: bloqueio de reenvio duplicado da reautenticação

**Data local:** 26/11/2026 13:40:50 (Boa Vista)  
**Branch:** `desenvolvimento-login-supabase`  
**Commit funcional:** [efad861cb274cc0372bed47bf2a58b8c186173da](https://github.com/arlenramires/Servi-o-Certo-/commit/efad861cb274cc0372bed47bf2a58b8c186173da)

## Entrega funcional

O fluxo principal de recuperação de senha agora descarta eventos adicionais enquanto o reenvio do código de reautenticação está em andamento. Dois eventos disparados no mesmo ciclo não iniciam duas solicitações concorrentes de e-mail nem reabilitam o controle antes da resposta.

O botão permanece desabilitado e oculto durante a espera. A recuperação continua protegida, o código anterior permanece limpo e somente um novo pedido de código chega ao serviço, sem alterar a senha, o perfil ou as permissões.

## Evidências

- Teste dirigido de concorrência em desktop e Android: **2/2 aprovados**.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: **565 testes aprovados** — 13 testes Node/PostgreSQL e 552 testes Playwright.
- [CI Validar Serviço Certo #372](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45869357227): **sucesso em 2min19s**.
- O teste segura artificialmente a resposta de `auth.reauthenticate`, dispara dois eventos `click`, mantém o botão indisponível durante a espera e confirma somente a solicitação inicial e um único reenvio.

## Escopo e segurança

- Nenhuma migração ou mutação foi aplicada ao banco de produção.
- Nenhuma publicação em produção, cobrança, pagamento ou gasto foi realizado.
- Nenhum documento, profissão ou usuário foi aprovado automaticamente.
- Nenhum administrador foi concedido e nenhuma credencial privilegiada foi exposta.
- `main`, versão pública, 82 profissões e identidade azul e branca permaneceram inalteradas.

## Riscos e dependências

O aviso já registrado sobre ações do GitHub direcionadas ao Node.js 20 permanece, sem mudança de estado e sem falha nesta execução.

Restam **8 dias** até 04/12/2026, e o risco de atraso continua alto. Permanecem dependências externas de revisão jurídica, proprietário verificado, contas confirmadas para homologação conectada, definição e credenciais de gateway sandbox, além de validações hospedadas, e-mail real, push, GPS/ETA, LGPD, Android e preparação de produção. Esta entrega elimina uma corrida no reenvio de reautenticação, mas não representa homologação ponta a ponta do projeto completo.
