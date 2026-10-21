# Entrega — solicitar novamente após cancelamento ou conclusão

Validada em 20/10/2026 às 22h33 (Boa Vista).

## Funcionalidade

- O cliente recebe a ação `Solicitar novamente` nos próprios pedidos cancelados ou concluídos.
- Profissão, descrição, cidade e UF são copiadas para o formulário de uma nova solicitação, que permanece aberta para revisão antes do envio.
- Urgência e horário anterior não são reaproveitados automaticamente, evitando repetir prioridade ou agenda desatualizada.
- O pedido anterior e seu histórico não são alterados; o envio cria um novo chamado aberto pelo fluxo existente.
- Se a profissão antiga não estiver mais no catálogo atual, a cópia é bloqueada e nenhuma solicitação é criada.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 94 testes Playwright aprovados em desktop e viewport Android.
- Interface com API controlada: botões exibidos para cancelado e concluído, formulário preenchido para revisão, urgência/agenda limpas, pedido original preservado e novo pedido criado aberto e sem prestador.
- A primeira execução encontrou uma expectativa incorreta no teste sobre uma propriedade ausente. A asserção foi corrigida para verificar que `provider_id` não é enviado; a suíte completa seguinte passou.

## Limites e preservação

Esta entrega reutiliza a inserção protegida existente e não exige migração. Nenhum SQL foi aplicado ao Supabase conectado, nenhuma publicação foi feita e nenhuma operação financeira ocorreu.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
