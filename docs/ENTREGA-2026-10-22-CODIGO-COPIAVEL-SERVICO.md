# Entrega — código copiável do próprio serviço

Validada em 22/10/2026 às 20:39 (America/Boa_Vista).

## Funcionalidade

- Cada serviço presente na lista autorizada mostra seu identificador completo no próprio cartão.
- A ação “Copiar código” envia o identificador à área de transferência para facilitar atendimento, conferência e referência entre as partes.
- A interface confirma qual código foi copiado e mantém o valor visível quando a cópia automática não está disponível.
- Navegadores sem a API moderna de área de transferência recebem uma alternativa local de cópia.
- A ação é somente local: não consulta registros adicionais, não amplia acesso e não modifica o pedido.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 132 testes Playwright aprovados.
- O novo cenário automatizado confirma a exibição do código, o valor enviado à área de transferência, a mensagem de sucesso e a preservação integral do pedido.
- O cenário passou nos projetos desktop e viewport Android com API controlada.
- Os testes PostgreSQL passaram no ambiente isolado; esta entrega não cria migração nem altera banco conectado.

## Incidente de runtime resolvido

- A instalação limpa removeu o Chromium local. A primeira execução aprovou os 13 testes Node/PostgreSQL, mas o Playwright não iniciou por ausência do navegador.
- O Chromium foi reinstalado somente no ambiente isolado e `npm run test:all` foi repetido integralmente, com os 145 testes aprovados.

## Preservações e limites

- O código só aparece para serviços já retornados pelas políticas de acesso da sessão.
- O identificador não substitui autenticação, autorização nem comprovante contratual.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
