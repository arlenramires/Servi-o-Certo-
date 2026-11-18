# Entrega: confirmação da candidatura sem recarga da conta

Data local: 18/11/2026, America/Boa_Vista  
Branch: `desenvolvimento-login-supabase`  
Base verificada antes da alteração: `a2f97a2cc08730fc524d6d12e5b6e7a7a3897bfd`  
CI da base: execução #282 (`44342794992`), concluída com sucesso  
Commits funcionais: `08bde46a4eb098aa6c4676fd98241a4b3353ad9c` e correção de integridade `b4ccc4961be2ef8579c61bac56408aa335b63e5f`  
CI validante: execução #284 (`44359899080`), concluída com sucesso

## Funcionalidade entregue

Uma candidatura confirmada agora aparece imediatamente como pendente sem recarregar toda a conta. A confirmação não depende de novas leituras de perfil, catálogo, pedidos ou candidaturas depois que a inserção já retornou sucesso.

- a lista local recebe a nova profissão como `Pendente`;
- a profissão recém-enviada fica indisponível para nova seleção;
- profissão e experiência são limpas explicitamente, com foco devolvido ao início do formulário;
- a escrita ocorre uma única vez e nenhuma leitura adicional é necessária no caminho confirmado;
- o caminho de resultado incerto continua reconciliando o estado real antes de confirmar;
- nenhuma profissão ou candidatura é aprovada e nenhum acesso de prestador ou administrador é concedido.

A mudança usa o comportamento documentado do `supabase-js`: `insert()` retorna `{ error }` e não devolve a linha por padrão sem `.select()`. Referência: <https://supabase.com/docs/reference/javascript/insert>.

## Evidências

1. `npm ci --ignore-scripts`: concluído com sucesso.
2. Cenário dirigido:
   - comando: `npx playwright test tests/ui/flows.spec.js --grep "confirmed provider application remains visible without reloading the account"`;
   - resultado final: 2/2 aprovados, desktop e viewport Android;
   - comprovou uma inserção, apenas as leituras iniciais de perfil e candidaturas, lista pendente visível, formulário limpo e painel de prestador fechado mesmo com uma falha de perfil preparada para qualquer recarga indevida.
3. `npm run test:all`: 477/477 aprovados:
   - 13/13 testes Node/PostgreSQL isolado;
   - 464/464 testes Playwright, desktop e viewport Android.
4. CI #284 no commit `b4ccc4961be2ef8579c61bac56408aa335b63e5f`: `npm ci --ignore-scripts`, testes Node/PostgreSQL e Playwright concluídos com sucesso.

## Problemas detectados e resolvidos nesta rodada

- O Chromium do Playwright estava ausente no cache do runtime após `npm ci`; o primeiro teste não chegou ao produto. A instalação pelo espelho secundário autorizado recuperou o navegador depois que o CDN primário devolveu arquivo vazio.
- A primeira execução real do novo cenário mostrou que desabilitar a opção selecionada não limpava seu valor automaticamente. A implementação passou a zerar explicitamente a profissão; o cenário dirigido e a suíte completa passaram depois da correção.
- O CI #283 (`44359395192`) falhou porque o transporte inicial truncou os dois maiores blobs, deixando `tests/ui/flows.spec.js` inválido no GitHub apesar de o arquivo local testado estar íntegro. Os blobs foram reenviados integralmente, os SHAs foram conferidos contra o Git local, a suíte completa foi repetida com 477/477 aprovações e o CI sucessor #284 passou. Nenhum código de produção ou banco foi acionado durante a correção.

Os testes de interface usam API controlada e não equivalem a homologação com contas reais. Os 13 testes de banco usam PostgreSQL efêmero e isolado. Nesta rodada não houve conexão, migração ou escrita no Supabase de produção, publicação, pagamento, cobrança ou uso de credenciais privilegiadas.

## Preservações

- `main` e a versão pública não foram alteradas;
- o catálogo de 82 profissões e a identidade azul e branca não foram modificados;
- nenhuma migração foi necessária;
- nenhuma aprovação automática foi introduzida.

## Prazo e riscos

A meta do proprietário permanece 04/12/2026, a 16 dias desta entrega. Esta mudança reduz um ponto de falha no caminho de candidatura, mas o prazo segue em risco real por dependências externas e frentes ainda não homologadas: proprietário administrador verificado, revisão jurídica dos acordos, contas reais para homologação conectada, gateway com credenciais exclusivamente sandbox, e-mails e push, GPS, LGPD, Android e preparação de produção. Ações necessárias: confirmar o proprietário por canal seguro, escolher e liberar o gateway sandbox, concluir a revisão jurídica e reservar contas e ambiente de homologação sem dados de produção.
