# Entrega: correção da descrição ao ajustar o pedido

Validada em 11/11/2026 às 23:45:16 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

Ao editar a descrição de um pedido próprio ainda aberto e sem prestador, o cliente agora recebe orientação no próprio campo quando o texto possui menos de 10 ou mais de 3.000 caracteres. O campo é marcado como inválido e recebe foco, a descrição anterior permanece no pedido e nenhuma chamada é enviada à função protegida `set_open_request_description`.

Depois de informar uma descrição válida, a marca de erro é removida e uma única chamada atualiza o pedido. A alteração não amplia quem pode editar o chamado nem muda o catálogo de profissões.

Referências oficiais atuais:

- https://supabase.com/docs/reference/javascript/rpc
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova confirmou foco e `aria-invalid` na descrição curta, preservação do texto anterior, zero chamadas RPC antes da correção e somente uma chamada com a descrição válida.
- `npm run test:all`: 461/461 aprovados — 13 testes Node/PostgreSQL e 448 testes Playwright.
- O Chromium não estava presente no runtime isolado. O CDN primário devolveu artefatos vazios ou truncados; o espelho oficial da Microsoft restaurou Chromium, FFmpeg e o shell headless, e todos os testes foram repetidos depois da correção do ambiente.
- O CI #245 confirmou o commit funcional e concluiu com sucesso às 23:48:29 (America/Boa_Vista): instalação sem scripts, 13 testes Node/PostgreSQL, instalação do Chromium, 448 testes Playwright e armazenamento das evidências passaram. Execução: https://github.com/arlenramires/Servi-o-Certo-/actions/runs/43150411566.
- Nenhuma migração foi criada ou aplicada, nenhum banco conectado ou de produção foi alterado e não houve publicação em produção, e-mail real, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta entrega comprova o comportamento da interface com uma API controlada. Ela não substitui a homologação hospedada com conta de cliente confirmada nem altera as políticas RLS do projeto conectado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta integral de 04/12/2026 continua em risco e não é tratada como garantia nem reduzida a MVP.
