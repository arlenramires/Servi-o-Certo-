# Entrega: normalização da UF ao ajustar a região

Validada em 11/11/2026 às 16:21:47 (America/Boa_Vista, UTC-4).

## Funcionalidade entregue

Ao corrigir a região de um pedido próprio ainda aberto e sem prestador, o cliente agora vê a UF ser normalizada enquanto digita. Valores como `am` passam imediatamente a `AM`, antes da atualização, e uma única chamada envia cidade e UF canônicas para a função protegida `set_open_request_location`.

A alteração não muda políticas do banco, não amplia quem pode editar o pedido, não altera o catálogo de 82 profissões e não toca a versão pública ou a identidade azul e branca.

Referências oficiais atuais:

- https://supabase.com/docs/reference/javascript/rpc
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Evidências locais isoladas

- `npm ci --ignore-scripts`: concluído; 4 pacotes instalados sem executar scripts de dependências.
- Teste dirigido em desktop e viewport Android: 2/2 aprovados. A prova confirmou a atualização imediata de `am` para `AM`, somente uma chamada RPC e os argumentos `p_city: 'Parintins'` e `p_state: 'AM'`.
- `npm run test:all`: 461/461 aprovados — 13 testes Node/PostgreSQL e 448 testes Playwright.
- O runtime iniciou sem o Chromium. O CDN primário retornou artefatos vazios ou truncados, e o espelho oficial da Microsoft restaurou o navegador; os testes foram repetidos e aprovados depois da correção do ambiente.
- Nenhuma migração foi aplicada, nenhum banco conectado ou de produção foi alterado e não houve publicação em produção, e-mail real, cobrança, pagamento, aprovação ou concessão administrativa.

## Recuperação da validação remota

- O commit funcional `879584f7bd5f91d9e2a8fc1dce3f0d304d29b9a5` iniciou o CI #233 às 16:22:49 (America/Boa_Vista), durante uma indisponibilidade geral do GitHub Actions.
- Mesmo depois de o status oficial informar que a fila havia sido totalmente processada às 17:21, o CI #233 continuava `queued`, sem nenhum job criado e sem atualização, na conferência das 18:42.
- Para não confundir falha de infraestrutura com falha da entrega, este próprio registro foi atualizado para disparar uma nova validação remota do mesmo código funcional. O commit documental não é contado como funcionalidade adicional.

## Limites e riscos para 04/12/2026

A prova usa API controlada no navegador e confirma os argumentos enviados à RPC. Ela não substitui a homologação hospedada com conta de cliente confirmada e as políticas RLS do projeto conectado.

Permanecem no caminho crítico: definição e credenciais do gateway sandbox; provisionamento verificado do proprietário; armazenamento privado e análise de documentos e contestações; e homologação de e-mails, pagamentos, notificações, localização, Android, LGPD e fluxos completos no ambiente conectado. Sem essas decisões e acessos externos com antecedência, a meta integral de 04/12/2026 continua em risco e não é tratada como garantia nem reduzida a MVP.
