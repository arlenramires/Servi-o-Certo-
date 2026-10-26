# Entrega: limpeza da nova senha após falha na redefinição

Data local: 26/10/2026 19:58:28 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase recusa uma tentativa de redefinir a senha, o formulário agora apaga imediatamente o valor digitado no campo de nova senha. A pessoa permanece no painel de recuperação para tentar novamente, sem abertura do espaço autenticado e sem encerramento indevido da sessão de recuperação.

O comportamento de sucesso continua igual: após a atualização aceita, a sessão é encerrada e a pessoa retorna ao login para entrar com a nova senha. Nenhuma regra de autorização, perfil, serviço ou banco de dados foi alterada.

## Evidências automatizadas

- Teste dirigido simula a rejeição da atualização de senha e confirma, em desktop e Android, que o campo é apagado, o painel de recuperação permanece visível, o espaço privado continua fechado e somente a chamada de atualização foi realizada.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- Teste dirigido da redefinição recusada: **2/2** cenários aprovados.
- `npm run test:all`: **271/271** testes aprovados — 13 testes Node/PostgreSQL e 258 testes Playwright.
- Banco de produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/mock-supabase.js`
- `tests/ui/flows.spec.js`
