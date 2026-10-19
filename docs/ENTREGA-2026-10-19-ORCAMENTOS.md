# Entrega — orçamentos e decisões do cliente

Data local: 19/10/2026. Branch `desenvolvimento-login-supabase`.

## Implementação

- Prestador atribuído ao serviço pode registrar orçamento com escopo/prazo e valor em centavos.
- Cliente visualiza o histórico, recusa uma proposta ou aceita outra. Decisões são gravadas separadamente e não sobrescrevem a proposta original.
- O valor é convertido a partir do texto decimal, evitando erro de ponto flutuante em valores como R$ 0,29. Entrada ambígua, negativa, com casas decimais excessivas ou fora do limite inteiro seguro é rejeitada.
- Uma proposta aceita encerra os controles de negociação da interface; o banco também recusa novas propostas após aceite. Mudanças posteriores precisam do fluxo próprio de adicionais, ainda pendente.
- Mensagem explícita informa que aceite de orçamento ainda não é contrato concluído nem pagamento realizado.
- Abertura de conversas evita resposta antiga sobrescrever seleção mais recente e limpa rascunhos ao trocar de serviço.

## Correção no banco

Migração aplicada e registrada: `20261019060528_quote_decision_integrity`.

A política anterior continha `q.request_id = q.request_id`: não vinculava o pedido informado na decisão ao pedido real da proposta. Foi corrigida para `q.request_id = service_quote_decisions.request_id`.

Regras conferem o cliente do pedido, prestador atribuído e estado do serviço. O prestador não pode decidir pelo cliente. Identificador, data, status e conteúdo de propostas/decisões não podem ser reescritos por usuários da API. O índice único parcial existente impede dois orçamentos diferentes aceitos no mesmo pedido.

O estado negociado é derivado da tabela de decisões. A proposta original permanece imutável; não se deve interpretar seu campo `status` isoladamente como decisão final do cliente.

## Resultados observados

- `npm test`: 3 testes aprovados — fluxo SQL de autenticação/pedidos/chat, fluxo SQL de orçamentos/decisões e precisão/validação de valores.
- `npm run test:ui`: 18 testes aprovados em Chromium, sendo nove desktop e nove em viewport Pixel 7. A API de interface é controlada; não é teste em Android físico nem homologação completa contra contas reais.
- `supabase/tests/quote-flow.sql`: aprovado no PostgreSQL do Supabase conectado, antes e depois da migração; registros sintéticos revertidos por `ROLLBACK`.
- Casos SQL incluem privacidade da negociação, prestador não atribuído, autoaprovação, falsificação do autor da decisão, decisão ligada a outro pedido, edição de valores/decisões, duas aceitações para o mesmo pedido e orçamento novo após aceite.
- Advisor de segurança após migração: `lints: []`. Não substitui auditoria independente.
- GitHub Actions configurado para executar automaticamente estes mesmos testes no push; conferir o resultado associado ao commit desta entrega.

## Continuidade configurada

A rotina existente de avisos foi convertida em rodadas horárias de implementação/testes/commits. A rotina diária consolida os resultados, sem executar um segundo escritor concorrente. Bloqueios devem ser registrados e outra frente independente deve ser escolhida. Não há promessa de programação ininterrupta ou de commit em toda rodada.

## Limites e próxima entrega

Ainda falta contrato vinculado ao orçamento aceito, aceite bilateral, etapas, pagamento sandbox, execução/conclusão e repasse de ponta a ponta. Não houve cobrança, repasse, emissão fiscal ou aprovação real de profissionais. A versão pública e o catálogo de 82 profissões foram preservados.
