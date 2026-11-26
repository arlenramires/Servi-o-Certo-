# Entrega — bloqueio de restauração duplicada de oportunidade

**Data e hora local:** 26/11/2026 06:39:36 (America/Boa_Vista, UTC-4)  
**Branch:** `desenvolvimento-login-supabase`  
**Commit funcional:** [73dd8c578fdd7082e78720dc3ef92a446c0abfcf](https://github.com/arlenramires/Servi-o-Certo-/commit/73dd8c578fdd7082e78720dc3ef92a446c0abfcf)

## Entrega funcional

No fluxo principal do prestador, o botão **Mostrar novamente** agora descarta eventos adicionais enquanto a restauração de uma oportunidade ocultada está em andamento. Assim, dois acionamentos no mesmo ciclo não disparam duas chamadas `restore_request_interest`.

A oportunidade permanece visualmente ocultada e o botão permanece desabilitado até a resposta. Após a confirmação, ela reaparece uma única vez na lista de oportunidades.

## Evidências

- Teste dirigido de UI executado em desktop e Android: **2/2 aprovados**.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: **555 testes aprovados** — 13 testes Node/PostgreSQL e 542 testes Playwright.
- CI do commit funcional: [Validar Serviço Certo #362](https://github.com/arlenramires/Servi-o-Certo-/actions/runs/45802902452), **sucesso em 2min40s**.
- O teste controla a latência da API, dispara dois eventos no mesmo botão e confirma que apenas uma chamada é registrada com `{ p_request_id: 'open-request' }`.

## Escopo e segurança

- Nenhuma migração ou mutação foi aplicada ao banco de produção.
- Nenhuma publicação em produção, cobrança, pagamento ou gasto foi realizado.
- Nenhum documento, profissão ou usuário foi aprovado automaticamente.
- Nenhuma permissão administrativa foi concedida e nenhuma credencial privilegiada foi exposta.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.

## Problema novo observado

O CI emitiu aviso de que versões atuais de `actions/checkout`, `actions/setup-node` e `actions/upload-artifact` ainda direcionam ao Node.js 20 e estão sendo forçadas pelo GitHub Actions para Node.js 24. O job terminou verde, portanto não bloqueia esta entrega. Impacto: uma remoção futura da compatibilidade pode quebrar o workflow. Ação necessária: atualizar e validar os pins dessas ações em uma entrega isolada.

## Prazo e dependências

Restam **8 dias** até a meta de 04/12/2026. O risco de atraso é alto porque ainda dependem de decisão ou acesso externo: revisão jurídica dos acordos; proprietário verificado para administração; contas confirmadas para homologação conectada; definição e credenciais de gateway sandbox; e validações hospedadas, e-mail, push, GPS/ETA, LGPD, Android e preparação de produção. Esta entrega reduz uma condição de corrida do fluxo principal, mas não representa homologação ponta a ponta do projeto completo.
