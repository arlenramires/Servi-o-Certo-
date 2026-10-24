# Entrega — filtro de horário preferido amanhã

Validada em 23/10/2026 às 22:10 (America/Boa_Vista).

## Funcionalidade

- “Meus serviços” passa a oferecer o filtro “Horário preferido amanhã”.
- A opção informa quantos serviços autorizados possuem uma preferência dentro do próximo dia local do navegador.
- O intervalo usa o início de amanhã e o início de depois de amanhã, sem assumir duração fixa de 24 horas.
- O recorte continua combinável com busca, ordenação, carregamento progressivo e exportação.
- Datas de hoje, de depois de amanhã, inválidas ou ausentes ficam fora do recorte.
- O texto continua identificando a data como preferência, não como agendamento confirmado.
- O filtro reutiliza os pedidos já carregados e não realiza consulta adicional nem modifica serviços.

## Evidências

- `npm ci --ignore-scripts`: aprovado.
- Cenário direcionado: 2 testes Playwright aprovados em desktop e viewport Android.
- `npm run test:all`: 13 testes Node/PostgreSQL e 170 testes Playwright aprovados (183 no total).
- O cenário novo cobre duas preferências amanhã, os limites de hoje e depois de amanhã, valor inválido, contagem, combinação com busca, rótulo sem confirmação e preservação integral dos pedidos controlados.
- Os testes de interface usaram API controlada e os testes PostgreSQL foram executados no ambiente isolado; esta entrega não cria migração nem altera o Supabase conectado.

## Validação do ambiente

- A instalação limpa removeu o Chromium do cache. O navegador, o FFMPEG e o headless shell foram restaurados pelo espelho alternativo do Playwright antes dos testes.
- O changelog atual do Supabase foi consultado. As mudanças de TLS, exposição de novas tabelas e APIs de gestão não afetam este filtro local, que não altera esquema nem conexão.

## Preservações e limites

- O filtro opera somente sobre serviços já autorizados pelo Supabase e pelas políticas RLS existentes.
- Preferência para amanhã não significa disponibilidade, agendamento confirmado, pagamento ou aceite profissional.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- A alteração local preexistente no arquivo público `index.html` foi preservada e excluída desta entrega.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
