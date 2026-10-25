# Entrega — recuperação do compartilhamento em lote após rejeição do arquivo

Horário da validação: 25/10/2026, 12:31 (America/Boa_Vista).

## Resultado funcional

- Quando o aparelho anuncia suporte ao compartilhamento de arquivos, mas recusa o `.txt` com os resumos filtrados, a interface tenta automaticamente compartilhar o mesmo conteúdo como texto.
- A confirmação agora informa **Arquivo recusado** e registra que os resumos foram enviados como texto, deixando explícita a recuperação realizada.
- Cancelamentos voluntários continuam interrompendo o fluxo sem iniciar outra tentativa.
- O conteúdo alternativo preserva o contexto do conjunto — filtro, presença de busca, ordenação e quantidade — e todos os resumos autorizados além da paginação visível.
- Descrição livre, participantes, mensagens, propostas e valores permanecem excluídos.
- A recuperação usa somente os dados autorizados já carregados, sem nova consulta ou modificação dos pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- Teste dirigido: 2 cenários aprovados, em desktop e viewport Android.
- Os testes confirmaram duas tentativas: primeiro o arquivo recusado e depois o conteúdo seguro em texto.
- O texto recuperado continha 12 resumos filtrados, inclusive resultados além dos dez cartões visíveis, e excluiu o serviço fora do filtro e todas as descrições privadas.
- `npm run test:all`: 13 testes Node/PostgreSQL e 216 testes Playwright aprovados; total de 229 testes.
- O primeiro espelho do Playwright devolveu arquivos inválidos; o espelho alternativo restaurou Chromium e FFmpeg antes das validações de interface.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade verificada

O changelog oficial do Supabase foi conferido em 25/10/2026. A alteração de concessões padrão para novas tabelas, prevista para 30/10/2026, e a remoção de cifras TLS antigas, prevista para 10/11/2026, não interferem nesta recuperação local nem exigem mudança de banco.

## Arquivos alterados

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-25-RECUPERACAO-COMPARTILHAMENTO-RESUMOS-ARQUIVO.md`
