# Entrega: profissões indisponíveis após candidatura a prestador

Data local: 12/11/2026 12:53 (Boa Vista, UTC-4)

## Resultado funcional

- A seleção de profissão marca como indisponível cada profissão que já possui candidatura do cliente.
- A opção indisponível identifica a profissão e o status atual, por exemplo `Eletricista — candidatura pendente`.
- Profissões sem candidatura continuam habilitadas para uma nova solicitação.
- A mesma atualização ocorre quando um conflito concorrente `23505` revela uma candidatura criada por outra aba.
- A validação local e a restrição única permanecem como defesas adicionais para telas desatualizadas ou alterações programáticas.
- Nenhuma candidatura, profissão ou documento é aprovado automaticamente e nenhum acesso de prestador é concedido.

## Evidências executadas

- `npm ci --ignore-scripts`: concluído.
- Chromium do Playwright verificado/restaurado no runtime isolado.
- Teste dirigido em desktop e Android: 2/2 aprovados.
- `npm run test:all`: 463/463 aprovados, sendo 13 testes Node/PostgreSQL isolado e 450 testes Playwright.
- Banco Supabase conectado: não alterado e não utilizado nesta rodada.
- Produção, pagamentos, cobranças e publicação: não executados.

## Registro GitHub

- Base lida antes da alteração: `45719051be594d58f2584f4310e70c5e3bb641cb`.
- Commit funcional: `880695ce30f4c4b36d3e709afc164240079a71f7`.
- CI do commit funcional: execução `43263684887`, concluída com sucesso.
- O HEAD final desta rodada é o commit documental que incorpora estas evidências; seu SHA e o CI final são informados no encerramento da rodada após a validação remota.

## Preservações

- `main`, versão pública e `index.html` não foram alterados.
- Catálogo com 82 profissões preservado; nenhuma profissão foi criada, removida ou aprovada.
- Identidade azul e branca preservada.
- Nenhuma credencial privilegiada foi lida ou registrada.

## Risco para 04/12/2026

A entrega reduz uma repetição evitável no caminho de candidatura, mas não elimina o risco da meta integral. Continuam dependendo de decisão ou acesso externo: gateway de pagamento em sandbox, conta do proprietário verificada, documentos privados, revisão jurídica dos acordos e homologações hospedadas de pagamentos, e-mails, notificações, localização, Android e LGPD.
