# Entrega — ajuste da profissão no pedido aberto

Validada em 20/10/2026 às 20h55 (Boa Vista).

## Funcionalidade

- O cliente pode trocar a profissão solicitada em um pedido próprio enquanto ele permanece aberto e sem prestador.
- A interface usa somente as opções do catálogo já carregado e atualiza imediatamente o título do chamado.
- O banco valida a profissão novamente e persiste o nome canônico do catálogo, independentemente do texto enviado pelo cliente.
- Depois do aceite, a profissão fica congelada por este fluxo.

## Segurança e evidências

- A operação protegida verifica autenticação, propriedade, estado `aberto` e ausência de prestador sob bloqueio de linha.
- A função privilegiada fica no esquema `private`, usa `search_path` vazio e tem execução revogada de `PUBLIC` e `anon`; a função pública é apenas um invólucro `security invoker` para usuários autenticados.
- Profissão inexistente, prestadores, terceiros e usuários anônimos não conseguem alterar o chamado.
- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 92 testes Playwright aprovados em desktop e viewport Android.
- PostgreSQL efêmero: troca com nome canônico, rejeição fora do catálogo, bloqueio do prestador, bloqueio anônimo e congelamento após o aceite.
- Interface com API controlada: seleção da nova profissão, envio pela RPC protegida e atualização do cartão.

## Ocorrência resolvida

O primeiro host de download do Chromium retornou arquivos vazios. O instalador usou automaticamente o espelho alternativo do Playwright e a suíte completa terminou com aprovação integral.

## Limites e preservação

A migração `20261021005500_client_open_request_profession.sql` foi preparada e testada somente no PostgreSQL efêmero. Não foi aplicada ao Supabase conectado. Nenhuma publicação, aprovação administrativa ou operação financeira foi realizada.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
