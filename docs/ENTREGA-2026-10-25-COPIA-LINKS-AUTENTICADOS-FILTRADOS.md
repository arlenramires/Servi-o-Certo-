# Entrega — cópia em lote dos links autenticados filtrados

Horário da validação: 25/10/2026, 16:33 (America/Boa_Vista).

## Resultado funcional

- Cliente e prestador podem usar **Copiar links** em **Meus serviços** para obter, em uma única ação, os links de todos os serviços que correspondem à busca, ao filtro e à ordem atuais.
- A cópia inclui os resultados autorizados além da paginação visível; em uma lista de 12 resultados filtrados, os 12 links são copiados mesmo quando apenas 10 cartões estão exibidos.
- Cada URL contém somente o código do serviço. A abertura continua exigindo login e a participação da conta no pedido, com resposta neutra quando o registro não está disponível para ela.
- Descrições livres, participantes, mensagens, propostas e valores não entram no conteúdo copiado.
- O botão é desabilitado quando o filtro não tem resultados e a ação reutiliza somente os registros autorizados já carregados, sem nova consulta ou alteração dos pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- O Chromium de teste foi restaurado após a instalação limpa remover o executável local.
- Teste dirigido: 2 cenários aprovados, em desktop e viewport Android.
- Os testes confirmaram 12 links copiados para 12 resultados filtrados, apesar de apenas 10 cartões visíveis, exclusão de um serviço fora do filtro e ausência da descrição privada.
- Os testes também confirmaram que a ação não realizou nova chamada de API nem mudou o estado dos pedidos.
- `npm run test:all`: 13 testes Node/PostgreSQL e 222 testes Playwright aprovados; total de 235 testes.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade verificada

O changelog oficial do Supabase foi conferido em 25/10/2026. A remoção de cifras TLS 1.2 antigas, prevista para 10/11/2026, não interfere nesta função local; navegadores atuais e o cliente usado pelo projeto negociam configurações modernas. A entrega não altera Auth, RLS, esquema ou consultas ao banco.

## Arquivos alterados

- `auth-teste/index.html`
- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-25-COPIA-LINKS-AUTENTICADOS-FILTRADOS.md`
