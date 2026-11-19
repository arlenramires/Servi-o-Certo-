# Entrega: bloqueio de resposta duplicada ao ajuste

Data local: 19/11/2026 15:29:37, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `a3af30cbd8ca3cb20b445af20904362a2031e83a`  
CI da base: execução #321 (`44570988329`), concluída com sucesso  
Commit funcional: `2c576aca48f949bcfcde51f632293917b12055c1`  
CI do commit funcional: execução #322 (`44598448599`), concluída com sucesso

## Funcionalidade entregue

A resposta do prestador a um ajuste solicitado antes da conclusão agora descarta um segundo evento enquanto a primeira chamada ainda aguarda resposta.

- **Registrar ajuste realizado** fica indisponível desde o início da operação;
- um segundo evento simultâneo não inicia outra chamada `respond_completion_adjustment`;
- a descrição do atendimento permanece preenchida enquanto a resposta está pendente;
- após a confirmação, somente uma resposta é registrada e o cliente pode revisar novamente a conclusão;
- a ação não movimenta pagamento, cobrança ou repasse.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "provider double action responds to completion adjustment only once"`;
   - resultado: 2/2 aprovados, desktop e viewport Android;
   - dois eventos simultâneos mantiveram o botão bloqueado, preservaram o texto e produziram exatamente uma RPC e uma resposta.
3. `npm run test:all`: 515/515 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 502/502 testes Playwright, desktop e viewport Android.
4. GitHub Actions: execução #322 concluída com sucesso sobre o commit funcional.

O primeiro teste dirigido foi impedido antes de executar o produto porque o Chromium 1194 não estava disponível no runtime. `npx playwright install chromium` recuperou o navegador pelo espelho autorizado após o CDN principal devolver arquivo vazio; o teste dirigido e a suíte integral foram então repetidos e aprovados.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os testes de banco usam PostgreSQL efêmero e isolado. Nesta entrega não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança, repasse ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma cobrança, aprovação automática ou concessão de administrador foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 15 dias desta entrega. O prazo segue em risco real por dependências externas e pelo volume de homologação restante: proprietário administrador verificado, revisão jurídica, gateway e credenciais sandbox, contas reais para homologação conectada, e-mails, push, GPS, LGPD, Android e preparação de produção. Ações necessárias: confirmar o proprietário por canal seguro, liberar o gateway sandbox, concluir a revisão jurídica e reservar ambiente e contas de homologação sem dados de produção.
