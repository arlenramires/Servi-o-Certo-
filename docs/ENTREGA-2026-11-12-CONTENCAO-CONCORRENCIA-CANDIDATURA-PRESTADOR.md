# Entrega: contenção de concorrência na candidatura a prestador

Validada localmente em 12/11/2026 às 10:35:40 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

Quando duas abas tentam cadastrar a mesma profissão quase ao mesmo tempo, a restrição única do banco continua sendo a defesa final. Se o Supabase devolve o código PostgreSQL `23505`, a interface agora reconhece a duplicidade, recarrega as candidaturas atuais e apresenta a mesma orientação recuperável da validação local.

A profissão recebe foco e `aria-invalid`, a experiência digitada permanece no formulário e nenhuma segunda tentativa é feita automaticamente. A candidatura criada pela outra aba aparece na lista, enquanto o usuário permanece cliente e não recebe acesso de prestador, aprovação de profissão ou aprovação documental.

Referências oficiais atuais:

- https://supabase.com/docs/guides/api/rest/debugging-and-monitoring
- https://supabase.com/docs/guides/api/rest/postgrest-error-codes

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova simulou outra aba gravando `Pintor` depois do carregamento da tela; a tentativa concorrente recebeu `23505`, preservou a experiência, atualizou a lista com as duas candidaturas e não criou uma terceira linha.
- `npm run test:all`: 463/463 aprovados — 13 testes Node/PostgreSQL e 450 testes Playwright.
- O Chromium ausente após a instalação limpa foi restaurado com FFmpeg e shell headless pelo espelho oficial do Playwright; o teste dirigido e a suíte completa foram repetidos com sucesso.
- O CI #265 confirmou o commit funcional e concluiu com sucesso às 10:41:24 (America/Boa_Vista): instalação sem scripts, 13 testes Node/PostgreSQL, instalação do Chromium, 450 testes Playwright e armazenamento das evidências passaram. Execução: https://github.com/arlenramires/Servi-o-Certo-/actions/runs/43239421407.
- Nenhuma migração foi criada ou aplicada. Nenhum banco conectado ou de produção foi consultado ou alterado.
- Não houve publicação em produção, e-mail real, cobrança, pagamento, aprovação de candidatura/profissão/documento ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta entrega comprova a recuperação do conflito com uma API controlada e se apoia na restrição única existente como defesa final. Ela não substitui a homologação hospedada com duas sessões reais, contas confirmadas e revisão do proprietário.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta integral de 04/12/2026 continua em risco e não é tratada como garantia nem reduzida a MVP.
