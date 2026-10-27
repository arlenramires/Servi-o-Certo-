# Entrega: confirmação de senha no cadastro e na redefinição

Data local: 26/10/2026 21:43:50 (America/Boa_Vista)

## Resultado funcional

O cadastro e a redefinição de senha agora possuem um segundo campo de confirmação. A operação somente segue quando os dois valores são idênticos, reduzindo o risco de criar uma conta ou concluir a recuperação com uma senha digitada incorretamente.

Quando os valores divergem, a interface informa que as senhas não coincidem, apaga os dois campos e mantém o espaço privado fechado. Nenhuma chamada de cadastro ou atualização é enviada ao Supabase nesse caso. Os fluxos confirmados continuam usando as APIs atuais `signUp` e `updateUser`, sem alteração de sessão, perfil, autorização ou banco de dados.

## Evidências automatizadas

- Cadastro com confirmação divergente é bloqueado antes do Supabase em desktop e Android.
- Redefinição com confirmação divergente é bloqueada antes do Supabase em desktop e Android.
- Os testes existentes de cadastro, recuperação e continuidade de link protegido foram atualizados para confirmar as senhas iguais e continuam aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- Testes dirigidos das confirmações divergentes: **4/4** cenários aprovados.
- `npm run test:all`: **275/275** testes aprovados — 13 testes Node/PostgreSQL e 262 testes Playwright.
- Banco de produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/index.html`
- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/deep-link-focus.spec.js`
