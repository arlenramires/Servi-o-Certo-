# Entrega: contenção de sessão encerrada na atualização das candidaturas

Data local: 18/11/2026 07:20 (Boa Vista, UTC-4)

## Resultado funcional

- A atualização manual das candidaturas registra a sessão e a geração da tela que iniciaram a consulta.
- Se o Supabase emitir `SIGNED_OUT` antes da resposta, o retorno atrasado é descartado.
- A lista privada permanece vazia, o workspace continua fechado e o aviso de sessão encerrada não é substituído.
- Erros de uma consulta pertencente à sessão anterior também não repopulam a tela nem geram nova tentativa automática.
- A contenção não altera candidatura, perfil, profissão ou permissão e não concede acesso de prestador.

Referências oficiais atuais:

- https://supabase.com/docs/reference/javascript/auth-onauthstatechange
- https://supabase.com/docs/reference/javascript/select

## Evidências executadas

- Base lida antes da alteração: `f77a4a75940e66c2491e3091595edb7bb24ee02b`; CI #274 concluído com sucesso.
- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 4/4 aprovados, cobrindo a atualização normal e uma resposta deliberadamente atrasada após `SIGNED_OUT`.
- A prova confirmou workspace fechado, lista privada vazia, aviso de sessão encerrada preservado, duas leituras no total e nenhuma repetição automática.
- `npm run test:all`: 469/469 aprovados — 13 testes Node/PostgreSQL isolado e 456 testes Playwright.
- Após a instalação limpa, o primeiro teste dirigido não iniciou porque o Chromium estava ausente. Chromium, FFmpeg e o shell headless foram restaurados pelo instalador oficial do Playwright; os testes foram repetidos com sucesso.
- Banco Supabase conectado: não consultado nem alterado. Nenhuma migração foi criada ou aplicada.
- Produção, pagamentos, cobranças, e-mails reais, aprovações e privilégios administrativos: não executados.

## Registro GitHub

- Commit funcional: `d68581fe93537089b381acb7bf9ee162190abb00`.
- CI do commit funcional: execução #275 (`44294000653`), concluída com sucesso.
- O HEAD final e o CI final são informados no encerramento da rodada após a publicação deste relatório atualizado.

## Preservações

- `main`, versão pública e `index.html` não foram alterados.
- Catálogo com 82 profissões e identidade azul e branca preservados.
- Nenhuma credencial privilegiada foi lida ou registrada.

## Risco para 04/12/2026

Esta entrega fecha uma condição de corrida de privacidade no acompanhamento da candidatura, mas a meta integral continua em risco. Permanecem dependências externas para gateway sandbox, proprietário verificado, documentos privados, revisão jurídica e homologações hospedadas de pagamentos, e-mails, notificações, localização, Android e LGPD. Sem resolução e validação ponta a ponta com antecedência, a conclusão integral até 04/12/2026 não é garantida nem reduzida a MVP.
