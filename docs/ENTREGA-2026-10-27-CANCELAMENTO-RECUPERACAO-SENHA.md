# Entrega: cancelamento seguro da recuperação de senha

Data local: 27/10/2026 09:19:03 (America/Boa_Vista)

## Resultado funcional

A tela de definição de nova senha agora oferece **Voltar para entrar**. Ao escolher essa ação, a interface encerra somente a sessão de recuperação aberta no navegador com `signOut({ scope: 'local' })`, remove o fragmento de recuperação da URL e retorna ao login.

As duas senhas digitadas são apagadas, os campos voltam ao modo protegido e o espaço privado permanece fechado. A ação não atualiza a senha e não encerra sessões válidas mantidas em outros aparelhos.

## Evidências automatizadas

- O retorno ao login usa explicitamente o escopo local da sessão.
- A senha e sua confirmação são apagadas sem chamada a `updateUser`.
- A visibilidade da senha volta ao modo protegido.
- O fragmento de recuperação é removido da URL e o foco retorna ao e-mail.
- O painel de recuperação e o espaço privado permanecem fechados.
- Testes dirigidos em desktop e viewport Android: **2/2** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **295/295** testes aprovados — 13 testes Node/PostgreSQL isolado e 282 testes Playwright.
- A validação usou a API controlada da interface; nenhuma sessão real foi encerrada.
- Banco conectado, produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/index.html`
- `auth-teste/app.js`
- `tests/ui/mock-supabase.js`
- `tests/ui/flows.spec.js`
