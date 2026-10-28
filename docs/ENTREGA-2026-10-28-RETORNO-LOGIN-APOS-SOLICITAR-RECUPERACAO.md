# Entrega: retorno ao login após solicitar recuperação

Data local: 28/10/2026 03:10:41 (America/Boa_Vista)

## Resultado funcional

Depois de solicitar a recuperação de senha, a interface agora retorna ao modo **Entrar**, preserva o e-mail informado e posiciona o foco no campo de senha. A confirmação continua genérica para não revelar se o endereço está cadastrado.

Essa transição prepara o acesso posterior e evita que um novo clique repita acidentalmente o envio. Quando a solicitação parte de um link protegido, a referência do serviço permanece no endereço e continua oculta na orientação exibida.

## Evidências automatizadas

- A solicitação chama `resetPasswordForEmail` uma única vez com o endereço de retorno correto.
- O e-mail informado permanece preenchido, o campo de senha volta a aparecer e recebe foco.
- A confirmação não revela se existe uma conta para o endereço.
- Links protegidos preservam a referência para a próxima autenticação sem exibir o código.
- Testes dirigidos em desktop e viewport Android: **4/4** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **297/297** testes aprovados — 13 testes Node/PostgreSQL isolado e 284 testes Playwright.
- A validação usou a API controlada da interface; nenhum e-mail real foi enviado.
- Banco conectado, produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/deep-link-focus.spec.js`
