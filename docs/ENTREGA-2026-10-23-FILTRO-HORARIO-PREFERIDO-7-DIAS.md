# Entrega — filtro de horário preferido nos próximos sete dias

Validada em 23/10/2026 às 23:18 (America/Boa_Vista).

## Funcionalidade

- “Meus serviços” passa a oferecer o filtro “Horário preferido nos próximos 7 dias”.
- A opção informa quantos serviços autorizados possuem preferência posterior ao instante atual e dentro das próximas 168 horas.
- O recorte continua combinável com busca, ordenação, carregamento progressivo e exportação.
- Preferências passadas, posteriores à janela, inválidas ou ausentes ficam fora do recorte.
- O texto continua identificando a data como preferência, não como agendamento confirmado.
- O filtro reutiliza os pedidos já carregados e não realiza consulta adicional nem modifica serviços.

## Evidências

- `npm ci --ignore-scripts`: aprovado.
- Cenário direcionado: 2 testes Playwright aprovados em desktop e viewport Android.
- `npm run test:all`: 13 testes Node/PostgreSQL e 172 testes Playwright aprovados (185 no total).
- O cenário novo cobre preferências em uma hora e seis dias, uma preferência após sete dias, horário passado, valor inválido, contagem, combinação com busca e preservação integral dos pedidos controlados.
- Os testes de interface usaram API controlada e os testes PostgreSQL foram executados no ambiente isolado; esta entrega não cria migração nem altera o Supabase conectado.

## Validação do ambiente

- A instalação limpa removeu o Chromium do cache. O navegador, o FFMPEG e o headless shell foram restaurados pelo espelho alternativo do Playwright antes dos testes.
- O changelog atual do Supabase foi consultado. As mudanças de TLS, exposição de novas tabelas e APIs de gestão não afetam este filtro local, que não altera esquema nem conexão.

## Preservações e limites

- O filtro opera somente sobre serviços já autorizados pelo Supabase e pelas políticas RLS existentes.
- Preferência dentro de sete dias não significa disponibilidade, agendamento confirmado, pagamento ou aceite profissional.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- A alteração local preexistente no arquivo público `index.html` foi preservada e excluída desta entrega.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
