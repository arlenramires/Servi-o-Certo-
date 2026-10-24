# Entrega: ordenação no nome da exportação CSV

Validada em 24/10/2026 às 10:08 (America/Boa_Vista).

## Funcionalidade entregue

- O arquivo CSV passa a identificar no nome a ordenação ativa quando ela difere do padrão **Mais recentes**.
- Uma lista de concluídos pesquisada por **Reparo concluído** e ordenada por **Mais antigos** gera `servicos-concluidos-reparo-concluido-mais-antigos-2026-10-24.csv`.
- O critério é normalizado sem acentos ou caracteres impróprios, usando a mesma proteção aplicada ao filtro e à busca.
- Com a ordenação padrão, o formato anterior do nome é mantido para evitar informação redundante.
- O conteúdo continua respeitando busca, filtro e ordenação, sem consulta adicional ou alteração dos serviços.

## Evidências

- Teste dirigido Playwright: 2 cenários aprovados, em desktop e viewport Android.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 180 testes Playwright aprovados, totalizando 193 testes.
- O teste de interface usa API controlada e confirma o nome padrão, o nome com busca e ordenação, o conteúdo restrito ao resultado esperado e a ausência de mutações nos pedidos e mensagens.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Runtime

- O Chromium removido pela instalação limpa foi restaurado antes dos testes de interface.
- O cenário dirigido e a suíte completa passaram após a restauração.

## Compatibilidade e segurança

- O critério vem da opção de ordenação já apresentada ao usuário e passa por normalização restritiva.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.
- Não houve publicação em produção, alteração de banco conectado, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

O nome identifica o critério escolhido, mas o conteúdo da planilha continua sendo a fonte exata da sequência exportada. A ordem padrão **Mais recentes** não é repetida no nome.
