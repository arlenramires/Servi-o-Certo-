# Entrega — contexto nos resumos seguros filtrados

Horário da validação: 25/10/2026, 10:46 (America/Boa_Vista).

## Resultado funcional

- A prévia, a cópia, o download e o compartilhamento em lote dos resumos seguros agora começam com um contexto legível do conjunto.
- O cabeçalho informa o filtro selecionado, se há busca aplicada, a ordenação e a quantidade total de resumos, inclusive quando parte dos resultados está além da paginação visível.
- O termo pesquisado não é repetido no conteúdo: o cabeçalho registra somente **Busca aplicada: Sim** ou **Não**, reduzindo exposição desnecessária ao compartilhar o arquivo.
- Todas as quatro ações reutilizam exatamente o mesmo conteúdo contextual, evitando diferença entre o que foi conferido, copiado, baixado ou compartilhado.
- Os blocos individuais continuam contendo somente código, profissão, situação, cidade/UF, urgência, datas válidas e link autenticado. Descrição livre, participantes, mensagens, propostas e valores permanecem excluídos.
- A alteração usa somente os dados autorizados já carregados, sem nova consulta ou modificação dos pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- Testes dirigidos: 8 cenários aprovados, cobrindo prévia, cópia, download e compartilhamento em desktop e viewport Android.
- Os testes confirmaram filtro **Concluídos**, busca aplicada, ordenação **Mais antigos** e quantidade 12 no download, sem repetir `Busca: Pintor` no conteúdo.
- Prévia, cópia e compartilhamento também confirmaram o mesmo contexto, 12 resumos seguros, resultados além dos dez cartões visíveis e exclusão de descrições privadas.
- `npm run test:all`: 13 testes Node/PostgreSQL e 214 testes Playwright aprovados; total de 227 testes.
- O Chromium removido pela instalação limpa foi restaurado antes dos testes de interface; o espelho alternativo concluiu a instalação após resposta inválida do primeiro espelho.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade verificada

O changelog oficial do Supabase foi conferido em 25/10/2026. A mudança de concessões padrão da Data API prevista para 30/10/2026 e a remoção de cifras TLS antigas prevista para 10/11/2026 não interferem neste cabeçalho local nem requerem mudança de banco.

## Arquivos alterados

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-25-CONTEXTO-RESUMOS-SEGUROS-FILTRADOS.md`
