# Entrega — data de solicitação visível no próprio serviço

Validada em 23/10/2026 às 01:03 (America/Boa_Vista).

## Funcionalidade

- Cada cartão em “Meus serviços” passa a informar a data e a hora em que o pedido foi solicitado.
- A informação usa o elemento semântico `time` com o instante original em ISO, mantendo uma apresentação localizada em português para a pessoa usuária.
- A data aparece tanto para cliente quanto para prestador quando o serviço já faz parte da coleção autorizada da sessão.
- A apresentação reutiliza o `created_at` já carregado; não realiza consulta adicional nem modifica o pedido.

## Evidências

- `npm ci --ignore-scripts`: aprovado.
- `npm run test:all`: 13 testes Node/PostgreSQL e 140 testes Playwright aprovados (153 no total).
- O novo cenário automatizado confirma a visibilidade da data, o valor ISO completo no atributo `datetime` e a ausência de mutação no pedido.
- O cenário foi executado nos projetos desktop e viewport Android com API controlada.
- Os testes PostgreSQL foram executados no ambiente isolado; esta entrega não cria migração nem altera o banco conectado.

## Incidente de validação e correção

- A instalação limpa removeu o Chromium do cache local. O primeiro ciclo manteve os 13 testes Node/PostgreSQL aprovados, mas não conseguiu iniciar os testes de interface.
- O download primário do navegador retornou arquivos vazios; o instalador utilizou automaticamente o espelho alternativo autorizado e restaurou Chromium, FFMPEG e o headless shell.
- Com o navegador restaurado, os cenários de contrato revelaram dados simulados antigos sem `created_at`. A renderização foi tornada defensiva: exibe a data quando válida e não inventa uma data quando ausente.
- Após a correção, o comando integral foi repetido e todos os 153 testes passaram.

## Preservações e limites

- A data não amplia acesso: somente serviços já autorizados pelo Supabase e pelo RLS existente são renderizados.
- `main`, o protótipo público, as 82 profissões e a identidade azul e branca não foram alterados.
- Nenhuma publicação, cobrança, aprovação administrativa ou alteração no banco de produção foi executada.
