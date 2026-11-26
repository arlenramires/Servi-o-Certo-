# Entrega: bloqueio de reenvio duplicado da confirmação

**Data local:** 26/11/2026 10:18:16 (Boa Vista)  
**Branch:** `desenvolvimento-login-supabase`  
**Commit funcional:** [c0595e0a9de1818e8fd51825f4426ec160f6e858](https://github.com/arlenramires/Servi-o-Certo-/commit/c0595e0a9de1818e8fd51825f4426ec160f6e858)

## Entrega funcional

O fluxo de acesso agora descarta eventos adicionais enquanto o reenvio do e-mail de confirmação está em andamento. Dois eventos disparados no mesmo ciclo não iniciam dois pedidos ao serviço de autenticação.

O botão permanece desabilitado até a resposta e, após a confirmação do pedido, é ocultado para evitar repetição. A alteração não confirma contas, não concede perfil de prestador e não modifica permissões.

## Evidências

- Teste dirigido de concorrência em desktop e Android: **2/2 aprovados**.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: **559 testes aprovados** — 13 testes Node/PostgreSQL e 546 testes Playwright.
- [CI Validar Serviço Certo #366](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45836910751): **sucesso em 3min46s**.
- O teste segura artificialmente a resposta de `auth.resend`, dispara dois eventos `click`, confirma uma única chamada com o e-mail pendente original e verifica que o controle só conclui após a resposta.

## Escopo e segurança

- Nenhuma migração ou mutação foi aplicada ao banco de produção.
- Nenhuma publicação em produção, cobrança, pagamento ou gasto foi realizado.
- Nenhum documento, profissão ou usuário foi aprovado automaticamente.
- Nenhum administrador foi concedido e nenhuma credencial privilegiada foi exposta.
- `main`, versão pública, 82 profissões e identidade azul e branca permaneceram inalteradas.

## Riscos e dependências

O aviso já registrado sobre ações do GitHub direcionadas ao Node.js 20 permanece, sem mudança de estado e sem falha nesta execução.

Restam **8 dias** até 04/12/2026, e o risco de atraso continua alto. Permanecem dependências externas de revisão jurídica, proprietário verificado, contas confirmadas para homologação conectada, definição e credenciais de gateway sandbox, além de validações hospedadas, e-mail real, push, GPS/ETA, LGPD, Android e preparação de produção. Esta entrega reduz uma condição de corrida no acesso, mas não representa homologação ponta a ponta do projeto completo.

