# Entrega: recuperação de falha na atualização das candidaturas

Data local: 18/11/2026 08:00 (Boa Vista, UTC-4)

## Resultado funcional

- Se a leitura manual das candidaturas falhar, a interface informa que os dados exibidos e o rascunho foram preservados.
- A lista anterior, a profissão escolhida e a experiência ainda não enviada permanecem intactas.
- O botão volta a ficar disponível para uma nova tentativa manual, sem repetição automática de uma consulta de resultado incerto.
- Quando a leitura seguinte funciona, o estado atualizado é exibido e o rascunho continua preservado.
- O tratamento não insere candidatura, não altera perfil ou profissão e não concede acesso de prestador.

Referência oficial atual:

- https://supabase.com/docs/reference/javascript/select

## Evidências executadas

- Base lida antes da alteração: `dcafa44d8d087b282aca95fd3d3cc872d670d4e2`; CI #276 concluído com sucesso.
- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 6/6 aprovados, cobrindo atualização normal, falha recuperável com nova tentativa e resposta atrasada após `SIGNED_OUT`.
- A prova da falha confirmou mensagem específica, lista anterior e rascunho preservados, botão novamente disponível, área de prestador fechada e nenhuma inserção. A tentativa seguinte atualizou `Pendente` para `Em análise`.
- `npm run test:all`: 471/471 aprovados — 13 testes Node/PostgreSQL isolado e 458 testes Playwright.
- Após a instalação limpa, o primeiro teste dirigido não iniciou porque o Chromium estava ausente. Chromium, FFmpeg e o shell headless foram restaurados pelo instalador oficial do Playwright; os mesmos testes foram repetidos com sucesso.
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

Esta entrega reduz o risco operacional no acompanhamento das candidaturas, mas a meta integral continua em risco. Restam 16 dias e permanecem dependências externas para gateway sandbox, proprietário verificado, documentos privados, revisão jurídica e homologações hospedadas de pagamentos, e-mails, notificações, localização, Android e LGPD. Sem resolução imediata e validação ponta a ponta com antecedência, a conclusão integral até 04/12/2026 não é garantida nem reduzida a MVP.
