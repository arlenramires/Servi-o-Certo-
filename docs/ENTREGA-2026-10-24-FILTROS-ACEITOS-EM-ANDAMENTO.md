# Entrega: filtros por serviços aceitos e em andamento

Validada em 24/10/2026 às 03:12 (America/Boa_Vista).

## Funcionalidade entregue

- A lista **Meus serviços** ganhou filtros separados para **Aceitos** e **Em andamento**.
- **Aceitos** mostra somente pedidos que já possuem profissional, mas cuja execução ainda não começou.
- **Em andamento** mostra somente serviços cuja execução já foi iniciada.
- Cada opção informa sua quantidade e pode ser combinada com a busca existente.
- A filtragem reutiliza os serviços autorizados já carregados, sem nova consulta nem alteração dos pedidos.

## Evidências

- Teste direcionado Playwright: 2 cenários aprovados (desktop e viewport Android).
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 180 testes Playwright aprovados, totalizando 193 testes.
- O teste de interface usa API controlada e confirma contagens, isolamento entre as etapas, combinação com busca e imutabilidade dos registros.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Compatibilidade e segurança

- O changelog atual do Supabase foi conferido. As mudanças anunciadas de cifras TLS e de exposição automática de tabelas não afetam estes filtros locais.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.
- Não houve publicação em produção, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

Os filtros refletem a etapa persistida do serviço. Eles não confirmam pagamento, disponibilidade, presença no local ou conclusão.
