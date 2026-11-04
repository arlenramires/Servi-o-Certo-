# Entrega — recuperação após solicitação recusada no pedido de reautenticação

Data da validação: 04/11/2026 10:52:35 (America/Boa_Vista)

## Entrega funcional

O pedido do código de reautenticação na recuperação de senha agora contém `validation_failed` e `bad_json` do Supabase Auth:

- preserva a orientação específica da primeira falha;
- mantém a senha inalterada e a área privada fechada;
- não exibe a entrada do código porque o envio não foi confirmado;
- consome a carga fixa recusada e impede novos `updateUser()`/`reauthenticate()` na mesma abertura;
- orienta reabrir a recuperação antes de outra tentativa;
- não revela a referência protegida nem detalhes internos da requisição.

Não houve mudança de banco, migração, configuração de Auth Hook ou envio de e-mail real.

## Referências verificadas

A referência JavaScript atual confirma que `auth.reauthenticate()` envia o OTP de reautenticação. O catálogo oficial informa que erros de Auth originados no servidor possuem `code`, define `bad_json` como corpo HTTP que não é JSON válido e orienta usar `reauthenticate()` quando a troca de senha exige nova autenticação. O changelog de Auth foi conferido; a alteração futura encontrada refere-se a cifras TLS antigas, sem incompatibilidade específica com este fluxo.

- https://supabase.com/docs/reference/javascript/auth-reauthenticate
- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/changelog?tags=auth

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Testes dirigidos Playwright, desktop e viewport Android: **4/4 aprovados**, cobrindo validação e corpo inválido isoladamente.
3. `npm run test:all`: **405/405 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 392 testes Playwright com API controlada.
4. As provas confirmam que a segunda submissão não acrescenta chamadas além de um `updateUser()` e um `reauthenticate()` para cada cenário.

## Prazo e dependências

A meta definida pelo proprietário permanece em 04/12/2026, sem redução de escopo. Há risco real de atraso enquanto pagamentos, contas confirmadas, proprietário administrativo verificado, documentos privados e homologação hospedada dependerem de decisões, credenciais sandbox e validações autorizadas. Esta entrega reduz uma falha independente do caminho crítico, mas não remove esses bloqueios de integração.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhum e-mail real, cobrança, pagamento, aprovação de documento/profissão ou privilégio administrativo foi criado.
- A homologação com contas confirmadas e serviço de e-mail real continua dependendo de ambiente e credenciais autorizados.
- Ao informar uma entrega, distinguir teste de UI com API controlada, SQL no banco isolado, SQL no Supabase conectado e teste real ponta a ponta com contas confirmadas.
