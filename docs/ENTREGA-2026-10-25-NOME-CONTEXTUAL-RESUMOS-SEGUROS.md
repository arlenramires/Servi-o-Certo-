# Entrega — nome contextual dos resumos seguros filtrados

Horário da validação: 25/10/2026, 08:59 (America/Boa_Vista).

## Resultado funcional

- O arquivo `.txt` baixado ou compartilhado em lote agora identifica no nome o filtro ativo, a busca informada, a ordenação não padrão e a data local.
- Um resultado concluído, pesquisado por “Pintor” e ordenado pelos mais antigos, por exemplo, gera `servico-certo-resumos-seguros-concluidos-pintor-mais-antigos-2026-10-25.txt`.
- A busca é normalizada sem acentos ou caracteres especiais e limitada a 40 caracteres; a ordenação padrão por mais recentes é omitida para manter o nome conciso.
- O conteúdo do arquivo continua reunindo somente os resumos seguros já autorizados e carregados. Descrição livre, participantes, mensagens, propostas e valores permanecem excluídos.
- A alteração não faz nova consulta, não modifica pedidos e não altera o fluxo alternativo de cópia quando o compartilhamento nativo não está disponível.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- Testes dirigidos: 4 cenários aprovados em desktop e viewport Android, cobrindo download com filtro, busca e ordenação e compartilhamento com filtro.
- O teste de download confirmou exatamente `servico-certo-resumos-seguros-concluidos-pintor-mais-antigos-2026-10-25.txt`; o teste de compartilhamento confirmou o filtro no nome e a data local.
- `npm run test:all`: 13 testes Node/PostgreSQL e 212 testes Playwright aprovados; total de 225 testes.
- O Chromium removido pela instalação limpa foi restaurado antes dos testes de interface; o espelho alternativo concluiu a instalação após resposta inválida do primeiro espelho.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade verificada

O changelog oficial do Supabase foi conferido em 25/10/2026. A remoção de cifras TLS antigas prevista para 10/11/2026 não interfere nesta composição local do nome do arquivo nem requer mudança de banco.

## Arquivos alterados

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-25-NOME-CONTEXTUAL-RESUMOS-SEGUROS.md`
