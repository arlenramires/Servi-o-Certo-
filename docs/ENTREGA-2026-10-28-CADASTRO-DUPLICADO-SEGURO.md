# Entrega: retorno seguro após cadastro duplicado

Data local: 28/10/2026 09:42:56 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase recusa uma tentativa de cadastro com os códigos oficiais `email_exists` ou `user_already_exists`, a interface agora volta ao modo **Entrar**, preserva o e-mail informado e orienta a pessoa a entrar ou usar **Recuperar senha**. Antes, essas recusas apareciam como erro genérico de conexão.

A mensagem é deliberadamente igual para os dois códigos e não afirma que o endereço está cadastrado. Nome, perfil solicitado e senhas são apagados, o foco retorna à senha de acesso e o espaço privado permanece fechado. Nenhum reenvio de confirmação, login ou recuperação é disparado automaticamente.

## Evidências automatizadas

- Os dois códigos oficiais de duplicidade produzem a mesma orientação neutra.
- O formulário retorna ao login com o e-mail preservado e foco na senha.
- Nome, perfil solicitado e os dois campos de senha são limpos.
- Cada tentativa realiza somente uma chamada de cadastro, sem login, recuperação ou reenvio automático.
- Testes dirigidos em desktop e viewport Android: **2/2** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **309/309** testes aprovados — 13 Node/PostgreSQL isolado e 296 Playwright.
- A validação usou API controlada; nenhuma conta foi consultada ou criada e nenhum e-mail real foi enviado.
- Banco conectado, produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
