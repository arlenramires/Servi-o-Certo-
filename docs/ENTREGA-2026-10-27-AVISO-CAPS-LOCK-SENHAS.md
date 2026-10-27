# Entrega: aviso de Caps Lock nas senhas

Data local: 27/10/2026 05:38:51 (America/Boa_Vista)

## Resultado funcional

Os campos de senha de entrada, confirmação do cadastro e redefinição agora exibem um aviso acessível quando Caps Lock está ativo durante a digitação. O aviso usa uma região de status, desaparece ao sair do campo e também é limpo ao trocar de etapa ou concluir uma tentativa.

A verificação ocorre inteiramente no navegador. Nenhuma tecla, senha ou estado do teclado é enviado ao Supabase, e o aviso não autentica, cria conta, altera senha, sessão, perfil ou registros.

## Evidências automatizadas

- Senha de entrada anuncia Caps Lock ativo e oculta o aviso ao mover o foco.
- A confirmação do cadastro permanece sem aviso quando Caps Lock está inativo.
- A redefinição anuncia Caps Lock ativo e limpa o aviso ao sair do campo.
- Os cenários não fazem chamada de autenticação à API controlada.
- Testes dirigidos em desktop e viewport Android: **4/4** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **291/291** testes aprovados — 13 testes Node/PostgreSQL isolado e 278 testes Playwright.
- Banco de produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/index.html`
- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
