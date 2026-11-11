# Entrega: normalização da UF na solicitação

Validada em 11/11/2026 às 11:22:50 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

O início do fluxo principal agora normaliza a UF enquanto o cliente digita. Valores como `rr` passam imediatamente a `RR`, antes da validação nativa do formulário, e a solicitação é enviada uma única vez com a região canônica.

A alteração não modifica o catálogo de 82 profissões, a autorização do banco ou as demais informações do pedido.

Referências oficiais atuais:

- https://supabase.com/docs/reference/javascript/insert
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova confirmou a atualização imediata de `rr` para `RR`, uma única inserção e o objeto enviado ao Supabase com `state: 'RR'`.
- `npm run test:all`: 459/459 aprovados — 13 testes Node/PostgreSQL e 446 testes Playwright.
- O runtime iniciou sem o Chromium. O CDN primário retornou artefatos vazios/truncados, e o espelho oficial da Microsoft restaurou o navegador; os testes foram executados e aprovados depois da correção do ambiente.
- Nenhuma migração foi aplicada, nenhum banco conectado ou de produção foi alterado e não houve publicação, e-mail real, cobrança, pagamento, aprovação ou concessão administrativa.

## Evidências locais isoladas

- `npm ci --ignore-scripts`: pendente de registro final.
- Teste dirigido em desktop e viewport Android: pendente de registro final.
- `npm run test:all`: pendente de registro final.
- Nenhuma migração foi aplicada, nenhum banco conectado ou de produção foi alterado e não houve publicação, e-mail real, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

A prova usa API controlada no navegador e confirma o objeto enviado ao `insert`. Ela não substitui a homologação hospedada com contas confirmadas e políticas RLS do projeto conectado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta integral de 04/12/2026 continua em risco e não é tratada como garantia nem reduzida a MVP.
