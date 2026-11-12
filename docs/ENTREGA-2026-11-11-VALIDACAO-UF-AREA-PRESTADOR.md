# Entrega: correção de UF inexistente na área do prestador

Validada em 11/11/2026 às 21:18:02 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

Ao definir sua região de atendimento, o prestador agora precisa corrigir uma UF de duas letras que não pertence às 27 unidades federativas brasileiras antes de salvar. Uma entrada como `zz` é normalizada para `ZZ`, marcada como inválida e recebe o foco; a cidade permanece preenchida e nenhum `upsert` é enviado ao Supabase. Depois da correção para `rr`, uma única área é salva com `RR`.

A validação no navegador reduz regiões impossíveis no fluxo principal sem substituir a autorização do banco. As políticas RLS continuam sendo a autoridade de acesso, e nenhum privilégio ou aprovação foi ampliado.

Referências oficiais atuais:

- https://supabase.com/docs/reference/javascript/upsert
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova confirmou foco e `aria-invalid` para `ZZ`, preservação da cidade, zero `upsert` antes da correção e somente um `upsert` com `state: 'RR'` depois da correção.
- `npm run test:all`: 461/461 aprovados — 13 testes Node/PostgreSQL e 448 testes Playwright.
- O Chromium não estava presente no runtime isolado. O CDN primário devolveu artefatos vazios ou truncados; o espelho oficial da Microsoft restaurou Chromium, FFmpeg e o shell headless, e a validação completa terminou com sucesso.
- Nenhuma migração foi criada ou aplicada, nenhum banco conectado ou de produção foi alterado e não houve publicação em produção, e-mail real, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta entrega comprova o comportamento da interface com uma API controlada. Ela não substitui a homologação hospedada com conta de prestador aprovada nem adiciona uma restrição estrutural ao banco para clientes externos à interface.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta integral de 04/12/2026 continua em risco e não é tratada como garantia nem reduzida a MVP.
