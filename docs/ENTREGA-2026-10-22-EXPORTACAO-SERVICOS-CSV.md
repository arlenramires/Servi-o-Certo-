# Entrega — exportação segura da lista filtrada de serviços

Validada em 22/10/2026 às 17:13 (America/Boa_Vista).

## Funcionalidade

- A lista “Meus serviços” oferece a ação `Baixar lista` para cliente e prestador.
- O arquivo CSV contém todos os serviços correspondentes à busca, situação e ordenação atuais, inclusive resultados ainda não expandidos visualmente por `Mostrar mais`.
- A exportação reutiliza somente os registros já retornados pela consulta autorizada da conta; não realiza consulta adicional e não inclui itens fora do filtro atual.
- Células são delimitadas e escapadas, quebras de linha são normalizadas e valores iniciados por `=`, `+`, `-` ou `@`, inclusive após espaços ou tabulação, recebem neutralização contra fórmulas ao abrir em planilhas.
- O botão permanece desabilitado quando o filtro não tem resultados, evitando arquivo vazio ou reaproveitamento de dados de uma visualização anterior.
- O arquivo usa UTF-8 com BOM e o nome `servicos-filtrados.csv`, preservando acentos em aplicativos de planilha comuns.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 128 testes Playwright aprovados.
- O novo cenário automatizado combina filtro de concluídos com três pedidos, comprova a exclusão do pedido ativo, verifica a presença e a ordem dos dois resultados filtrados, valida a neutralização de uma fórmula maliciosa e confirma o bloqueio do botão quando a busca não encontra resultados.
- Os testes de interface foram executados em desktop e viewport Android com API controlada.
- Os testes PostgreSQL passaram no ambiente isolado; esta entrega não cria migração nem altera banco conectado.

## Incidente de runtime resolvido

- A instalação limpa removeu o cache local do Chromium. A primeira execução confirmou os 13 testes Node/PostgreSQL, mas os 128 cenários de interface não puderam iniciar por ausência do executável.
- O Chromium de teste foi reinstalado no ambiente isolado e o comando integral `npm run test:all` foi repetido, então aprovado com 141 testes no total.

## Preservações e limites

- A exportação respeita o limite existente da consulta aos cem serviços mais recentes autorizados pela API; paginação completa no servidor permanece uma evolução futura.
- O CSV é uma conveniência para consulta e organização; não é recibo, comprovante de pagamento nem documento com assinatura certificada.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
