# Entrega — cópia após rejeição do arquivo e do texto em lote

Horário da validação: 25/10/2026, 12:56 (America/Boa_Vista).

## Resultado funcional

- Quando o aparelho recusa o arquivo `.txt` e também a tentativa seguinte de compartilhar os resumos como texto, a interface copia automaticamente o mesmo conteúdo seguro.
- A confirmação agora informa **Arquivo e texto recusados** e registra quantos resumos foram copiados, distinguindo essa recuperação da indisponibilidade total do compartilhamento.
- Cancelamentos voluntários continuam interrompendo o fluxo sem copiar conteúdo sem intenção do usuário.
- A cópia preserva o contexto do conjunto — filtro, presença de busca, ordenação e quantidade — e todos os resultados autorizados além da paginação visível.
- Descrição livre, participantes, mensagens, propostas e valores permanecem excluídos.
- A recuperação usa somente os dados autorizados já carregados, sem nova consulta ou modificação dos pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- Teste dirigido: 2 cenários aprovados, em desktop e viewport Android.
- Os testes confirmaram duas tentativas de compartilhamento recusadas, seguidas pela cópia do mesmo conteúdo seguro.
- A cópia continha 12 resumos filtrados, inclusive resultados além dos dez cartões visíveis, e excluiu o serviço fora do filtro e todas as descrições privadas.
- `npm run test:all`: 13 testes Node/PostgreSQL e 218 testes Playwright aprovados; total de 231 testes.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade verificada

O changelog oficial do Supabase foi conferido em 25/10/2026. A alteração de concessões padrão para novas tabelas, prevista para 30/10/2026, e a remoção de cifras TLS antigas, prevista para 10/11/2026, não interferem nesta recuperação local nem exigem mudança de banco.

## Arquivos alterados

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-25-COPIA-APOS-DUPLA-REJEICAO-RESUMOS.md`
