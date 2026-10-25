# Entrega — cópia após rejeição do arquivo e do texto individual

Horário da validação: 25/10/2026, 14:54 (America/Boa_Vista).

## Resultado funcional

- Quando o aparelho recusa o arquivo `.txt` de um resumo individual e também a tentativa seguinte de compartilhar o mesmo resumo como texto, a interface copia automaticamente o conteúdo seguro.
- A confirmação agora informa **Arquivo e texto recusados**, distinguindo essa recuperação da recusa apenas do compartilhamento em texto e da indisponibilidade total do recurso nativo.
- Cancelamentos voluntários continuam interrompendo o fluxo sem copiar conteúdo sem intenção do usuário.
- Código, profissão, situação, região, urgência, datas válidas e link autenticado são preservados.
- Descrição livre, participantes, mensagens, propostas e valores permanecem excluídos.
- A recuperação usa somente os dados autorizados já carregados, sem nova consulta ou modificação do pedido.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- O Chromium de teste foi restaurado após a instalação limpa remover o executável local.
- Teste dirigido: 2 cenários aprovados, em desktop e viewport Android.
- Os testes confirmaram duas tentativas de compartilhamento recusadas, seguidas pela cópia do mesmo resumo seguro.
- A cópia continha o código e a região do serviço autorizado e excluía a descrição privada.
- `npm run test:all`: 13 testes Node/PostgreSQL e 220 testes Playwright aprovados; total de 233 testes.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade verificada

O changelog oficial do Supabase foi conferido em 25/10/2026. A alteração de concessões padrão para novas tabelas, prevista para 30/10/2026, e a remoção de cifras TLS antigas, prevista para 10/11/2026, não interferem nesta recuperação local nem exigem mudança de banco.

## Arquivos alterados

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-25-COPIA-APOS-DUPLA-REJEICAO-RESUMO-INDIVIDUAL.md`
