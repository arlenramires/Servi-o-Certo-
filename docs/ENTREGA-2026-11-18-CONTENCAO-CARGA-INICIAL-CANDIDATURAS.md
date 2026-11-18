# Entrega: contenção da indisponibilidade inicial das candidaturas

Data local: 18/11/2026 10:53 (Boa Vista, UTC-4)

## Resultado funcional

- Uma falha na primeira consulta de candidaturas não interrompe mais o carregamento dos serviços autorizados do cliente.
- A lista exibe `Candidaturas temporariamente indisponíveis` em vez de afirmar incorretamente que não há solicitações.
- Enquanto o estado real não foi recuperado, o envio de nova candidatura é bloqueado antes de qualquer inserção para preservar a defesa contra duplicidade.
- Profissão e experiência preenchidas permanecem no formulário, e a atualização manual recupera a lista real sem perder o rascunho.
- A recuperação mantém a área de prestador fechada e não concede perfil, profissão ou permissão.

Referências oficiais atuais:

- https://supabase.com/changelog.md
- https://supabase.com/docs/reference/javascript/select

## Evidências executadas

- Base remota lida antes da alteração: `9b6b3723cd03b51beaba7b7037dcb8b67b436caf`; CI #278 concluído com sucesso.
- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados.
- A prova simulou erro `PGRST000` somente na primeira leitura, confirmou serviços acessíveis, estado indisponível explícito, tentativa de candidatura sem `insert`, rascunho preservado e recuperação manual da candidatura pendente.
- `npm run test:all`: 473/473 aprovados — 13 testes Node/PostgreSQL isolado e 460 testes Playwright.
- Após a instalação limpa, o primeiro teste dirigido não iniciou porque o Chromium estava ausente. Chromium, FFmpeg e o shell headless foram restaurados pelo instalador oficial do Playwright; os mesmos testes foram repetidos com sucesso.
- O clone remoto por Git solicitou autenticação indisponível nesta rodada; o GitHub conectado confirmou o HEAD e o workspace isolado já verificado continha exatamente essa base. Publicação e releituras usam o conector GitHub com `expected_sha`.
- Banco Supabase conectado: não consultado nem alterado. Nenhuma migração foi criada ou aplicada.
- Produção, pagamentos, cobranças, e-mails reais, aprovações e privilégios administrativos: não executados.

## Registro GitHub

- Commit funcional e CI: serão preenchidos após a publicação concorrente segura e a conclusão do workflow.
- O HEAD final e o CI final serão informados no encerramento da rodada após a atualização deste relatório.

## Preservações

- `main`, versão pública e `index.html` não foram alterados.
- Catálogo com 82 profissões e identidade azul e branca preservados.
- Nenhuma credencial privilegiada foi lida ou registrada.

## Risco para 04/12/2026

Esta entrega mantém o fluxo do cliente operacional durante uma falha parcial, mas a meta integral continua em risco. Restam 16 dias e permanecem dependências externas para gateway sandbox, proprietário verificado, documentos privados, revisão jurídica e homologações hospedadas de pagamentos, e-mails, notificações, localização, Android e LGPD. Sem resolução imediata e validação ponta a ponta com antecedência, a conclusão integral até 04/12/2026 não é garantida nem reduzida a MVP.
