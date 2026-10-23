# Entrega — busca pela data do horário preferido

Validada em 23/10/2026 às 14:46 (America/Boa_Vista).

## Funcionalidade

- “Meus serviços” passa a localizar pedidos autorizados pela data do horário preferido.
- A busca reconhece tanto o formato brasileiro `dd/mm/aaaa` quanto o formato ISO `aaaa-mm-dd`.
- O rótulo da busca esclarece que a data pode ser a da solicitação ou a da preferência.
- O termo continua combinável com situação, ordenação, carregamento progressivo e exportação.
- Preferências ausentes ou inválidas não geram correspondência de data nem interrompem a lista.
- A busca reutiliza os pedidos já carregados e não realiza consulta adicional nem modifica serviços.

## Evidências

- `npm ci --ignore-scripts`: aprovado.
- Cenário direcionado: 2 testes Playwright aprovados, em desktop e viewport Android.
- `npm run test:all`: 13 testes Node/PostgreSQL e 162 testes Playwright aprovados (175 no total).
- O cenário novo cobre duas datas preferidas distintas, formatos brasileiro e ISO, combinação com o filtro de horário preferido e uma preferência inválida.
- A comparação integral dos dados controlados confirma que os pedidos não são modificados.
- Os testes PostgreSQL foram executados no ambiente isolado; esta entrega não cria migração nem altera o banco conectado.

## Incidente de validação resolvido

- Após a instalação limpa, o executável do Chromium não estava presente no cache do Playwright.
- O endereço primário de download retornou arquivos vazios; Chromium, FFMPEG e headless shell foram restaurados pelo espelho alternativo do próprio instalador.
- A primeira suíte integral apontou quatro expectativas antigas do texto do rótulo da busca; elas foram alinhadas à nova descrição e a suíte integral seguinte passou sem falhas.
- A primeira transferência do arquivo grande de testes para o GitHub foi truncada pelo limite de saída intermediário; a inconsistência foi detectada na conferência pós-publicação e corrigida com o conteúdo integral antes da validação final do CI.

## Preservações e limites

- A busca opera somente sobre serviços já autorizados pelo Supabase e pelas políticas RLS existentes.
- Um horário preferido não representa agenda confirmada, pagamento ou disponibilidade do profissional.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- A alteração local preexistente no arquivo público `index.html` foi preservada e excluída desta entrega.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
