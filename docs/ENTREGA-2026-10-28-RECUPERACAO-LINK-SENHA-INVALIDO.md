# Entrega: recuperação de link de senha inválido ou expirado

Data local: 28/10/2026 04:42:56 (America/Boa_Vista)

## Resultado funcional

Quando um retorno de recuperação de senha chega sem uma sessão válida, a interface agora deixa de apresentar o formulário de nova senha. O fragmento inválido é removido do endereço, a pessoa volta diretamente ao pedido genérico de outro e-mail e recebe uma orientação neutra para continuar.

Se o retorno também contém uma referência protegida de serviço, ela permanece no endereço para a autenticação posterior, mas seu código não é exibido. O espaço privado continua fechado e nenhuma tentativa de redefinição é enviada com a sessão ausente.

## Evidências automatizadas

- Um retorno `#type=recovery` sem usuário válido abre diretamente **Recuperar senha**, com foco no e-mail.
- A etapa de definição de nova senha e o espaço privado permanecem ocultos.
- O fragmento de recuperação é removido; uma referência `servico` válida permanece protegida no endereço.
- Nenhuma chamada de login, cadastro, recuperação ou alteração de senha é disparada durante a correção.
- Testes dirigidos em desktop e viewport Android: **4/4** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **299/299** testes aprovados — 13 testes Node/PostgreSQL isolado e 286 testes Playwright.
- A validação usou a API controlada da interface; nenhuma sessão ou mensagem real foi criada.
- Banco conectado, produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
