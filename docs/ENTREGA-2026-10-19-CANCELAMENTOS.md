# Entrega — cancelamento antes do início e reencaminhamento seguro

Data local: 19/10/2026, 06h43 (Boa Vista/Manaus). Branch `desenvolvimento-login-supabase`.

## Implementação

- O cliente pode cancelar um pedido `aberto` ou `aceito`, informando um motivo de 10 a 500 caracteres.
- O prestador atribuído pode cancelar antes do início. O pedido original fica cancelado e uma cópia aberta é criada automaticamente para outro profissional elegível.
- O prestador que cancelou fica excluído da oferta substituta e não pode retomá-la imediatamente.
- A operação é atômica e idempotente: repeti-la pelo mesmo ator não duplica o chamado nem o registro.
- Ator, papel, motivo, resultado e chamado substituto ficam em auditoria com RLS, visível apenas aos participantes e sem gravação direta pela API.
- Serviços em andamento não passam por este fluxo; exigirão o fluxo de disputa.
- A interface informa expressamente que nenhuma taxa foi cobrada. O campo `fee_status` permanece `nao_avaliada`, pois cobrança depende de política aprovada e gateway sandbox autorizado.

## Evidências de teste

- `npm ci --ignore-scripts`: concluído.
- `npm test`: 6 testes Node/PostgreSQL aprovados.
- `npm run test:ui`: 32 testes Playwright aprovados, sendo 16 desktop e 16 no viewport Android.
- Cobertura nova: cancelamento do cliente, reencaminhamento por cancelamento do prestador, cópia de dados, auditoria, idempotência, bloqueio de reaceite, elegibilidade de outro prestador, RLS, negação de escrita direta, terceiro sem acesso e bloqueio após o início.
- A primeira tentativa de UI não iniciou por ausência do Chromium; o navegador de teste foi instalado no runtime e a suíte foi repetida com aprovação integral.
- Durante os testes foram corrigidos o privilégio explícito de leitura da nova coluna e a resposta a terceiros, que agora não revela a existência ou o estágio do pedido.

## Limites

A migração `20261019100000_prestart_cancellation_reassignment.sql` foi executada somente no PostgreSQL efêmero dos testes. Não foi aplicada ao Supabase conectado nem à produção. Não houve publicação, cobrança, pagamento, repasse, aprovação administrativa ou alteração de profissões. A branch `main`, o aplicativo público, as 82 profissões e a identidade azul e branca permanecem preservados.
