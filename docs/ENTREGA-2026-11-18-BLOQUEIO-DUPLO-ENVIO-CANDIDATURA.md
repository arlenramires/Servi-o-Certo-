# Entrega: bloqueio de duplo envio da candidatura

Data local: 18/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `86e0d08c1ed1e3c72f2b150a342ac9cc15db9d69`  
CI da base: execução #287 (`44369633134`), concluída com sucesso  
Commit funcional: a registrar após a atualização protegida da branch  
CI do commit funcional: a registrar após a execução remota

## Funcionalidade entregue

O formulário de candidatura agora descarta um segundo evento de envio enquanto a primeira solicitação ainda está em andamento.

- o botão **Solicitar análise** fica indisponível desde o início da primeira operação;
- um segundo `submit` simultâneo não inicia outra inserção;
- a primeira resposta continua exibindo a candidatura pendente e limpando o formulário;
- a defesa não depende apenas da restrição de unicidade do banco;
- nenhuma profissão ou candidatura é aprovada e nenhum acesso de prestador ou administrador é concedido.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "client double submit starts only one provider application insert"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos mantiveram o botão ocupado, produziram exatamente uma chamada `insert`, criaram uma única candidatura pendente e mantiveram o painel de prestador fechado.
3. `npm run test:all`: 481/481 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 468/468 testes Playwright, desktop e viewport Android.

## Problema de runtime detectado e resolvido

Durante uma execução longa atravessada por uma nova rodada, o cache do Chromium foi removido e os testes restantes falharam antes de abrir a página. Os traces confirmaram `Executable doesn't exist`, sem falha do produto. Chromium, FFmpeg e headless shell foram reinstalados pelo espelho secundário autorizado e `npm run test:all` foi repetido integralmente com 481/481 aprovações. Nenhum commit foi publicado antes da recuperação.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma aprovação automática foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 16 dias desta entrega. O prazo segue em risco real por dependências externas: proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica e reservar ambiente e contas de homologação sem dados de produção.
