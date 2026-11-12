# Entrega: correção da cidade ao ajustar a região

Validada em 12/11/2026 às 00:54:43 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

Ao editar a região de um pedido próprio ainda aberto e sem prestador, o cliente agora recebe orientação no próprio campo quando a cidade possui menos de 2 ou mais de 100 caracteres. O campo é marcado como inválido e recebe foco, a UF permanece preenchida e nenhuma chamada é enviada à função protegida `set_open_request_location`.

Depois da correção da cidade, a marca de erro é removida e a validação da UF continua independente. Somente quando cidade e UF são válidas uma única chamada atualiza a região do pedido.

Referências oficiais atuais:

- https://supabase.com/docs/reference/javascript/rpc
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova confirmou foco e `aria-invalid` na cidade curta, preservação da UF, zero chamadas RPC durante as correções de cidade e UF e somente uma chamada com `Parintins / AM` depois de ambas estarem válidas.
- `npm run test:all`: 461/461 aprovados — 13 testes Node/PostgreSQL e 448 testes Playwright.
- O Chromium não estava presente no runtime isolado. O CDN primário devolveu artefatos vazios ou truncados; o espelho oficial da Microsoft restaurou Chromium, FFmpeg e o shell headless, e todos os testes foram repetidos depois da correção do ambiente.
- Nenhuma migração foi criada ou aplicada, nenhum banco conectado ou de produção foi alterado e não houve publicação em produção, e-mail real, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta entrega comprova o comportamento da interface com uma API controlada. Ela não substitui a homologação hospedada com conta de cliente confirmada nem altera as políticas RLS do projeto conectado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta integral de 04/12/2026 continua em risco e não é tratada como garantia nem reduzida a MVP.
