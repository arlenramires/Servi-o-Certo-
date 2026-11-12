# Entrega: estados legíveis da candidatura a prestador

Data local: 12/11/2026 13:50 (Boa Vista, UTC-4)

## Resultado funcional

- A lista de candidaturas traduz os quatro estados admitidos pelo esquema: `pendente` para **Pendente**, `em_analise` para **Em análise**, `aprovado` para **Aprovada** e `rejeitado` para **Recusada**.
- As profissões indisponíveis usam os mesmos textos legíveis, sem expor códigos internos ao cliente.
- Avisos de duplicidade local ou concorrente também usam a descrição compreensível do estado atual.
- A apresentação não altera a candidatura, o perfil ou as permissões do usuário.
- Nenhuma candidatura, profissão ou documento é aprovado automaticamente e nenhum acesso de prestador é concedido.

## Evidências executadas

- `npm ci --ignore-scripts`: concluído.
- Chromium, FFmpeg e shell headless do Playwright restaurados no runtime isolado.
- Teste dirigido em desktop e Android: 4/4 aprovados, incluindo os quatro estados e as defesas de duplicidade.
- `npm run test:all`: 465/465 aprovados, sendo 13 testes Node/PostgreSQL isolado e 452 testes Playwright.
- Banco Supabase conectado: não alterado e não utilizado nesta rodada.
- Produção, pagamentos, cobranças e publicação: não executados.

## Registro GitHub

- Base lida antes da alteração: `e83ae405bfc91f4611449af2283af2f31ee566de`.
- Commit funcional: a preencher após atualização protegida da branch.
- CI do commit funcional: a preencher após conclusão.
- O HEAD final e o CI final serão informados no encerramento da rodada.

## Preservações

- `main`, versão pública e `index.html` não foram alterados.
- Catálogo com 82 profissões e identidade azul e branca preservados.
- Nenhuma credencial privilegiada foi lida ou registrada.

## Risco para 04/12/2026

Esta entrega melhora a compreensão do caminho de candidatura, mas a meta integral permanece em risco. Continuam dependendo de decisão ou acesso externo: gateway sandbox, proprietário verificado, documentos privados, revisão jurídica e homologações hospedadas de pagamentos, e-mails, notificações, localização, Android e LGPD.
