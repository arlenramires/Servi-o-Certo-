# Entrega — cópia segura após rejeição do compartilhamento

Horário da validação: 25/10/2026, 04:14 (America/Boa_Vista).

## Resultado funcional

- Quando a API de compartilhamento existe, mas rejeita o envio em texto por incompatibilidade ou indisponibilidade do destino, a interface copia automaticamente o mesmo resumo seguro.
- A interface confirma que houve a recuperação por cópia, em vez de apresentar uma mensagem genérica de falha.
- Um `AbortError` continua sendo tratado como cancelamento voluntário e não aciona a cópia sem intenção do usuário.
- O resumo mantém somente código, profissão, situação, cidade/UF, urgência, datas válidas e link autenticado. Descrição livre, participantes, mensagens, propostas e valores permanecem excluídos.
- A recuperação usa somente os dados autorizados já carregados no navegador: não consulta nem altera o pedido.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- Testes dirigidos: 4 cenários aprovados, cobrindo rejeição e cancelamento em desktop e viewport Android.
- `npm run test:all`: 13 testes Node/PostgreSQL e 204 testes Playwright aprovados; total de 217 testes.
- A primeira tentativa dos testes dirigidos encontrou o Chromium ausente depois da instalação limpa. O navegador do Playwright foi restaurado e os testes dirigidos e integrais passaram.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade verificada

O changelog oficial do Supabase foi conferido em 25/10/2026. A alteração de concessões padrão para novas tabelas, prevista para 30/10/2026, não afeta tabelas existentes; a remoção de cifras TLS antigas, prevista para 10/11/2026, não altera esta recuperação local de interface.

## Arquivos alterados

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-25-COPIA-APOS-REJEICAO-COMPARTILHAMENTO.md`
