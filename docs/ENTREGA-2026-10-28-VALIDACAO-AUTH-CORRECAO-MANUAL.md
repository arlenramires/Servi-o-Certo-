# Entrega: correção de dados recusados pelo Auth

Data local: 28/10/2026 18:45:00 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase responde com `validation_failed`, login, cadastro e recuperação de senha agora orientam a pessoa a conferir os dados informados e tentar novamente, em vez de apresentar a mensagem genérica de falha de conexão.

Cada etapa permanece aberta para correção: o e-mail, o nome e o perfil solicitado continuam disponíveis quando aplicável; senhas rejeitadas são apagadas; o foco volta ao primeiro campo útil; nenhuma solicitação é repetida automaticamente e o espaço privado permanece fechado. Uma eventual referência protegida também continua preservada sem exibir seu código.

## Referência verificada

- O catálogo atual de erros do Supabase Auth define `validation_failed` para parâmetros que não estão no formato esperado.
- A interface traduz essa recusa para uma orientação acionável sem expor o detalhe interno nem prometer que a operação foi concluída.
- O changelog do Supabase foi consultado antes da implementação. A alteração incompatível recente sobre cifras TLS 1.2 antigas não muda este tratamento do Auth.

## Evidências automatizadas

- Cenário dirigido em desktop e viewport Android: **2/2** testes aprovados.
- A API controlada devolve `validation_failed` em uma única chamada para cada etapa: login, cadastro e recuperação.
- Os campos úteis permanecem disponíveis, as senhas são apagadas, o foco retorna ao campo correto e nenhuma chamada é repetida.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **335/335** testes aprovados — 13 Node/PostgreSQL isolado e 322 Playwright.
- Nenhuma conta, sessão ou mensagem real foi criada. Banco conectado, produção, pagamentos, aprovações e privilégios administrativos permaneceram inalterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
