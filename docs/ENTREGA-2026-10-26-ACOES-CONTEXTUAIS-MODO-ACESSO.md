# Entrega: ações contextuais na troca do modo de acesso

Data local: 26/10/2026 22:21:05 (America/Boa_Vista)

## Resultado funcional

O formulário de acesso agora apresenta no botão a operação selecionada: **Entrar**, **Criar conta** ou **Enviar instruções**. Ao trocar de modo, uma mensagem de sucesso ou erro da operação anterior é removida para não ser atribuída ao novo fluxo.

A troca continua limpando os campos de senha e confirmação antes de exibir o novo modo. Alternar a seleção, por si só, não chama o Supabase, não autentica, não cria conta, não envia recuperação e não altera sessão, perfil ou dados.

## Evidências automatizadas

- A mensagem de credenciais rejeitadas desaparece ao trocar do login para o cadastro.
- Os três modos exibem ações contextuais e os campos próprios de cada fluxo.
- Senha e confirmação digitadas no cadastro são apagadas ao mudar para recuperação.
- A troca entre modos não produz chamadas adicionais à API controlada do Supabase.
- Teste dirigido em desktop e viewport Android: **2/2** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **277/277** testes aprovados — 13 testes Node/PostgreSQL isolado e 264 testes Playwright.
- O Chromium isolado ausente após a instalação limpa foi restaurado pelo espelho oficial antes das validações.
- Banco de produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/index.html`
- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
