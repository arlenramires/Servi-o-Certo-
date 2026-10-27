# Entrega: visibilidade controlada das senhas

Data local: 27/10/2026 02:01:04 (America/Boa_Vista)

## Resultado funcional

O fluxo de acesso agora permite mostrar e ocultar separadamente a senha de entrada, a confirmação do cadastro, a nova senha e sua confirmação na recuperação. Cada controle informa seu estado por `aria-pressed` e permanece vinculado ao campo correspondente por `aria-controls`.

Ao trocar entre entrada, cadastro e recuperação ou depois de qualquer tentativa enviada, todos os campos voltam automaticamente ao tipo `password`. A alternância é inteiramente local: não chama o Supabase, não autentica, não altera senha, sessão, perfil ou registros.

## Evidências automatizadas

- Os quatro campos começam ocultos e seus controles alternam texto e estado acessível.
- A troca do modo de acesso restaura a proteção das senhas sem chamada adicional à API controlada do Supabase.
- Uma confirmação divergente na recuperação limpa os valores e restaura os dois campos ao tipo `password` antes de nova tentativa.
- Testes dirigidos em desktop e viewport Android: **4/4** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **283/283** testes aprovados — 13 testes Node/PostgreSQL isolado e 270 testes Playwright.
- Banco de produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/index.html`
- `auth-teste/style.css`
- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
