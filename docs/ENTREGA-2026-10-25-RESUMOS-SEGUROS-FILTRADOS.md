# Entrega — download em lote dos resumos seguros filtrados

Horário da validação: 25/10/2026, 05:00 (America/Boa_Vista).

## Resultado funcional

- A área “Meus serviços” agora oferece a ação **Baixar resumos**.
- O arquivo `.txt` reúne todos os serviços correspondentes à busca, ao filtro e à ordenação atuais, inclusive resultados além da paginação visível.
- Cada bloco reutiliza o resumo seguro individual: código, profissão, situação, cidade/UF, urgência, datas válidas e link autenticado.
- Descrição livre, participantes, mensagens, propostas e valores permanecem excluídos.
- A ação fica desabilitada quando não há resultados e usa somente os dados autorizados já carregados, sem nova consulta ou alteração dos pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- Teste dirigido: 2 cenários aprovados, em desktop e viewport Android.
- O teste confirmou 12 resumos filtrados no arquivo, incluindo dois além dos dez cartões visíveis, e excluiu o serviço fora do filtro e todas as descrições privadas.
- `npm run test:all`: 13 testes Node/PostgreSQL e 206 testes Playwright aprovados; total de 219 testes.
- O Chromium removido pela instalação limpa foi restaurado antes dos testes de interface.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade verificada

O changelog oficial do Supabase foi conferido em 25/10/2026. A alteração de concessões padrão para novas tabelas, prevista para 30/10/2026, não afeta tabelas existentes; a remoção de cifras TLS antigas, prevista para 10/11/2026, não altera este download local.

## Arquivos alterados

- `auth-teste/index.html`
- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-25-RESUMOS-SEGUROS-FILTRADOS.md`
