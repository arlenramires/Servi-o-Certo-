# Entrega — compartilhamento do link autenticado individual

Horário da validação: 25/10/2026, 22:24 (America/Boa_Vista).

## Resultado funcional

- Cada cartão autorizado em **Meus serviços** possui a ação **Compartilhar link**.
- Em aparelhos compatíveis, o compartilhamento nativo recebe título, orientação de acesso e o URL autenticado do serviço.
- Quando o compartilhamento nativo não está disponível ou recusa a ação, a interface copia automaticamente o mesmo URL.
- O URL contém somente o código do serviço e continua exigindo login com uma conta participante.
- Descrição livre, participantes, mensagens, propostas e valores não entram no compartilhamento.
- A ação reutiliza o registro já autorizado e carregado, sem nova consulta nem alteração do pedido.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- A instalação limpa removeu o Chromium do cache; a primeira execução dirigida não iniciou cenários funcionais. O navegador oficial foi restaurado pelo espelho da Microsoft usado automaticamente pelo Playwright.
- Teste dirigido após a restauração: 4 cenários aprovados, cobrindo compartilhamento nativo e cópia alternativa em desktop e viewport Android.
- `npm run test:all`: 13 testes Node/PostgreSQL e 234 testes Playwright aprovados; total de 247 testes.
- Os testes confirmaram que somente título seguro, orientação de acesso e URL com o código chegam ao compartilhamento; a descrição privada ficou ausente.
- Os testes confirmaram que a indisponibilidade do compartilhamento copia exatamente o URL, sem nova chamada de API nem mutação dos registros.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade e segurança

A entrega não altera Supabase Auth, RLS, esquema, migrações ou consultas ao banco. O acesso pelo link permanece protegido pelas mesmas regras de conta participante do serviço.

## Arquivos alterados

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-25-COMPARTILHAMENTO-LINK-AUTENTICADO-INDIVIDUAL.md`
