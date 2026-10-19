# Entrega — serviços extras com decisão do cliente

Data local: 19/10/2026, 07h48 (Boa Vista/Manaus). Branch `desenvolvimento-login-supabase`.

## Implementação

- Somente o prestador atribuído pode propor um serviço extra, e somente enquanto o serviço está `em_andamento`.
- A proposta registra descrição imutável, valor exato em centavos, prestador e horário.
- Somente o cliente do pedido pode aceitar ou recusar; a decisão e seu horário ficam protegidos contra alteração.
- Existe no máximo uma proposta pendente por serviço. Depois da decisão, o prestador pode registrar outro extra, preservando todo o histórico.
- O prestador não pode solicitar a conclusão enquanto houver extra aguardando decisão do cliente.
- A interface mostra propostas e decisões aos dois participantes e deixa explícito que o aceite não cria cobrança.
- Tabelas e funções usam RLS, escrita exclusivamente por RPC e respostas opacas para terceiros.

## Evidências de teste

- `npm ci --ignore-scripts`: concluído.
- Testes direcionados: 7 testes Node/PostgreSQL e 36 testes Playwright aprovados, sendo 18 desktop e 18 no viewport Android.
- Cobertura nova: valores em centavos, validação de escopo, proposta exclusiva do prestador, decisão exclusiva do cliente, idempotência, imutabilidade, histórico de extras aceitos e recusados, limite de uma pendência, RLS, negação de escrita direta, terceiro sem acesso, bloqueio antes do início e bloqueio da conclusão com decisão pendente.
- `git diff --check`: aprovado.

## Limites

A migração `20261019113000_service_extras_approval.sql` foi executada somente no PostgreSQL efêmero dos testes. Não foi aplicada ao Supabase conectado nem à produção. Aceitar um extra não gera pagamento, cobrança, retenção, split, nota ou repasse. Não houve publicação, aprovação administrativa ou alteração de profissões. A branch `main`, o aplicativo público, as 82 profissões e a identidade azul e branca permanecem preservados.
