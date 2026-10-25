# Entrega: prévia do resumo seguro do serviço

Validada em 25/10/2026 às 00:33 (America/Boa_Vista).

## Funcionalidade entregue

- Cada cartão autorizado oferece a ação **Ver resumo**.
- A prévia mostra exatamente o mesmo conteúdo seguro usado pelas ações de copiar, baixar e compartilhar.
- A ação alterna para **Ocultar resumo** e expõe seu estado por `aria-expanded` e `aria-controls`.
- O conteúdo inclui código, profissão, situação, região, urgência, datas válidas e link autenticado, sem descrição livre, participantes, mensagens, propostas ou valores.
- Abrir ou ocultar a prévia reutiliza somente dados já carregados e não consulta nem modifica o serviço.

## Evidências

- Testes dirigidos Playwright: 2 cenários aprovados, cobrindo desktop e viewport Android.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 196 testes Playwright aprovados, totalizando 209 testes.
- Os cenários conferem a prévia inicialmente oculta, conteúdo seguro visível, ausência da descrição privada, alternância do texto e do estado acessível e inexistência de chamadas adicionais à API ou mutações nos pedidos.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Runtime

- O Chromium removido pela instalação limpa foi restaurado pelo espelho já validado antes dos testes.
- Os testes dirigidos e a suíte completa passaram sem falhas.

## Compatibilidade e segurança

- A implementação é somente de interface e mantém a autorização sob as políticas RLS existentes.
- O changelog oficial do Supabase foi conferido em 25/10/2026. As mudanças anunciadas sobre cifras TLS antigas e exposição de novas tabelas não afetam esta entrega, que não cria tabelas nem altera chamadas à Data API.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alterados.
- Não houve publicação em produção, alteração de banco conectado, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

A prévia reduz o risco de compartilhamento inadvertido ao permitir conferência antecipada, mas o destinatário das ações de cópia, download ou compartilhamento continua sob escolha e responsabilidade do usuário.
