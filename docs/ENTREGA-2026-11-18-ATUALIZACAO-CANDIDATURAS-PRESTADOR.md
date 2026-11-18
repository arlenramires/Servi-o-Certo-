# Entrega: atualização manual das candidaturas a prestador

Data local: 18/11/2026 06:14 (Boa Vista, UTC-4)

## Resultado funcional

- O cliente pode usar **Atualizar candidaturas** para consultar novamente os estados sem sair da conta ou recarregar a página.
- A lista e as profissões indisponíveis refletem o estado mais recente com os textos legíveis já definidos.
- Profissão e experiência de uma nova candidatura ainda não enviada permanecem preenchidas durante a consulta.
- A atualização executa somente uma leitura das candidaturas do usuário autenticado; não cria ou altera candidatura, perfil ou permissão.
- O cliente continua sem acesso ao painel de prestador até a aprovação segura fora desta ação.

Referência oficial atual: https://supabase.com/docs/reference/javascript/select.

## Evidências executadas

- Base lida antes da alteração: `d99c028079874090e99b2035abd3eb8749246cef`; CI #272 concluído com sucesso.
- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova alterou uma candidatura de Pendente para Em análise na API controlada, atualizou a tela, preservou profissão e experiência, confirmou duas leituras no total, zero inserções e ausência do painel de prestador.
- `npm run test:all`: 467/467 aprovados — 13 testes Node/PostgreSQL isolado e 454 testes Playwright.
- Após a instalação limpa, o primeiro teste dirigido não iniciou porque o Chromium estava ausente. Chromium, FFmpeg e o shell headless foram restaurados pelo instalador oficial do Playwright; o teste dirigido e a suíte completa foram repetidos com sucesso.
- Banco Supabase conectado: não consultado nem alterado. Nenhuma migração foi criada ou aplicada.
- Produção, pagamentos, cobranças, e-mails reais, aprovações e privilégios administrativos: não executados.

## Registro GitHub

- Commit funcional: `9a11fb2132dd1a24686358e7527fa82b88683fd1`.
- CI do commit funcional: execução #273 (`44283709584`), concluída com sucesso.
- O HEAD final da rodada e o CI final são informados no encerramento após a publicação deste relatório atualizado.

## Preservações

- `main`, versão pública e `index.html` não foram alterados.
- Catálogo com 82 profissões e identidade azul e branca preservados.
- Nenhuma credencial privilegiada foi lida ou registrada.

## Risco para 04/12/2026

Esta entrega melhora o acompanhamento da candidatura, mas não elimina o risco da meta integral. Restam decisões ou acessos externos para gateway sandbox, proprietário verificado, documentos privados, revisão jurídica e homologações hospedadas de pagamentos, e-mails, notificações, localização, Android e LGPD. Sem resolução e validação ponta a ponta com antecedência, a conclusão integral até 04/12/2026 permanece em risco e não é tratada como garantia nem reduzida a MVP.
