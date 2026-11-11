# Entrega: correção de UF inexistente na solicitação

Validada em 11/11/2026 às 19:50:00 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

Ao criar um pedido, o cliente agora é orientado a corrigir uma UF de duas letras que não pertence às 27 unidades federativas brasileiras. Uma entrada como `zz` é normalizada para `ZZ`, marcada como inválida e recebe o foco; profissão, descrição e cidade permanecem preenchidas e nenhuma inserção é enviada ao Supabase. Depois da correção para `rr`, uma única solicitação é registrada com `RR`.

A verificação no navegador reduz erros do fluxo normal sem substituir a autorização do banco. As políticas RLS continuam sendo a autoridade de acesso, e nenhum privilégio ou aprovação foi ampliado.

Referências oficiais atuais:

- https://supabase.com/docs/reference/javascript/insert
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova confirmou foco e `aria-invalid` para `ZZ`, preservação dos demais campos, zero inserções antes da correção e somente uma inserção com `state: 'RR'` depois da correção.
- `npm run test:all`: 461/461 aprovados — 13 testes Node/PostgreSQL e 448 testes Playwright.
- A primeira execução dirigida não abriu porque o Chromium não estava presente. O CDN primário devolveu artefatos vazios ou truncados; o espelho oficial da Microsoft restaurou Chromium, FFmpeg e o shell headless, e todos os testes foram repetidos depois da correção do ambiente.
- O CI #236 aprovou instalação e 13 testes Node/PostgreSQL, mas detectou que o arquivo de testes havia sido truncado durante a transferência ao GitHub. A publicação foi corrigida com a leitura integral do arquivo, sem alterar o código funcional, e uma nova validação do HEAD foi disparada.
- O CI #237 confirmou a correção e concluiu com sucesso às 19:56:03 (America/Boa_Vista): instalação sem scripts, 13 testes Node/PostgreSQL, instalação do Chromium, 448 testes Playwright e armazenamento das evidências passaram. Execução: https://github.com/arlenramires/Servi-o-Certo-/actions/runs/43123134644.
- Nenhuma migração foi criada ou aplicada, nenhum banco conectado ou de produção foi alterado e não houve publicação em produção, e-mail real, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta entrega comprova o comportamento da interface com uma API controlada. Ela não substitui a homologação hospedada com conta de cliente confirmada nem adiciona uma restrição estrutural ao banco para clientes externos à interface.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta integral de 04/12/2026 continua em risco e não é tratada como garantia nem reduzida a MVP.
