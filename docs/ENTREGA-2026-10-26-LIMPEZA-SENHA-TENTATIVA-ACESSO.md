# Entrega: limpeza da senha após tentativa de acesso

Data local: 26/10/2026 18:01:10 (America/Boa_Vista)

## Resultado funcional

O formulário agora apaga o campo de senha depois de toda tentativa efetivamente enviada de login ou cadastro. A limpeza também ocorre quando o Supabase recusa as credenciais ou devolve outro erro, evitando que o segredo continue visível no valor do campo após a resposta.

A mensagem neutra de erro e o bloqueio do espaço autenticado continuam inalterados. A recuperação por e-mail, sessões, perfis, autorizações e dados do banco não foram modificados.

## Evidências automatizadas

- Teste dirigido de interface verifica que uma autenticação recusada mantém o espaço privado fechado, preserva a mensagem neutra e esvazia o campo de senha em desktop e Android.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- Teste dirigido de autenticação recusada: **2/2** cenários aprovados (desktop e Android).
- `npm run test:all`: **269/269** testes aprovados — 13 testes Node/PostgreSQL e 256 testes Playwright.
- Banco de produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
