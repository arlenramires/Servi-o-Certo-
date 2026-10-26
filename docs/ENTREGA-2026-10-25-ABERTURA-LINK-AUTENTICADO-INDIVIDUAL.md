# Entrega — abertura do link autenticado individual

Horário da validação: 25/10/2026, 23:24 (America/Boa_Vista).

## Resultado funcional

- Cada cartão autorizado em **Meus serviços** possui a ação **Abrir link**.
- A ação abre o endereço autenticado do serviço em uma nova aba, preservando a tela de origem.
- A nova aba usa `noopener noreferrer` para não receber acesso à janela que originou a navegação.
- O URL contém somente o código do serviço e continua exigindo login com uma conta participante.
- Descrição livre, participantes, mensagens, propostas e valores não entram no endereço.
- O link reutiliza o registro já autorizado e carregado, sem nova consulta nem alteração do pedido.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- A instalação limpa removeu o Chromium do cache; o navegador oficial foi restaurado pelo espelho da Microsoft usado automaticamente pelo Playwright.
- Teste dirigido: 2 cenários aprovados, em desktop e viewport Android.
- `npm run test:all`: 13 testes Node/PostgreSQL e 236 testes Playwright aprovados; total de 249 testes.
- Os testes abriram efetivamente a nova aba, confirmaram o URL exato com o código, `target="_blank"` e `rel="noopener noreferrer"`.
- Os testes confirmaram a ausência da descrição privada no endereço, nenhuma chamada adicional de API e nenhuma mutação dos registros.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade e segurança

A entrega não altera Supabase Auth, RLS, esquema, migrações ou consultas ao banco. O acesso pelo link permanece protegido pelas mesmas regras de conta participante do serviço.

## Arquivos alterados

- `auth-teste/app.js`
- `auth-teste/style.css`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-25-ABERTURA-LINK-AUTENTICADO-INDIVIDUAL.md`
