# Entrega — filtro de serviços com mensagens novas

Validada em 21/10/2026 às 04h29 (Boa Vista).

## Funcionalidade

- A área `Meus serviços` agora oferece o filtro `Mensagens novas` para cliente e prestador localizarem conversas pendentes de leitura.
- A opção exibe quantos serviços possuem ao menos uma mensagem nova, sem confundir quantidade de conversas com quantidade de mensagens.
- O filtro pode ser combinado com a busca e com a ordenação existentes.
- Depois que a conversa é aberta e a leitura é registrada, a atualização remove o serviço do filtro e reduz a contagem.
- A contagem usa a RPC privada `unread_service_message_counts`, portanto considera somente serviços já autorizados para a conta.

## Evidências

- `npm ci --ignore-scripts` concluído.
- `npm run test:all`: 13 testes Node/PostgreSQL e 104 testes Playwright aprovados em desktop e viewport Android.
- Interface com API controlada: um serviço com mensagem nova foi isolado de outro sem pendência; após abrir a conversa e atualizar, a contagem mudou de 1 para 0 e a categoria ficou vazia.
- PostgreSQL isolado: a suíte existente confirmou novamente a contagem privada de mensagens recebidas e o registro de leitura pelos participantes.

## Runtime recuperado

Os espelhos do Playwright continuaram retornando arquivo vazio e HTTP 503. A validação foi recuperada com Chromium 141 empacotado temporariamente pelo registro npm, sem incluir dependência, configuração ou arquivo de runtime no projeto.

## Limites e preservação

Esta entrega não altera schema, função ou política e não exige migração. Nenhum SQL foi aplicado ao Supabase conectado, nenhuma publicação foi feita e nenhuma operação financeira ocorreu.

A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
