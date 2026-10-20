# Entrega — ajuste da região no pedido aberto

Validada em 20/10/2026 às 19h58 (Boa Vista).

## Funcionalidade

- O cliente pode corrigir cidade e UF de um pedido próprio enquanto ele permanece aberto e sem prestador.
- A fila passa a considerar imediatamente a nova região para encontrar somente profissionais elegíveis daquela localidade.
- Coordenadas anteriores são removidas quando cidade ou UF mudam, evitando cálculo de distância com uma posição incompatível.
- Depois do aceite, a região fica congelada por este fluxo.

## Segurança e evidências

- A operação protegida verifica autenticação, propriedade, estado `aberto` e ausência de prestador sob bloqueio de linha.
- Cidade aceita de 2 a 100 caracteres; UF é normalizada e exige exatamente duas letras.
- Prestadores, terceiros e usuários anônimos não podem alterar a região do cliente.
- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 90 testes Playwright aprovados em desktop e viewport Android.
- PostgreSQL efêmero: alteração e normalização da região, descarte de coordenadas antigas, validação de dados, bloqueio do prestador e congelamento após o aceite.
- Interface com API controlada: cidade/UF atualizadas no cartão e enviadas somente pela RPC protegida.

## Ocorrência resolvida

O cache do Chromium estava ausente na primeira tentativa. O navegador foi reinstalado pelo espelho alternativo do Playwright e a suíte completa foi executada no mesmo processo, com aprovação integral.

## Limites e preservação

A migração `20261020235500_client_open_request_location.sql` foi preparada e testada somente no PostgreSQL efêmero. Não foi aplicada ao Supabase conectado. Nenhuma publicação, aprovação administrativa ou operação financeira foi realizada.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
