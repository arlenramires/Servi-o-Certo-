# Entrega: correção de UF inexistente ao ajustar a região

Validada em 11/11/2026 às 22:33:27 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

Ao corrigir a região de um pedido próprio ainda aberto e sem prestador, o cliente agora precisa corrigir uma UF que não pertence às 27 unidades federativas brasileiras antes da atualização. Uma entrada como `zz` é normalizada para `ZZ`, marcada como inválida e recebe o foco; a cidade permanece preenchida e nenhuma chamada é enviada à função protegida `set_open_request_location`. Depois da correção para `am`, uma única chamada atualiza a região com `AM`.

A validação no navegador reduz regiões impossíveis no fluxo principal sem substituir a autorização da função e do banco. As políticas RLS continuam sendo a autoridade de acesso, e nenhum privilégio foi ampliado.

Referências oficiais atuais:

- https://supabase.com/docs/reference/javascript/rpc
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova confirmou foco e `aria-invalid` para `ZZ`, preservação de `Parintins`, zero chamadas RPC antes da correção e somente uma chamada com `p_state: 'AM'` depois da correção.
- `npm run test:all`: 461/461 aprovados — 13 testes Node/PostgreSQL e 448 testes Playwright.
- O Chromium não estava presente no runtime isolado. O CDN primário devolveu artefatos vazios ou truncados; o espelho oficial da Microsoft restaurou Chromium, FFmpeg e o shell headless, e todos os testes foram repetidos depois da correção do ambiente.
- O CI #241 confirmou o commit funcional e concluiu com sucesso às 22:36:39 (America/Boa_Vista): instalação sem scripts, 13 testes Node/PostgreSQL, instalação do Chromium, 448 testes Playwright e armazenamento das evidências passaram. Execução: https://github.com/arlenramires/Servi-o-Certo-/actions/runs/43142359708.
- Nenhuma migração foi criada ou aplicada, nenhum banco conectado ou de produção foi alterado e não houve publicação em produção, e-mail real, cobrança, pagamento, aprovação ou concessão administrativa.

## Limites e riscos para 04/12/2026

Esta entrega comprova o comportamento da interface com uma API controlada. Ela não substitui a homologação hospedada com conta de cliente confirmada nem adiciona uma restrição estrutural ao banco para clientes externos à interface.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta integral de 04/12/2026 continua em risco e não é tratada como garantia nem reduzida a MVP.
