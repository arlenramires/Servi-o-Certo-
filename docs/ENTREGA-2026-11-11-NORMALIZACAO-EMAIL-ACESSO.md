# Entrega: normalização do e-mail nas ações de acesso

Validada em 11/11/2026 às 03:49 (America/Boa_Vista).

## Funcionalidade entregue

Cadastro, login e recuperação de senha agora removem espaços externos e convertem o endereço de e-mail para minúsculas antes de chamar o Supabase Auth. O campo de acesso passa a exibir o valor canônico efetivamente enviado, e o bloqueio local de endereços recusados na recuperação usa exatamente a mesma chave. Assim, as três ações deixam de depender de variações de capitalização entre a interface e o serviço.

O código oficial do Supabase Auth armazena e procura endereços com normalização para minúsculas. As referências oficiais atuais documentam as três operações usadas pela interface:

- https://github.com/supabase/auth/blob/master/internal/models/user.go
- https://supabase.com/docs/reference/javascript/auth-signup
- https://supabase.com/docs/reference/javascript/auth-signinwithpassword
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail

## Correção do CI

O workflow do HEAD anterior falhou antes dos testes de interface porque `ubuntu-latest` passou a resolver para Ubuntu 26.04, enquanto o Playwright 1.56.1 recusou instalar Chromium nesse sistema. O job executou `npm ci --ignore-scripts` e aprovou os 13 testes Node/PostgreSQL, mas encerrou na instalação do navegador e pulou toda a suíte de UI. O runner foi fixado em `ubuntu-24.04`, preservando as versões do aplicativo e restaurando um ambiente suportado para a validação.

Evidência do incidente: https://github.com/arlenramires/Servi-o-Certo-/actions/runs/42116642061

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído sem erro.
- Teste dirigido `access actions send one normalized email to Supabase`: 2/2 cenários aprovados, em desktop e viewport Android. Foram verificadas as cargas de login, cadastro e recuperação, além da permanência da área privada fechada.
- `npm run test:all`: 451/451 testes aprovados — 13 testes Node/PostgreSQL e 438 testes Playwright.
- CI do commit funcional: concluído com sucesso em 11/11/2026 às 03:53 (America/Boa_Vista), incluindo instalação do Chromium, testes Node/PostgreSQL e suíte de UI: https://github.com/arlenramires/Servi-o-Certo-/actions/runs/42982443696
- O CDN primário do Playwright devolveu arquivos vazios; o instalador usou o espelho oficial da Microsoft e restaurou Chromium, FFmpeg e o shell headless antes das validações.
- Nenhuma migração foi aplicada, nenhum banco conectado ou de produção foi alterado, nenhum e-mail real foi enviado e não houve publicação, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta prova usa API controlada no navegador e não substitui a homologação hospedada com contas confirmadas e entrega real de e-mail. A execução remota do workflow corrigido foi confirmada, mas não representa homologação contra o Supabase conectado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta de concluir e homologar todo o escopo em 04/12/2026 continua em risco; ela não é tratada como garantia nem reduzida a MVP.
