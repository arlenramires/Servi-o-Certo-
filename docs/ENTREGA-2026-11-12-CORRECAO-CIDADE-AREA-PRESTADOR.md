# Entrega: correção da cidade na área do prestador

Validada em 12/11/2026 às 02:31:51 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

Ao definir sua área de atendimento, o prestador agora recebe orientação no próprio campo quando a cidade possui menos de 2 ou mais de 100 caracteres. O campo é marcado como inválido e recebe foco, a UF permanece preenchida e nenhum `upsert` é enviado para `provider_service_areas`.

O formulário passou a encaminhar suas restrições nativas para a validação acessível da aplicação, evitando que o navegador interrompa silenciosamente a orientação. Depois da correção da cidade, a marca de erro é removida e a validação da UF continua independente. Somente quando cidade e UF são válidas uma única gravação atualiza a área do prestador.

Referências oficiais atuais:

- https://supabase.com/docs/reference/javascript/upsert
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova confirmou foco e `aria-invalid` na cidade curta, preservação da UF, zero `upsert` durante as correções de cidade e UF e somente uma gravação com `Boa Vista / RR` depois de ambas estarem válidas.
- `npm run test:all`: 461/461 aprovados — 13 testes Node/PostgreSQL e 448 testes Playwright.
- O primeiro comando dirigido usou nomes de projetos que não existem nesta configuração; ele foi corrigido imediatamente para `desktop` e `android-viewport`. Em seguida, o Chromium ausente no runtime isolado foi restaurado pelo espelho oficial da Microsoft após o CDN primário devolver artefatos vazios ou truncados, e todos os testes foram repetidos com sucesso.
- O CI #249 confirmou o commit funcional e concluiu com sucesso às 02:35:59 (America/Boa_Vista): instalação sem scripts, 13 testes Node/PostgreSQL, instalação do Chromium, 448 testes Playwright e armazenamento das evidências passaram. Execução: https://github.com/arlenramires/Servi-o-Certo-/actions/runs/43168921309.
- Nenhuma migração foi criada ou aplicada, nenhum banco conectado ou de produção foi alterado e não houve publicação em produção, e-mail real, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta entrega comprova o comportamento da interface com uma API controlada. Ela não substitui a homologação hospedada com conta de prestador aprovado e confirmado nem altera as políticas RLS do projeto conectado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta integral de 04/12/2026 continua em risco e não é tratada como garantia nem reduzida a MVP.
