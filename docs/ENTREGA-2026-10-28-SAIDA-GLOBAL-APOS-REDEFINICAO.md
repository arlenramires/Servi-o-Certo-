# Entrega: saída global após redefinição de senha

Data local: 28/10/2026 02:43:23 (America/Boa_Vista)

## Resultado funcional

Depois de definir uma nova senha pelo link de recuperação, a interface agora solicita explicitamente ao Supabase a saída com `scope: 'global'`. A pessoa volta ao formulário de acesso e recebe a orientação **Senha atualizada. Por segurança, entre novamente neste e nos outros aparelhos.**

O comportamento de segurança deixa de depender do valor padrão do SDK. As saídas comuns e o cancelamento da recuperação continuam limitados à sessão local, enquanto a conclusão da troca de senha invalida os tokens de atualização das sessões da conta. Conforme a documentação do Supabase, tokens de acesso já emitidos podem permanecer válidos até a expiração.

## Evidências automatizadas

- A redefinição bem-sucedida chama `updateUser` com a nova senha e, em seguida, `signOut({ scope: 'global' })`.
- O formulário privado permanece fechado, a URL de recuperação é limpa e a pessoa retorna ao login com orientação para todos os aparelhos.
- Um link protegido preserva somente a referência do serviço para o próximo acesso, sem expor o código na mensagem.
- Testes dirigidos em desktop e viewport Android: **4/4** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **297/297** testes aprovados — 13 testes Node/PostgreSQL isolado e 284 testes Playwright.
- A validação usou a API controlada da interface; nenhuma senha ou sessão real foi alterada.
- Banco conectado, produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/deep-link-focus.spec.js`
