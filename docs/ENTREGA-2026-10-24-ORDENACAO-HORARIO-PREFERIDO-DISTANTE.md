# Entrega — ordenação por horário preferido mais distante

Validada em 24/10/2026 às 00h38 (Boa Vista).

## Funcionalidade

- `Meus serviços` agora oferece a ordenação `Horário preferido mais distante`.
- Preferências com data válida aparecem da mais distante para a mais próxima.
- Datas inválidas ou ausentes permanecem ao final, com desempate pelos pedidos mais recentes.
- A ordenação funciona junto com a busca e não modifica os serviços nem apresenta a preferência como agendamento confirmado.
- Um horário inválido em pedido aberto deixa de interromper a renderização do restante da lista.

## Evidências

- Teste focal Playwright: 2 cenários aprovados, em desktop e viewport Android.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 174 testes Playwright aprovados, totalizando 187 testes.
- O teste controlado confirmou a ordem decrescente de três preferências válidas, a posição final de uma data inválida e de um valor ausente, a combinação com busca e a imutabilidade dos registros.
- A validação PostgreSQL ocorreu somente no banco isolado da suíte; nenhuma migração ou mutação foi aplicada ao projeto Supabase conectado.

## Compatibilidade e segurança

- O changelog oficial do Supabase foi consultado em 24/10/2026. As mudanças anunciadas para cifras TLS antigas e exposição automática de novas tabelas não afetam esta entrega, que não cria tabelas nem altera comunicação ou políticas.
- Nenhuma chave privilegiada foi lida ou exposta.
- `main`, o protótipo público, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Não houve publicação, cobrança, pagamento, aprovação, concessão administrativa ou acesso ao banco de produção.

## Limites

- A interface usa apenas os serviços já retornados ao usuário pelas regras existentes.
- O campo continua sendo uma preferência informada, não confirmação de agenda ou pagamento.
