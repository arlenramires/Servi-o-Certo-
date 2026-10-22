# Entrega — quantidade de serviços por etapa

Validada em 22/10/2026 às 15:50 (America/Boa_Vista).

## Funcionalidade

- A lista “Meus serviços” permite escolher 10, 25 ou 50 resultados por etapa.
- `Mostrar mais` acrescenta a quantidade escolhida e mantém a contagem restante.
- `Mostrar menos` volta ao tamanho selecionado, sem impor novamente o padrão de dez itens.
- A preferência visual é reiniciada com segurança ao trocar de conta.
- Os controles da lista formam uma grade responsiva no celular, sem extrapolar a largura disponível.
- A mudança é somente de apresentação: não exclui, reordena no banco nem modifica pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 126 testes Playwright aprovados.
- O novo cenário automatizado cria trinta pedidos, troca de dez para 25 resultados, carrega os cinco restantes, recolhe novamente para 25 e confirma que a coleção original permaneceu intacta.
- Os testes de interface foram executados em desktop e viewport Android com API controlada.
- Os testes PostgreSQL passaram no ambiente isolado; esta entrega não cria migração nem altera banco conectado.

## Incidentes de runtime resolvidos

- Após a instalação limpa, o cache do Chromium estava ausente; o navegador foi reinstalado no ambiente isolado.
- A primeira repetição revelou que o novo conjunto de controles excedia a largura no viewport móvel e tornava instáveis os cliques de paginação. O cabeçalho foi reorganizado em grade responsiva e os três cenários afetados passaram antes da repetição integral da suíte.

## Preservações e limites

- A consulta continua limitada aos cem serviços mais recentes já autorizados pela API; paginação completa no servidor permanece uma evolução futura.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
