# Entrega — prévia dos links autenticados filtrados

Horário da validação: 25/10/2026, 21:14 (America/Boa_Vista).

## Resultado funcional

- Cliente e prestador podem usar **Ver links** em **Meus serviços** para conferir na tela o conteúdo exato que será copiado, baixado ou compartilhado.
- A prévia inclui todos os resultados autorizados correspondentes à busca, ao filtro e à ordem atuais, inclusive além da paginação visível.
- Em uma lista com 12 resultados filtrados, os 12 links aparecem mesmo quando somente 10 cartões estão visíveis.
- Cada linha contém somente uma URL com o código do serviço; descrições livres, participantes, mensagens, propostas e valores ficam fora da prévia.
- O controle alterna entre **Ver links** e **Ocultar links**, atualiza `aria-expanded` e fecha automaticamente quando o usuário muda busca, filtro, ordenação, paginação ou sessão.
- Abrir a prévia de links fecha a prévia de resumos e vice-versa, evitando conteúdos concorrentes na tela.
- A ação reutiliza somente os registros autorizados já carregados, sem nova consulta ou alteração dos pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- A instalação limpa removeu o Chromium do cache; a primeira execução dirigida não iniciou cenários funcionais. O navegador oficial foi restaurado pelo espelho da Microsoft usado automaticamente pelo Playwright.
- Teste dirigido após a restauração: 2 cenários aprovados, em desktop e viewport Android.
- Os testes confirmaram 12 links para 12 resultados filtrados apesar de somente 10 cartões visíveis, exclusão do serviço fora do filtro e ausência de descrição privada.
- Os testes confirmaram o estado acessível do botão, o fechamento da prévia ao trocar o filtro e a preservação dos registros.
- `npm run test:all`: 13 testes Node/PostgreSQL e 230 testes Playwright aprovados; total de 243 testes.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade e segurança

A entrega não altera Supabase Auth, RLS, esquema, migrações ou consultas ao banco. Os links continuam exigindo login e uma conta participante do serviço.

## Arquivos alterados

- `auth-teste/index.html`
- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-25-PREVIA-LINKS-AUTENTICADOS-FILTRADOS.md`
