# Entrega — recuperação do compartilhamento após rejeição de arquivo

Horário da validação: 25/10/2026, 03:18 (America/Boa_Vista).

## Resultado funcional

- Quando o aparelho anuncia suporte ao compartilhamento de arquivos, mas rejeita o arquivo `.txt` por incompatibilidade do destino, a interface tenta automaticamente compartilhar o mesmo resumo seguro como texto.
- Um `AbortError` continua sendo tratado como cancelamento voluntário: a interface não inicia outra tentativa sem a intenção do usuário.
- O conteúdo alternativo mantém somente código, profissão, situação, cidade/UF, urgência e data. Descrição livre, participantes, mensagens, propostas e valores permanecem fora do resumo.
- A recuperação é local ao navegador: não faz nova consulta nem altera o pedido.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- Teste dirigido da recuperação: 2 cenários aprovados (desktop e viewport Android).
- `npm run test:all`: 13 testes Node/PostgreSQL e 200 testes Playwright aprovados; total de 213 testes.
- A primeira tentativa do teste de interface encontrou o Chromium ausente no runtime. O navegador do Playwright foi restaurado e tanto o teste dirigido quanto a suíte integral passaram depois da correção.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade verificada

O changelog do Supabase foi conferido em 25/10/2026. As mudanças próximas relativas a concessões padrão da Data API e remoção de cifras TLS antigas não afetam esta alteração exclusivamente local de interface.

## Arquivos alterados

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-25-RECUPERACAO-COMPARTILHAMENTO-ARQUIVO.md`
