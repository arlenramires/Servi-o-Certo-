# Entrega — links clicáveis na prévia filtrada

Horário da validação: 26/10/2026, 00:35 (America/Boa_Vista).

## Resultado funcional

- Cada URL mostrado em **Ver links** agora pode ser aberto diretamente.
- A prévia continua incluindo todos os resultados autorizados correspondentes à busca, filtro e ordem atuais, inclusive além da paginação visível.
- Cada destino abre em uma nova aba com `noopener noreferrer`, sem acesso à janela de origem.
- Os URLs contêm somente o código do serviço e continuam exigindo login com uma conta participante.
- Descrição livre, participantes, mensagens, propostas e valores continuam fora da prévia.
- A ação reutiliza os registros já autorizados e carregados, sem nova consulta nem alteração dos pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- Teste dirigido da prévia clicável: 2 cenários aprovados (desktop e Android), cobrindo 12 links filtrados apesar de somente 10 cartões visíveis, abertura real em nova aba, URL exata, proteção `noopener noreferrer`, ausência de dados privados e encerramento da prévia ao trocar o filtro.
- `npm run test:all`: 249 testes aprovados — 13 testes Node/Postgres e 236 testes Playwright.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade e segurança

A entrega não altera Supabase Auth, RLS, esquema, migrações ou consultas ao banco. O acesso por cada link permanece protegido pelas mesmas regras de conta participante do serviço.

## Arquivos alterados

- `auth-teste/app.js`
- `auth-teste/style.css`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-26-LINKS-CLICAVEIS-PREVIA-FILTRADA.md`
