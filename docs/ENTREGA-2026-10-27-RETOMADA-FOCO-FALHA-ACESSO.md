# Entrega: retomada do foco após falha de acesso

Data local: 27/10/2026 04:00:57 (America/Boa_Vista)

## Resultado funcional

Quando uma tentativa de entrada é recusada ou o cadastro contém senhas divergentes, o formulário apaga os segredos e devolve o foco à senha. Quando o Supabase recusa a redefinição, o painel permanece protegido e o foco retorna à nova senha já limpa.

Assim, a pessoa pode corrigir a tentativa diretamente pelo teclado. O reposicionamento não repete a autenticação, não cria conta, não altera senha, sessão, perfil ou registros e não abre o espaço privado.

## Evidências automatizadas

- Login recusado mantém o espaço privado fechado, apaga a senha e devolve o foco ao campo correspondente.
- Cadastro com confirmação divergente é bloqueado antes do Supabase, apaga ambas as senhas e devolve o foco à primeira senha.
- Redefinição recusada pela API controlada mantém o painel de recuperação aberto, apaga ambas as senhas e devolve o foco à nova senha.
- Testes dirigidos em desktop e viewport Android: **6/6** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **287/287** testes aprovados — 13 testes Node/PostgreSQL isolado e 274 testes Playwright.
- Banco de produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
