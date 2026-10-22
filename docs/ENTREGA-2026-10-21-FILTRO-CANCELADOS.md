# Entrega — filtro de serviços cancelados

Validada em 21/10/2026 às 15:40 (America/Boa_Vista).

## Funcionalidade

- A área “Meus serviços” oferece a opção `Cancelados`, com contagem calculada somente sobre os serviços já autorizados para a sessão.
- O recorte inclui apenas pedidos com estado `cancelado`, sem misturar serviços concluídos.
- O filtro pode ser combinado com a busca por profissão ou descrição e não altera a coleção de pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 120 testes Playwright aprovados.
- O cenário automatizado adiciona dois pedidos cancelados e um concluído, confirma `Cancelados (2)`, exclui o concluído, combina o recorte com a busca `pintor` e verifica que os identificadores originais continuam intactos.
- Os testes de interface foram executados em desktop e viewport Android com API controlada.
- Os testes PostgreSQL passaram no ambiente isolado; esta entrega não cria migração nem altera banco conectado.

## Incidente de runtime resolvido

A primeira tentativa de `npm run test:all` encontrou o cache do Chromium ausente depois da instalação das dependências, portanto os cenários de interface nem chegaram a abrir o navegador. O Chromium foi reinstalado no runtime isolado e o mesmo comando integral foi repetido com aprovação total.

## Preservações e limites

- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
- A validação não substitui homologação com contas confirmadas no Supabase conectado.
