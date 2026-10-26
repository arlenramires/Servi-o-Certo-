# Entrega — cópia individual na prévia de links

Horário da validação: 26/10/2026, 01:28 (America/Boa_Vista).

## Resultado funcional

- Cada URL exibido em **Ver links** possui uma ação própria **Copiar**.
- A ação alcança todos os resultados autorizados correspondentes à busca, filtro e ordem atuais, inclusive além da paginação visível.
- O conteúdo copiado contém somente o endereço com o código do serviço e continua exigindo login com uma conta participante.
- A confirmação deixa claro que o acesso permanece protegido pela conta.
- Descrição livre, participantes, mensagens, propostas e valores continuam fora da cópia.
- A ação reutiliza os registros já autorizados e carregados, sem nova consulta nem alteração dos pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- Teste dirigido: 2 cenários aprovados (desktop e Android), cobrindo a cópia do 12º link filtrado apesar de somente 10 cartões visíveis, conteúdo exato, mensagem de confirmação e ausência de dados privados.
- `npm run test:all`: 249 testes aprovados — 13 testes Node/Postgres e 236 testes Playwright.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade e segurança

A entrega não altera Supabase Auth, RLS, esquema, migrações ou consultas ao banco. O acesso por cada link permanece protegido pelas mesmas regras de conta participante do serviço.

## Arquivos alterados

- `auth-teste/app.js`
- `auth-teste/style.css`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-26-COPIA-INDIVIDUAL-PREVIA-LINKS.md`
