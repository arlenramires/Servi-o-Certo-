# Entrega — ordenação dos próprios serviços pela etapa do fluxo

Validada em 23/10/2026 às 08:33 (America/Boa_Vista).

## Funcionalidade

- “Meus serviços” passa a oferecer a ordenação “Etapa do serviço”.
- A lista segue a sequência do fluxo: aguardando profissional, aceito, em andamento, concluído e cancelado.
- Dentro da mesma etapa, os pedidos mais recentes aparecem primeiro.
- A ordenação continua combinável com busca, filtros, carregamento progressivo e exportação, sem nova consulta e sem modificar pedidos.

## Evidências

- `npm ci --ignore-scripts`: aprovado.
- `npm run test:all`: 13 testes Node/PostgreSQL e 150 testes Playwright aprovados (163 no total).
- O novo cenário cobre todas as cinco situações, dois pedidos abertos com datas diferentes, combinação com serviços ativos e combinação com busca.
- O cenário é executado em desktop e viewport Android com API controlada e confirma que os pedidos não são modificados.
- Os testes PostgreSQL são executados no ambiente isolado; esta entrega não cria migração nem altera o banco conectado.

## Incidente de runtime resolvido

- A instalação limpa removeu o Chromium do cache local, como previsto pelo processo de validação.
- O Chromium, FFMPEG e o headless shell foram restaurados pelo espelho alternativo autorizado do Playwright depois que o endereço primário retornou arquivos vazios.
- A suíte integral foi executada uma vez após a restauração e todos os 163 testes passaram.

## Preservações e limites

- A ordenação opera somente sobre serviços já autorizados pelo Supabase e pelas políticas RLS existentes.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
