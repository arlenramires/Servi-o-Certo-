# Entrega — ordenação dos próprios serviços por cidade e UF

Validada em 23/10/2026 às 09:36 (America/Boa_Vista).

## Funcionalidade

- “Meus serviços” passa a oferecer a ordenação “Cidade/UF (A–Z)”.
- A comparação usa a localidade `pt-BR`, tratando acentos de forma adequada para a ordenação alfabética.
- Quando cidade e UF são iguais, os pedidos mais recentes aparecem primeiro.
- A ordenação continua combinável com busca, filtros, carregamento progressivo e exportação, sem nova consulta e sem modificar pedidos.

## Evidências

- `npm ci --ignore-scripts`: aprovado.
- `npm run test:all`: 13 testes Node/PostgreSQL e 152 testes Playwright aprovados (165 no total).
- O cenário novo cobre cidades com acentos, regiões distintas, dois pedidos na mesma cidade/UF, desempate pela data, combinação com serviços ativos e combinação com busca.
- O cenário é executado em desktop e viewport Android com API controlada e confirma que os pedidos não são modificados.
- Os testes PostgreSQL são executados no ambiente isolado; esta entrega não cria migração nem altera o banco conectado.

## Incidente de runtime resolvido

- A instalação limpa removeu o Chromium do cache local, como previsto pelo processo de validação.
- A primeira execução direcionada não iniciou os testes por ausência do executável; nenhuma asserção funcional chegou a falhar.
- Chromium, FFMPEG e headless shell foram restaurados pelo espelho alternativo do Playwright depois que o endereço primário retornou um arquivo vazio.
- O cenário direcionado e, depois, a suíte integral foram executados com sucesso.

## Preservações e limites

- A ordenação opera somente sobre serviços já autorizados pelo Supabase e pelas políticas RLS existentes.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- A alteração local preexistente no arquivo público `index.html` foi preservada e excluída desta entrega.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
