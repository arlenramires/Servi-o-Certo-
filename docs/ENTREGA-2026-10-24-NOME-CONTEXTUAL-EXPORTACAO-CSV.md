# Entrega: nome contextual da exportação CSV

Validada em 24/10/2026 às 08:15 (America/Boa_Vista).

## Funcionalidade entregue

- O arquivo gerado por **Baixar lista** agora inclui no nome a categoria filtrada e a data local da exportação.
- Um filtro como **Concluídos** gera, por exemplo, `servicos-concluidos-2026-10-24.csv`, facilitando localizar e diferenciar listas antigas.
- A categoria é normalizada sem acentos, espaços ou caracteres impróprios para nomes de arquivo.
- O conteúdo continua respeitando busca, filtro e ordenação atuais, sem consulta adicional nem alteração dos serviços.

## Evidências

- Teste direcionado Playwright: 2 cenários aprovados (desktop e viewport Android).
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 180 testes Playwright aprovados, totalizando 193 testes após a restauração do Chromium.
- O teste de interface usa API controlada e confirma o nome contextual pela categoria e data local, além de conteúdo, ordem, datas, mensagens novas, proteção contra fórmulas e ausência de mutação nos pedidos e mensagens.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Problema de runtime resolvido

- A primeira tentativa não conseguiu iniciar os testes de interface porque o Chromium não estava presente e a restauração ficou temporariamente bloqueada pelo limite de uso da plataforma.
- Após a liberação do limite, o navegador foi instalado, o cenário dirigido passou e `npm run test:all` foi repetido integralmente com sucesso.
- A falha inicial foi de infraestrutura: nenhum teste chegou a executar a aplicação naquela tentativa.

## Compatibilidade e segurança

- A categoria usada no nome vem da opção de filtro já exibida ao usuário e passa por normalização restritiva.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.
- Não houve publicação em produção, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

A data do nome usa o dia local do navegador no momento do download. O conteúdo da planilha preserva separadamente os valores ISO exatos das datas dos serviços.
