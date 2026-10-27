# Entrega: foco contextual no fluxo de acesso

Data local: 27/10/2026 03:14:57 (America/Boa_Vista)

## Resultado funcional

O formulário agora direciona o foco de teclado ao primeiro campo útil de cada etapa. A entrada e a recuperação por e-mail focam o e-mail; o cadastro foca o nome completo; o retorno confirmado de recuperação foca a nova senha.

Depois que a redefinição é concluída, o foco volta ao e-mail do login. A navegação é inteiramente local: trocar a etapa não chama o Supabase, não autentica, não cria conta, não altera senha, sessão, perfil ou registros.

## Evidências automatizadas

- A tela inicial posiciona o foco no e-mail.
- A troca para cadastro posiciona o foco no nome completo; entrar e recuperar senha retornam ao e-mail.
- O retorno de recuperação posiciona o foco na nova senha.
- Após uma redefinição concluída com a API controlada, o login reaparece com foco no e-mail.
- Testes dirigidos em desktop e viewport Android: **4/4** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **287/287** testes aprovados — 13 testes Node/PostgreSQL isolado e 274 testes Playwright.
- Banco de produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
