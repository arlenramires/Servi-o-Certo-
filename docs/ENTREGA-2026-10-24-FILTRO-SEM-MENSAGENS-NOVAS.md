# Entrega — filtro de serviços sem mensagens novas

Validada em 24/10/2026 às 00h54 (Boa Vista).

## Funcionalidade

- `Meus serviços` agora oferece o filtro `Sem mensagens novas`.
- A opção exibe somente serviços cuja conversa não possui mensagens pendentes de leitura para o usuário atual.
- A quantidade correspondente aparece no próprio seletor.
- O filtro funciona junto com a busca e não modifica serviços, mensagens ou registros de leitura.
- A implementação reutiliza a contagem privada já carregada para os serviços autorizados, sem nova consulta.

## Evidências

- Teste focal Playwright: 2 cenários aprovados, em desktop e viewport Android.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 176 testes Playwright aprovados, totalizando 189 testes.
- O teste controlado confirmou a contagem, a exclusão da conversa com mensagem nova, a combinação com busca e a imutabilidade dos pedidos.
- A validação PostgreSQL ocorreu somente no banco isolado da suíte; nenhuma migração ou mutação foi aplicada ao projeto Supabase conectado.

## Compatibilidade e segurança

- O changelog oficial do Supabase foi consultado em 24/10/2026. As mudanças anunciadas para cifras TLS antigas e exposição automática de novas tabelas não afetam esta entrega, que não cria tabelas nem altera comunicação ou políticas.
- A contagem continua vindo da operação protegida `unread_service_message_counts`, limitada ao usuário autenticado pelas regras existentes.
- Nenhuma chave privilegiada foi lida ou exposta.
- `main`, o protótipo público, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Não houve publicação, cobrança, pagamento, aprovação, concessão administrativa ou acesso ao banco de produção.

## Limites

- O filtro informa somente o estado interno de leitura; não envia notificações push ou e-mail.
- A entrega não altera a política de retenção ou o conteúdo das mensagens.
