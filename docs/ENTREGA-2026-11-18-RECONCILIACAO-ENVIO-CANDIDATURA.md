# Entrega: reconciliação de envio incerto da candidatura

Data local: 18/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `c6e360e93092e9f72eb527e8bea3c401f693dfdc`  
CI da base: execução #280, concluída com sucesso  
Commit funcional: `8a33d21242a7493a525a711eca1e068a25f44acf`  
CI do commit funcional: execução #281 (`44342065340`), concluída com sucesso

## Funcionalidade entregue

O envio de candidatura a prestador agora reconcilia respostas incertas da inserção. Quando o Supabase retorna erro depois de a escrita poder ter sido efetivada, a interface consulta as candidaturas atuais do cliente:

- se a profissão está registrada, confirma o resultado, atualiza a lista e limpa o formulário sem executar uma segunda inserção;
- se a profissão não está registrada, preserva profissão e experiência e orienta uma tentativa manual;
- se a própria reconciliação não pode ser consultada, preserva o rascunho e bloqueia novo envio até a atualização manual recuperar o estado real;
- o conflito conhecido `23505` continua exibindo a candidatura concorrente e preservando o rascunho;
- nenhuma candidatura, profissão ou documento é aprovado e nenhuma permissão de prestador ou administrador é concedida.

A implementação segue a referência oficial do Supabase para `insert`, que retorna o erro separadamente, e ramifica pelo código estruturado nos casos conhecidos: <https://supabase.com/docs/reference/javascript/insert> e <https://supabase.com/docs/guides/api/handling-errors-in-supabase-js>.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido em Chromium:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "reconciles an uncertain provider application insert"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - comprovou uma única chamada `insert`, candidatura pendente visível, formulário limpo somente após reconciliação e painel de prestador fechado.
3. `npm run test:all`: 475/475 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 462/462 testes Playwright, em desktop e viewport Android.
4. O primeiro teste dirigido não iniciou porque o Chromium correspondente ao Playwright não estava no cache do runtime. `npx playwright install chromium` recuperou o navegador pelo espelho secundário autorizado após o CDN primário devolver um arquivo vazio; a repetição dirigida e a suíte completa passaram. Não houve falha do produto.

Os testes de interface usam uma API controlada e não são homologação contra contas reais. Os 13 testes de banco usam PostgreSQL efêmero e isolado. Nesta rodada não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade visual azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma aprovação automática foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 16 dias desta entrega. Esta melhoria reduz o risco de candidaturas duplicadas por timeout, mas não reduz o escopo restante. O prazo segue em risco real enquanto dependem de decisão ou acesso externo: proprietário administrador verificado, revisão jurídica dos acordos, contas reais para homologação conectada, credenciais de gateway sandbox, e-mails/push, GPS, LGPD, Android e preparação de produção. Ações necessárias: confirmar o proprietário por canal seguro, escolher e liberar o gateway exclusivamente em sandbox, concluir a revisão jurídica e reservar contas/ambiente de homologação sem dados de produção.
