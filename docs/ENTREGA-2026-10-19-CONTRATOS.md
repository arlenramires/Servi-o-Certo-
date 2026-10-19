# Entrega — contrato versionado e aceite bilateral

Data local: 19/10/2026, 02h17 (Manaus). Branch `desenvolvimento-login-supabase`.

## Implementação

- Um contrato pode ser gerado somente a partir de um orçamento aceito e vinculado ao pedido, cliente e prestador corretos.
- O servidor copia para uma versão imutável o escopo/prazo informado, valor em centavos, agendamento, etapa inicial e versão dos termos.
- A criação é idempotente: chamadas repetidas para o mesmo orçamento devolvem o mesmo contrato, sem duplicá-lo.
- Cliente e prestador registram aceites separados, vinculados à impressão digital do conteúdo exibido.
- Terceiros não podem ler ou gerar o contrato; um participante não pode assinar com o papel da outra parte.
- A interface mostra o conteúdo versionado, o estado de cada aceite e não afirma que houve pagamento.

## Validação isolada

- `npm ci --ignore-scripts`: concluído.
- `npm run test:all`: aprovado.
- PostgreSQL isolado (PGlite): 4 testes aprovados, incluindo criação, duplicação, imutabilidade, privacidade, falsificação de papel e dois aceites.
- Playwright: 20 testes aprovados — 10 em desktop e 10 no viewport Pixel 7, incluindo geração e aceite do contrato na interface com API controlada.
- `git diff --check`: aprovado.

## Limites de segurança e continuidade

A migração `20261019062000_contracts_from_accepted_quotes.sql` foi somente preparada e executada no banco efêmero dos testes. Não foi aplicada ao Supabase conectado nem à produção. A versão pública, a branch `main`, as 82 profissões e a identidade azul e branca permanecem inalteradas.

O texto incluído é um termo técnico versionado para testar integridade e aceite; não substitui revisão jurídica. Pagamento, garantia, adicionais, cancelamento, disputa, nota fiscal e assinatura com validade jurídica ampliada continuam pendentes.
