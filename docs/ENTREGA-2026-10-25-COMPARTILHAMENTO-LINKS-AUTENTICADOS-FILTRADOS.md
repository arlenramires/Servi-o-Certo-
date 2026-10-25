# Entrega — compartilhamento dos links autenticados filtrados

Horário da validação: 25/10/2026, 19:46 (America/Boa_Vista).

## Resultado funcional

- Cliente e prestador podem usar **Compartilhar links** em **Meus serviços** para enviar um arquivo `.txt` com os links de todos os serviços que correspondem à busca, ao filtro e à ordem atuais.
- O arquivo inclui os resultados autorizados além da paginação visível; em uma lista de 12 resultados filtrados, os 12 links são compartilhados mesmo quando somente 10 cartões aparecem na tela.
- O nome do arquivo identifica filtro, busca, ordenação não padrão e data local, reutilizando o mesmo formato do download de links.
- Cada linha contém somente uma URL com o código do serviço. A abertura continua exigindo login e a participação da conta no pedido.
- Se o aparelho não oferece compartilhamento nativo, a interface copia automaticamente os mesmos links e informa a alternativa usada.
- Descrições livres, participantes, mensagens, propostas e valores não entram no conteúdo. A ação reutiliza somente os registros autorizados já carregados, sem nova consulta ou alteração dos pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- A instalação limpa removeu o Chromium do cache; a primeira execução dirigida não iniciou cenários funcionais. O navegador oficial foi restaurado pelo espelho da Microsoft usado automaticamente pelo Playwright.
- Teste dirigido após a restauração: 4 cenários aprovados, dois comportamentos em desktop e viewport Android.
- Os testes confirmaram arquivo com 12 links para 12 resultados filtrados apesar de somente 10 cartões visíveis, nome contextual, exclusão de serviço fora do filtro e ausência de descrição privada.
- Os testes também confirmaram cópia dos links quando o compartilhamento nativo não está disponível, nenhuma chamada adicional de API e nenhum estado de pedido alterado.
- `npm run test:all`: 13 testes Node/PostgreSQL e 228 testes Playwright aprovados; total de 241 testes.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade e segurança

A entrega não altera Supabase Auth, RLS, esquema, migrações ou consultas ao banco. Os links contêm somente o código do serviço e continuam submetidos ao login e à autorização da conta participante.

## Arquivos alterados

- `auth-teste/index.html`
- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-25-COMPARTILHAMENTO-LINKS-AUTENTICADOS-FILTRADOS.md`
