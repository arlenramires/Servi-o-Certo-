# Entrega — status de deslocamento do prestador

Validada em 19/10/2026 às 14h10 (Boa Vista).

## Funcionalidade

- Depois do aceite bilateral do acordo, o prestador pode registrar **Estou a caminho**.
- A chegada só pode ser registrada depois do status a caminho.
- Cliente e prestador visualizam **Prestador está a caminho** ou **Prestador informou que chegou ao local** na execução do serviço.
- Somente o prestador atribuído pode registrar os eventos; o cliente não recebe esses controles.
- Repetir o mesmo evento é idempotente e não duplica o histórico.
- A trilha reutiliza a tabela protegida de eventos de execução e permanece visível somente aos participantes pela RLS existente.

## Evidências

- `npm ci --ignore-scripts`: concluído.
- `npm run test:all`: aprovado.
  - 12/12 testes Node/PostgreSQL.
  - 52/52 testes Playwright, sendo 26 desktop e 26 no viewport Android.
- Banco isolado: bloqueio antes do aceite bilateral, evento inválido, chegada fora de ordem, tentativa do cliente, idempotência e histórico completo.
- Interface controlada: sequência dos dois botões, argumentos enviados, visualização pelo cliente e ausência de controles de prestador no perfil do cliente.

O primeiro endereço de download do Chromium retornou um arquivo vazio; o instalador usou o espelho oficial seguinte e concluiu. A suíte integral passou depois da instalação.

## Limites e preservação

Esta etapa informa estados manuais. Não coleta GPS, não compartilha localização contínua e não calcula ETA; essas funções exigem consentimento, política de privacidade e integração própria.

A migração `20261019181000_provider_arrival_status.sql` foi executada somente no PostgreSQL efêmero dos testes. Não foi aplicada ao Supabase conectado ou à produção. Não houve publicação, pagamento, gasto, aprovação de documentos/profissões ou concessão de administrador. A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
