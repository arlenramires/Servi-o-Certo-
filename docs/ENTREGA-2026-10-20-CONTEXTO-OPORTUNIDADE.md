# Entrega — contexto seguro da oportunidade

Validada em 20/10/2026 às 11h09 (Boa Vista).

## Funcionalidade

- Antes de aceitar, o prestador vê cidade/UF, indicação de urgência e horário preferido do chamado.
- A fila continua limitada a profissionais disponíveis, verificados, compatíveis e na região atendida.
- A resposta não expõe descrição, identidade do cliente, endereço ou coordenadas.
- Aceitar e recusar continuam usando as regras atômicas e privadas já existentes.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 80 testes Playwright aprovados em desktop e viewport Android.
- PostgreSQL efêmero: mesma elegibilidade da fila anterior, campos mínimos corretos e bloqueio da RPC para usuário anônimo.
- Interface com API controlada: contexto exibido antes do aceite, sem dados privados do cliente.
- O Chromium ausente no cache desta cópia foi reinstalado pelo espelho alternativo; a suíte completa foi repetida e aprovada.

## Limites e preservação

A migração `20261020151500_available_request_context.sql` foi preparada e testada somente no PostgreSQL efêmero. Não foi aplicada ao Supabase conectado. Nenhuma publicação, aprovação administrativa ou operação financeira foi realizada.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
