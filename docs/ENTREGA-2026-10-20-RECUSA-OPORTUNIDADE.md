# Entrega — recusa privada de oportunidade

Validada em 20/10/2026 às 08h52 (Boa Vista).

## Funcionalidade

- O prestador pode selecionar “Não tenho interesse” em um chamado compatível.
- A recusa remove o chamado somente da fila daquele prestador.
- O pedido continua aberto e disponível para outros profissionais elegíveis.
- O mesmo prestador não consegue aceitar diretamente um chamado que recusou.
- A operação é idempotente e deixa um registro privado com prestador, chamado e horário.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 76 testes Playwright aprovados em desktop e viewport Android.
- PostgreSQL efêmero: elegibilidade, idempotência, registro privado, bloqueio de aceite posterior, isolamento entre prestadores e bloqueio para usuário anônimo.
- Interface com API controlada: o prestador recusa a oportunidade, recebe confirmação explícita e vê a própria lista atualizada sem falso cancelamento do pedido.

## Limites e preservação

Esta entrega não cancela pedidos, não penaliza o prestador e não cria cobrança, pagamento ou repasse. Nenhuma aprovação administrativa ou concessão de administrador foi realizada.

A migração `20261020133000_provider_request_declines.sql` foi preparada e testada somente no PostgreSQL efêmero. Não foi aplicada ao Supabase conectado. A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
