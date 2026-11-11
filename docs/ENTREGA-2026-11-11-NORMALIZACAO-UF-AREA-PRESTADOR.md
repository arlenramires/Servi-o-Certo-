# Entrega: normalização da UF na área do prestador

Validada em 11/11/2026 às 13:43:20 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

O fluxo do prestador agora normaliza a UF enquanto a área de atendimento é preenchida. Valores como `rr` passam imediatamente a `RR`, antes da validação nativa do formulário, e uma única operação salva a região canônica usada para localizar chamados compatíveis.

A alteração não aprova prestadores ou profissões, não modifica o catálogo de 82 profissões e não flexibiliza a autorização do banco.

Referências oficiais atuais:

- https://supabase.com/docs/reference/javascript/upsert
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova confirmou a atualização imediata de `rr` para `RR`, um único `upsert` e o objeto enviado ao Supabase com `state: 'RR'`.
- `npm run test:all`: 461/461 aprovados — 13 testes Node/PostgreSQL e 448 testes Playwright.
- O runtime iniciou sem o Chromium. O CDN primário retornou artefatos vazios/truncados, e o espelho oficial da Microsoft restaurou o navegador; os testes foram executados e aprovados depois da correção do ambiente.
- Nenhuma migração foi aplicada, nenhum banco conectado ou de produção foi alterado e não houve publicação, e-mail real, cobrança, pagamento, aprovação ou concessão administrativa.

## Evidência remota

- Commit funcional: `59a4370542e6a72d0a08ba0029d1f246b7abeb97`.
- GitHub Actions CI #231: concluído com sucesso em 11/11/2026 às 15:40:14 (America/Boa_Vista, UTC-4).
- Execução: https://github.com/arlenramires/Servi-o-Certo-/actions/runs/43088827048
- A execução hospedada aprovou `npm ci --ignore-scripts`, 13 testes Node/PostgreSQL, a instalação do Chromium e 448 testes Playwright.

## Limites e riscos para 04/12/2026

A prova usa API controlada no navegador e confirma o objeto enviado ao `upsert`. Ela não substitui a homologação hospedada com conta de prestador aprovada e políticas RLS do projeto conectado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta integral de 04/12/2026 continua em risco e não é tratada como garantia nem reduzida a MVP.
