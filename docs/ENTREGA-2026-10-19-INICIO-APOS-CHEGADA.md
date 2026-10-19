# Entrega — chegada obrigatória antes do início

Validada em 19/10/2026 às 17h44 (Boa Vista).

## Funcionalidade

- O prestador precisa registrar **Estou a caminho** e **Cheguei ao local** antes de iniciar o serviço.
- O botão **Iniciar serviço** permanece oculto até a chegada.
- A regra também é aplicada no banco, impedindo que uma chamada direta à API contorne a interface.
- A operação continua restrita ao prestador designado e depende do aceite bilateral do acordo.

## Evidências

- `npm ci --ignore-scripts`.
- `npm run test:all`.
- Banco isolado: tentativa de início antes da chegada bloqueada pelo código `SE010`; sequência completa e idempotência preservadas.
- Interface controlada: botão ausente antes e durante o deslocamento, liberado somente após a chegada.

O Chromium reutilizado pelo ambiente apresentou um arquivo ICU corrompido e impediu a abertura dos testes de interface. O navegador foi reinstalado pelo espelho oficial seguinte do Playwright e a suíte completa passou na repetição.

## Limites e preservação

Esta entrega usa somente os estados manuais já existentes. Não coleta GPS, não calcula ETA, não movimenta pagamento e não confirma presença do cliente.

A migração `20261019214500_require_arrival_before_service_start.sql` foi preparada para execução posterior e testada somente no PostgreSQL efêmero. Não foi aplicada ao Supabase conectado ou à produção. A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
