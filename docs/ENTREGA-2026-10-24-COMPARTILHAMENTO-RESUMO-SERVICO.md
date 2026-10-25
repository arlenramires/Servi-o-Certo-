# Entrega: compartilhamento seguro do resumo do serviço

Validada em 24/10/2026 às 22:35 (America/Boa_Vista).

## Funcionalidade entregue

- Cada cartão autorizado oferece a ação **Compartilhar resumo**.
- Em aparelhos compatíveis, a ação abre o compartilhamento nativo com título e resumo seguro do serviço.
- Quando o navegador não oferece compartilhamento nativo, o mesmo resumo é copiado automaticamente para a área de transferência.
- Cancelar a janela nativa produz uma mensagem neutra e não inicia a cópia alternativa sem intenção do usuário.
- O conteúdo inclui código, profissão, situação, região, urgência, datas válidas e link autenticado, sem descrição livre, participantes, mensagens, propostas ou valores.
- A ação reutiliza somente dados já carregados e não consulta nem modifica o serviço.

## Evidências

- Testes dirigidos Playwright: 4 cenários aprovados, cobrindo compartilhamento nativo e alternativa por cópia em desktop e viewport Android.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 194 testes Playwright aprovados, totalizando 207 testes.
- Os cenários conferem o título, todo o conteúdo compartilhado, a ausência das descrições privadas, a mensagem adequada para cada caminho e a inexistência de chamadas adicionais à API ou mutações nos pedidos.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Runtime

- O Chromium removido pela instalação limpa foi restaurado pelo espelho já validado antes dos testes.
- Os testes dirigidos e a suíte completa passaram sem falhas.

## Compatibilidade e segurança

- A implementação é somente de interface e mantém a autorização sob as políticas RLS existentes.
- O changelog oficial do Supabase foi conferido em 24/10/2026. As mudanças anunciadas sobre cifras TLS antigas e exposição de novas tabelas não afetam esta entrega, que não cria tabelas nem altera chamadas à Data API.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alterados.
- Não houve publicação em produção, alteração de banco conectado, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

O compartilhamento abre destinos controlados pelo sistema operacional e pelo usuário. O resumo reduz a exposição ao excluir campos privados, mas o destinatário ainda deve ser escolhido com cuidado.
