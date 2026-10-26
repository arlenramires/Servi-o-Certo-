# Entrega — compartilhamento individual na prévia de links

Horário da validação: 26/10/2026, 02:32 (America/Boa_Vista).

## Resultado funcional

- Cada URL exibido em **Ver links** possui uma ação própria **Compartilhar**.
- A ação alcança todos os resultados autorizados correspondentes à busca, filtro e ordem atuais, inclusive além da paginação visível.
- O compartilhamento envia somente o endereço com o código do serviço e continua exigindo login com uma conta participante.
- Quando o recurso nativo não está disponível ou recusa o envio, a interface reutiliza a cópia segura já existente.
- Descrição livre, participantes, mensagens, propostas e valores continuam fora do conteúdo compartilhado.
- A ação reutiliza os registros já autorizados e carregados, sem nova consulta nem alteração dos pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- Teste dirigido: 2 cenários aprovados (desktop e Android), cobrindo o compartilhamento do 12º link filtrado apesar de somente 10 cartões visíveis, título, mensagem e URL exatos, ausência de dados privados e nenhuma consulta ou mutação adicional.
- `npm run test:all`: 249 testes aprovados — 13 testes Node/Postgres e 236 testes Playwright.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade e segurança

A entrega não altera Supabase Auth, RLS, esquema, migrações ou consultas ao banco. O acesso por cada link permanece protegido pelas mesmas regras de conta participante do serviço.

## Arquivos alterados

- `auth-teste/app.js`
- `auth-teste/style.css`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-26-COMPARTILHAMENTO-INDIVIDUAL-PREVIA-LINKS.md`
