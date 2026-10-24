# Entrega: busca no nome da exportação CSV

Validada em 24/10/2026 às 09:26 (America/Boa_Vista).

## Funcionalidade entregue

- Quando a área **Meus serviços** possui uma busca ativa, o arquivo CSV passa a incluir esse termo no nome.
- O nome combina categoria, busca e dia local. Por exemplo, a busca **Reparo concluído** no filtro **Concluídos** gera `servicos-concluidos-reparo-concluido-2026-10-24.csv`.
- A busca é normalizada sem acentos ou caracteres impróprios e limitada a quarenta caracteres para manter um nome de arquivo seguro e legível.
- Sem busca ativa, permanece o formato anterior com categoria e data.
- O conteúdo continua respeitando busca, filtro e ordenação, sem consulta adicional ou alteração dos serviços.

## Evidências

- Teste dirigido Playwright: 2 cenários aprovados, em desktop e viewport Android.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 180 testes Playwright aprovados, totalizando 193 testes.
- O teste de interface usa API controlada e confirma nome, conteúdo restrito ao único resultado da busca e ausência dos demais serviços.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Problema de runtime resolvido

- Após a instalação limpa, o Chromium não estava disponível e a primeira tentativa dirigida não iniciou a aplicação.
- O navegador de teste foi restaurado; o cenário dirigido e a suíte completa passaram em seguida.

## Compatibilidade e segurança

- A normalização reaproveita uma única função restritiva tanto para o filtro quanto para a busca.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.
- Não houve publicação em produção, alteração de banco conectado, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

O termo aparece no nome somente quando a busca está aplicada. Para evitar nomes excessivamente longos, o trecho normalizado da busca é truncado em quarenta caracteres.
