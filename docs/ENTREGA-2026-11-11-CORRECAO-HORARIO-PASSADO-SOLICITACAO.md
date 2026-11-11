# Entrega: correção de horário passado na solicitação

Validada em 11/11/2026 às 09:48:52 e revalidada após a correção do workflow às 10:14:06 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

O início do fluxo principal agora guia a correção quando o cliente escolhe um horário preferido que já passou. O campo é marcado como inválido e recebe foco, enquanto profissão, descrição, cidade e UF são preservadas. Nenhum `insert` é enviado ao Supabase nessa condição.

Ao substituir o valor por um horário futuro, a marca de erro é removida e a mesma solicitação pode ser enviada normalmente, com uma única inserção. A validação não altera as 82 profissões nem flexibiliza a autorização do banco.

Referências oficiais atuais:

- https://supabase.com/docs/reference/javascript/insert
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova confirmou foco e `aria-invalid` no horário passado, preservação dos demais dados, zero inserções antes da correção e uma única inserção após informar horário futuro.
- `npm run test:all`: 457/457 aprovados — 13 testes Node/PostgreSQL e 444 testes Playwright; a suíte completa foi repetida com o mesmo resultado após a correção do workflow.
- Na primeira execução dirigida, o runtime não tinha o Chromium do Playwright. O CDN primário retornou artefatos vazios/truncados; a instalação pelo espelho oficial da Microsoft restaurou o navegador. O teste dirigido e a suíte completa foram repetidos e aprovados depois da correção do runtime.
- O CI #226 falhou duas vezes antes dos testes de interface porque o runner não conseguiu resolver `azure.archive.ubuntu.com` ao tentar baixar fontes com `playwright install --with-deps`. Como o Ubuntu 24.04 já contém as bibliotecas necessárias, o workflow passou a instalar somente o Chromium, sem a busca redundante de pacotes do sistema.
- O CI #227 concluiu com sucesso às 10:17:43 (America/Boa_Vista): instalação do Chromium, testes Node/PostgreSQL, 444 testes Playwright e armazenamento das evidências foram aprovados. Execução: https://github.com/arlenramires/Servi-o-Certo-/actions/runs/43036631345
- Nenhuma migração foi aplicada, nenhum banco conectado ou de produção foi alterado e não houve publicação, e-mail real, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

A prova usa API controlada no navegador e confirma que o cliente não envia a inserção antes de corrigir o horário. Ela não substitui a homologação hospedada com contas confirmadas e políticas RLS do projeto conectado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta integral de 04/12/2026 continua em risco e não é tratada como garantia nem reduzida a MVP.
