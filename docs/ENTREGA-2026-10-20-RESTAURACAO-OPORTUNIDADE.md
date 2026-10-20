# Entrega — restauração de oportunidade ocultada

Validada em 20/10/2026 às 10h13 (Boa Vista).

## Funcionalidade

- O prestador pode consultar os próprios chamados ocultados que ainda estão abertos e compatíveis.
- A ação “Mostrar novamente” remove somente a recusa ativa daquele prestador.
- O chamado volta à fila pessoal e pode ser aceito normalmente, caso continue disponível.
- Recusas de outros prestadores permanecem invisíveis e não podem ser restauradas por terceiros.
- Restaurar não aceita, cancela ou altera o pedido e não cria cobrança.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 78 testes Playwright aprovados em desktop e viewport Android.
- PostgreSQL efêmero: listagem privada, isolamento entre prestadores, restauração pelo proprietário, retorno à fila e bloqueio para usuário anônimo.
- Interface com API controlada: o prestador oculta, revisa e restaura a oportunidade, recebendo confirmação explícita.
- O Chromium ausente no início foi reinstalado pelo espelho alternativo do Playwright; a suíte completa foi repetida e aprovada.

## Limites e preservação

A migração `20261020140500_restore_declined_requests.sql` foi preparada e testada somente no PostgreSQL efêmero. Não foi aplicada ao Supabase conectado. Nenhuma aprovação administrativa, publicação ou operação financeira foi realizada.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
