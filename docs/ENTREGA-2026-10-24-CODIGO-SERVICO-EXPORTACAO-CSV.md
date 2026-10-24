# Entrega: código do serviço na exportação CSV

Validada em 24/10/2026 às 04:23 (America/Boa_Vista).

## Funcionalidade entregue

- O arquivo gerado por **Baixar lista** agora inclui a coluna **Código** como primeira coluna.
- Cada linha leva o identificador exato do serviço autorizado, facilitando atendimento, conferência e localização posterior.
- A exportação continua respeitando busca, filtro e ordenação atuais, inclusive os resultados ainda não expandidos visualmente.
- Nenhuma consulta adicional é realizada e nenhum pedido é alterado.

## Evidências

- Teste direcionado Playwright: 2 cenários aprovados (desktop e viewport Android).
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 180 testes Playwright aprovados, totalizando 193 testes.
- O teste de interface usa API controlada e confirma o cabeçalho, os códigos exatos, a exclusão de serviço fora do filtro, a ordem e a neutralização de fórmula de planilha.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Compatibilidade e segurança

- O changelog atual do Supabase foi conferido. As mudanças anunciadas de cifras TLS e de exposição automática de tabelas não afetam esta exportação local.
- O CSV reutiliza exclusivamente os serviços já retornados pelas regras de acesso existentes e mantém UTF-8 com BOM.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.
- Não houve publicação em produção, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

O CSV serve para consulta e organização. Ele não é recibo, comprovante de pagamento ou documento com assinatura certificada.
