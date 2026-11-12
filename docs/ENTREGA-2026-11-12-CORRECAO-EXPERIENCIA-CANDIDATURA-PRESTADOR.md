# Entrega: correção da experiência na candidatura a prestador

Validada em 12/11/2026 às 08:54:55 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

Ao informar mais de 1.500 caracteres na experiência da candidatura, o cliente agora recebe orientação no próprio campo antes de qualquer chamada ao Supabase. A experiência é marcada como inválida e recebe foco, a profissão permanece selecionada e nenhum `insert` é enviado para `provider_applications`.

Depois da correção, a marca de erro é removida e uma única candidatura válida pode ser enviada. A prevenção de candidatura duplicada continua independente, e a nova solicitação permanece pendente sem aprovar profissão, documentos ou acesso de prestador.

Referências oficiais atuais:

- https://supabase.com/docs/reference/javascript/insert
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova confirmou foco e `aria-invalid` na experiência acima do limite, profissão preservada, zero candidaturas durante as correções de profissão e experiência, somente uma candidatura pendente com texto válido e bloqueio posterior de duplicidade.
- `npm run test:all`: 463/463 aprovados — 13 testes Node/PostgreSQL e 450 testes Playwright.
- O navegador já estava disponível no runtime isolado; a instalação explícita do Chromium confirmou os binários necessários sem novo download.
- Nenhuma migração foi criada ou aplicada. A restrição existente de até 1.500 caracteres continua sendo a garantia final no banco; nenhum banco conectado ou de produção foi alterado.
- Não houve publicação em produção, e-mail real, cobrança, pagamento, aprovação de candidatura/profissão/documento ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta entrega comprova o comportamento da interface com uma API controlada e mantém a restrição do banco como defesa final. Ela não substitui a homologação hospedada com contas confirmadas, a revisão real pelo proprietário nem altera as políticas RLS do projeto conectado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta integral de 04/12/2026 continua em risco e não é tratada como garantia nem reduzida a MVP.
