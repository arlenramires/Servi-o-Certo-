# Entrega — filtro de serviços sem horário preferido

Validada em 23/10/2026 às 18:15 (America/Boa_Vista).

## Funcionalidade

- “Meus serviços” passa a oferecer o filtro “Sem horário preferido”.
- A opção informa quantos serviços autorizados ainda não possuem preferência de data e hora.
- O recorte continua combinável com busca, ordenação, carregamento progressivo e exportação.
- Registros com uma preferência preenchida, inclusive um valor inválido recebido da fonte, não são classificados como ausência de horário.
- O filtro reutiliza os pedidos já carregados e não realiza consulta adicional nem modifica serviços.

## Evidências

- `npm ci --ignore-scripts`: aprovado.
- Cenários direcionados: 4 testes Playwright aprovados em desktop e viewport Android, cobrindo o filtro novo e a busca por data preferida em fuso diferente.
- `npm run test:all`: 13 testes Node/PostgreSQL e 166 testes Playwright aprovados (179 no total).
- O cenário novo cobre horário nulo, campo ausente, preferência válida e valor preenchido inválido, além da contagem, combinação com busca e preservação integral dos pedidos controlados.
- Os testes PostgreSQL foram executados no ambiente isolado; esta entrega não cria migração nem altera o banco conectado.

## Incidentes de validação resolvidos

- A instalação limpa removeu o Chromium do cache; o navegador, o FFMPEG e o headless shell foram restaurados pelo espelho alternativo do Playwright antes da execução dos testes.
- A primeira suíte integral revelou que um teste anterior usava uma data brasileira fixa, mas o Chromium desta rodada operava em `Asia/Seoul` e exibia o dia seguinte. O cenário foi tornado independente de fuso usando a mesma data localizada pela interface; os testes direcionados e a suíte integral passaram depois da correção.

## Preservações e limites

- O filtro opera somente sobre serviços já autorizados pelo Supabase e pelas políticas RLS existentes.
- Ausência de preferência não significa disponibilidade imediata, agendamento, pagamento ou aceite profissional.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- A alteração local preexistente no arquivo público `index.html` foi preservada e excluída desta entrega.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
