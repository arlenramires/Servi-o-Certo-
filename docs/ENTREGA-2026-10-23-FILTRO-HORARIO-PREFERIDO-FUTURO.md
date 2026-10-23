# Entrega — filtro por horário preferido futuro

Validada em 23/10/2026 às 14:00 (America/Boa_Vista).

## Funcionalidade

- “Meus serviços” passa a oferecer o filtro “Horário preferido futuro”.
- A opção informa quantos serviços autorizados possuem uma preferência posterior ao instante atual.
- O recorte continua combinável com busca, ordenação, carregamento progressivo e exportação.
- Horários passados, inválidos ou ausentes ficam fora do recorte, sem interromper a lista.
- A interface continua identificando o horário como preferência, sem apresentá-lo como agendamento confirmado.
- O filtro reutiliza os pedidos já carregados e não realiza consulta adicional nem modifica serviços.

## Evidências

- `npm ci --ignore-scripts`: aprovado.
- `npm run test:all`: 13 testes Node/PostgreSQL e 160 testes Playwright aprovados (173 no total).
- O cenário novo cobre duas preferências futuras, uma passada, uma inválida e um serviço sem preferência, além de contagem e combinação com busca.
- O cenário é executado em desktop e viewport Android com API controlada e confirma que os pedidos não são modificados.
- Os testes PostgreSQL são executados no ambiente isolado; esta entrega não cria migração nem altera o banco conectado.

## Incidente de runtime resolvido

- A instalação limpa removeu os navegadores do cache local.
- O endereço primário do Playwright retornou arquivos vazios; Chromium, FFMPEG e headless shell foram recuperados pelo espelho alternativo do próprio instalador.
- O cenário direcionado e a suíte integral passaram após a restauração.

## Preservações e limites

- O filtro opera somente sobre serviços já autorizados pelo Supabase e pelas políticas RLS existentes.
- Uma preferência futura não confirma agenda, pagamento ou disponibilidade do profissional.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- A alteração local preexistente no arquivo público `index.html` foi preservada e excluída desta entrega.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
