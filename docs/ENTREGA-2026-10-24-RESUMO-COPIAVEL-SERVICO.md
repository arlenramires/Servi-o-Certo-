# Entrega: resumo copiável do serviço autorizado

Validada em 24/10/2026 às 20:35 (America/Boa_Vista).

## Funcionalidade entregue

- Cada cartão autorizado oferece a ação **Copiar resumo**.
- O texto reúne código, profissão, situação legível, cidade/UF, indicação de urgência, data da solicitação, horário preferido quando existente e link autenticado.
- A descrição livre do pedido, nomes dos participantes, mensagens, propostas e valores não são incluídos.
- A cópia reutiliza somente os dados já carregados no cartão e não faz consultas adicionais nem modifica o serviço.
- O link incluído no resumo continua exigindo autenticação e autorização da conta participante.

## Evidências

- Teste dirigido Playwright: 2 cenários aprovados, em desktop e viewport Android.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 188 testes Playwright aprovados, totalizando 201 testes.
- O cenário confirma o conteúdo completo do resumo, a ausência explícita da descrição privada, a inexistência de chamadas adicionais à API e a ausência de mutação no pedido.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Runtime

- O Chromium removido pelo `npm ci` foi restaurado pelo espelho já validado antes dos testes.
- O teste dirigido e a suíte completa passaram sem falhas.

## Compatibilidade e segurança

- A implementação é somente de interface e mantém a autorização sob as políticas RLS existentes.
- O changelog oficial do Supabase foi conferido em 24/10/2026. As mudanças anunciadas sobre TLS e exposição automática de novas tabelas não afetam esta entrega, que não cria tabelas nem altera acesso à Data API.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alterados.
- Não houve publicação em produção, alteração de banco conectado, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

O usuário decide onde colar o resumo. Por isso, a ação exclui os campos livres e dados de participantes por padrão, mas o destinatário ainda deve ser escolhido com cuidado.
