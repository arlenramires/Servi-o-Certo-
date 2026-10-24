# Entrega: filtro por horário preferido após sete dias

Validada em 24/10/2026 às 02:24 (America/Boa_Vista).

## Funcionalidade entregue

- A lista de serviços de cliente e prestador ganhou o filtro **Horário preferido após 7 dias**.
- O filtro considera somente preferências válidas posteriores às próximas 168 horas.
- Preferências dentro da janela de sete dias, passadas, inválidas ou ausentes ficam fora do resultado.
- O recorte pode ser combinado com a busca existente, atualiza a quantidade exibida e não realiza nova consulta nem altera os pedidos.
- A interface continua tratando o valor como preferência, sem apresentá-lo como agendamento confirmado.

## Evidências

- Teste direcionado Playwright: 2 cenários aprovados (desktop e viewport Android).
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 178 testes Playwright aprovados, totalizando 191 testes.
- O teste de interface usa API controlada e confirma os limites temporais, a combinação com busca, a contagem e a imutabilidade dos registros.
- Os testes PostgreSQL foram executados em ambiente isolado; nenhum banco conectado foi alterado.

## Compatibilidade e segurança

- O changelog atual do Supabase foi conferido. As mudanças anunciadas de cifras TLS e de exposição de tabelas não afetam este filtro local.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.
- Não houve publicação em produção, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

O horário continua sendo uma preferência informada no pedido. Esta entrega não confirma agenda, disponibilidade do profissional ou pagamento.
