# Entrega — bloqueio de atualização duplicada da urgência do pedido

**Data e hora local:** 26/11/2026 05:13:50 (America/Boa_Vista, UTC-4)  
**Branch:** `desenvolvimento-login-supabase`  
**Base relida antes da atualização:** `10ceea00412a433240ac9f50a1898b112995b915`  
**Commit funcional:** `29d69d92d4bd617059bb07f060cd6986ee9a1630`

## Resultado funcional

O botão de urgência de um pedido aberto agora descarta um segundo evento enquanto a primeira atualização está em andamento. Apenas uma chamada `set_request_urgency` chega ao serviço, o cartão mantém o estado anterior até a resposta e aplica uma única mudança depois da confirmação.

## Alterações

- `auth-teste/app.js`: retorno imediato quando o controle de urgência já está desabilitado.
- `tests/ui/mock-supabase.js`: atraso controlável da RPC de urgência para reproduzir concorrência em ambiente isolado.
- `tests/ui/flows.spec.js`: teste funcional de ação duplicada em desktop e Android.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- Teste dirigido: 2/2 cenários aprovados (desktop e Android).
- `npm run test:all`: 553 testes aprovados — 13 testes Node/PostgreSQL e 540 testes Playwright.
- GitHub Actions [Validar Serviço Certo #360](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45789552786): sucesso em 2m29s.
- O Chromium não estava presente após a instalação limpa; foi reinstalado no runtime isolado e a suíte integral terminou verde. Não houve alteração em produção.

## Preservação e isolamento

- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.
- Nenhuma migração ou escrita foi aplicada ao banco de produção; os testes usaram banco e mocks isolados.
- Nenhum documento ou profissão foi aprovado automaticamente, nenhum administrador foi concedido e nenhuma credencial privilegiada foi exposta.
- Nenhuma publicação, cobrança ou pagamento real foi executado; pagamentos continuam condicionados a sandbox autorizado.

## Prazo e risco

Restam 8 dias até 04/12/2026. O prazo para concluir e homologar todo o escopo segue em risco alto porque ainda há integrações externas e validações ponta a ponta dependentes de ambientes/credenciais autorizados, inclusive pagamentos em sandbox. A ação necessária é disponibilizar essas autorizações e janelas de homologação sem reduzir o escopo; esta rodada avançou uma pendência independente do caminho principal.
