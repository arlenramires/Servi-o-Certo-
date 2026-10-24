# Entrega: confirmação acessível da exportação CSV

Validada em 24/10/2026 às 11:37 (America/Boa_Vista).

## Funcionalidade entregue

- Depois de preparar o CSV, a interface confirma visivelmente a quantidade de serviços exportados e o nome exato do arquivo.
- A mensagem usa a região de status já anunciada por tecnologias assistivas, sem exigir que o usuário confira a pasta de downloads para saber se a ação foi disparada.
- A redação distingue corretamente **1 serviço** de **12 serviços**.
- O nome confirmado conserva o contexto de filtro, busca, ordenação e data já implementado.
- A exportação continua sem consulta adicional nem alteração dos serviços.

## Evidências

- Teste dirigido Playwright: 2 cenários aprovados, em desktop e viewport Android.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 180 testes Playwright aprovados, totalizando 193 testes.
- O teste de interface usa API controlada e confirma download, nome, quantidade, singular/plural, conteúdo filtrado e ausência de mutações nos pedidos e mensagens.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Runtime

- O Chromium removido pela instalação limpa foi restaurado antes dos testes de interface.
- O cenário dirigido e a suíte completa passaram após a restauração.

## Compatibilidade e segurança

- A confirmação reutiliza a região `role="status"` e `aria-live="polite"` existente na aplicação.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.
- Não houve publicação em produção, alteração de banco conectado, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

A confirmação informa que o navegador recebeu a solicitação de download. O local final e eventuais permissões para salvar o arquivo continuam sob controle do próprio navegador e do dispositivo.
