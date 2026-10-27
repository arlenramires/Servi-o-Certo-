# Entrega: limpeza dos dados de cadastro ao trocar o modo de acesso

Data local: 26/10/2026 23:25:41 (America/Boa_Vista)

## Resultado funcional

Ao sair do modo **Criar conta**, o formulário agora remove o nome completo ainda não enviado e restaura o perfil solicitado para **Cliente**. Dessa forma, dados de cadastro não permanecem ocultos nem reaparecem preenchidos caso a pessoa volte ao cadastro.

O e-mail é preservado para facilitar a entrada ou a recuperação de senha. A troca de modo continua local: não chama o Supabase, não cria conta, não envia recuperação, não autentica e não altera sessão ou perfil persistido.

## Evidências automatizadas

- O nome digitado e não enviado é apagado ao sair do cadastro.
- O perfil solicitado volta de prestador para cliente.
- O e-mail permanece preenchido para os demais modos de acesso.
- Voltar ao cadastro apresenta nome vazio e perfil cliente.
- A troca entre modos não produz chamadas adicionais à API controlada do Supabase.
- Teste dirigido em desktop e viewport Android: **2/2** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **279/279** testes aprovados — 13 testes Node/PostgreSQL isolado e 266 testes Playwright.
- Banco de produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
