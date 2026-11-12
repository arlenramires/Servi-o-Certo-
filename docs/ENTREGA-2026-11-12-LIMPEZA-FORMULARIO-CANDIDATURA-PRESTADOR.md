# Entrega: limpeza segura do formulário de candidatura a prestador

Validada localmente em 12/11/2026 às 12:39:20 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

Depois que uma candidatura válida é confirmada pelo Supabase e a conta é recarregada, o formulário agora remove a experiência já enviada, volta a profissão para a opção inicial e devolve o foco ao seletor. Isso evita manter no campo um texto que já foi persistido e deixa a próxima candidatura explícita para outra profissão.

A limpeza ocorre somente após o `insert` e o recarregamento concluírem. Validações locais, duplicidade já carregada, conflito concorrente `23505` e demais erros continuam preservando profissão e experiência para correção, sem repetição automática da chamada. A candidatura permanece pendente e nenhum acesso de prestador é concedido.

Referências oficiais atuais:

- https://supabase.com/docs/reference/javascript/insert
- https://supabase.com/docs/guides/api/rest/debugging-and-monitoring

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova confirmou formulário limpo e foco na profissão somente depois do sucesso, candidatura pendente persistida uma única vez e preservação do texto nos erros local e concorrente.
- `npm run test:all`: 463/463 aprovados — 13 testes Node/PostgreSQL e 450 testes Playwright.
- O Chromium, FFmpeg e o shell headless ausentes após a instalação limpa foram restaurados pelo espelho oficial; o teste dirigido e a suíte completa foram repetidos com sucesso.
- O CI #267 confirmou o commit funcional e concluiu com sucesso às 12:42:55 (America/Boa_Vista): instalação sem scripts, 13 testes Node/PostgreSQL, instalação do Chromium, 450 testes Playwright e armazenamento das evidências passaram. Execução: https://github.com/arlenramires/Servi-o-Certo-/actions/runs/43261267897.
- Nenhuma migração foi criada ou aplicada. Nenhum banco conectado ou de produção foi consultado ou alterado.
- Não houve publicação em produção, e-mail real, cobrança, pagamento, aprovação de candidatura/profissão/documento ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta entrega comprova a transição do formulário com uma API controlada. Ela não substitui homologação hospedada com conta confirmada, análise real pelo proprietário nem validação ponta a ponta no ambiente conectado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta integral de 04/12/2026 continua em risco e não é tratada como garantia nem reduzida a MVP.
