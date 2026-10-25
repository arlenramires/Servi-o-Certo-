# Entrega — download dos links autenticados filtrados

Horário da validação: 25/10/2026, 17:28 (America/Boa_Vista).

## Resultado funcional

- Cliente e prestador podem usar **Baixar links** em **Meus serviços** para gerar um arquivo `.txt` com os links de todos os serviços que correspondem à busca, ao filtro e à ordem atuais.
- O arquivo inclui os resultados autorizados além da paginação visível; em uma lista de 12 resultados filtrados, os 12 links são exportados mesmo quando somente 10 cartões aparecem na tela.
- O nome do arquivo identifica filtro, busca, ordenação não padrão e data local, por exemplo `servico-certo-links-autenticados-concluidos-pintor-mais-antigos-2026-10-25.txt`.
- Cada linha contém somente uma URL com o código do serviço. A abertura continua exigindo login e a participação da conta no pedido.
- Descrições livres, participantes, mensagens, propostas e valores não entram no arquivo.
- O botão fica desabilitado quando o filtro não tem resultados, e a ação reutiliza somente os registros autorizados já carregados, sem nova consulta ou alteração dos pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- O Chromium oficial do Playwright foi restaurado porque a instalação limpa removeu o executável local; a primeira tentativa não iniciou cenários funcionais.
- Teste dirigido após a restauração: 2 cenários aprovados, em desktop e viewport Android.
- Os testes confirmaram arquivo com 12 links para 12 resultados filtrados apesar de somente 10 cartões visíveis, nome contextual, exclusão de serviço fora do filtro e ausência de descrição privada.
- Os testes também confirmaram que o download não realizou nova chamada de API nem mudou o estado dos pedidos.
- `npm run test:all`: 13 testes Node/PostgreSQL e 224 testes Playwright aprovados; total de 237 testes.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade verificada

O changelog oficial do Supabase foi conferido em 25/10/2026. A mudança de concessões padrão para tabelas novas, prevista para 30/10/2026, e a remoção de cifras TLS antigas, prevista para 10/11/2026, não interferem neste download local. A entrega não altera Auth, RLS, esquema ou consultas ao banco.

## Arquivos alterados

- `auth-teste/index.html`
- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-25-DOWNLOAD-LINKS-AUTENTICADOS-FILTRADOS.md`
