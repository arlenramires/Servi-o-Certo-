# Entrega — execução, conclusão confirmada e avaliações

Data local: 19/10/2026, 05h25 (Boa Vista/Manaus). Branch `desenvolvimento-login-supabase`.

## Implementação

- Somente o prestador atribuído pode iniciar o serviço, e apenas depois do aceite da versão atual do acordo pelas duas partes.
- O prestador registra a solicitação de conclusão; o serviço permanece em andamento até o cliente confirmar.
- Somente a confirmação do cliente altera o pedido para `concluido`.
- Início, solicitação e confirmação ficam registrados em histórico imutável e visível apenas aos participantes.
- Após a conclusão, cliente e prestador podem avaliar a outra parte uma única vez, com nota de 1 a 5 e comentário opcional.
- A interface informa explicitamente que conclusão não significa pagamento ou repasse realizado.

## Evidências de teste

- `npm ci --ignore-scripts`: concluído.
- Primeira execução de `npm run test:all`: os 5 testes de banco passaram, mas a interface não iniciou porque o Chromium do Playwright não estava instalado neste runtime.
- Correção: instalado Chromium 141 / Playwright build 1194 e repetida a suíte completa.
- Segunda execução de `npm run test:all`: 5 testes Node/PostgreSQL e 28 testes Playwright aprovados, sendo 14 desktop e 14 no viewport Pixel 7.
- Casos cobertos: início sem acordo bilateral, ator indevido, eventos duplicados, pedido de conclusão, confirmação exclusiva do cliente, histórico imutável, avaliação bilateral, tentativa de reescrita e acesso de terceiro.
- `git diff --check`: aprovado.

## Limites

A migração `20261019093000_service_execution_completion_ratings.sql` foi executada somente no PostgreSQL efêmero dos testes. Não foi aplicada ao Supabase conectado nem à produção. Não houve publicação, cobrança, pagamento, repasse ou aprovação administrativa. A branch `main`, a versão pública, as 82 profissões e a identidade azul e branca permanecem preservadas.
