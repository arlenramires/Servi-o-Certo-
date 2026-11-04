# Entrega — retorno neutro após usuário ausente na reautenticação

Data da validação: 04/11/2026 16:01:58 (America/Boa_Vista)

## Entrega funcional

A recuperação de senha agora contém `user_not_found` retornado ao pedir ou reenviar o código de reautenticação:

- encerra a recuperação que já não pode ser vinculada ao usuário;
- retorna à solicitação genérica de um novo e-mail sem confirmar se a conta existia;
- mantém a senha inalterada e a área privada fechada;
- preserva o contexto protegido do serviço sem revelar seu código;
- não repete automaticamente `updateUser()` ou `reauthenticate()`;
- centraliza no mesmo conjunto os códigos que invalidam a recuperação durante a reautenticação.

Não houve mudança de banco, exclusão de conta, envio real de e-mail ou OTP, concessão administrativa ou publicação em produção.

## Referências verificadas

O catálogo oficial define `user_not_found` como ausência do usuário relacionado à requisição e recomenda identificar erros pelo código estável, sem comparar mensagens. A referência JavaScript informa que `auth.reauthenticate()` exige usuário autenticado; manter o formulário aberto após a ausência desse usuário não permitiria concluir a recuperação com segurança. O changelog de Auth foi conferido e não apresenta incompatibilidade específica com esta entrega.

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/reference/javascript/auth-reauthenticate
- https://supabase.com/changelog?tags=auth

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. O runtime não tinha o Chromium após a instalação limpa. O primeiro host retornou arquivo vazio; o espelho alternativo do Playwright restaurou Chromium, FFMPEG e Headless Shell.
3. Testes dirigidos Playwright, cobrindo pedido inicial e reenvio em desktop e viewport Android: **4/4 aprovados** após a restauração do navegador.
4. `npm run test:all`: **421/421 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 408 testes Playwright com API controlada.
5. As provas confirmam que ambos os pontos retornam à mensagem genérica, preservam o contexto sem revelar o código e não fazem chamadas extras.

## Prazo e dependências

A meta definida pelo proprietário permanece em 04/12/2026, sem extensão automática nem redução de escopo. Há risco real de atraso enquanto pagamentos, contas confirmadas, proprietário administrativo verificado, documentos privados e homologação hospedada dependerem de decisões, credenciais sandbox e validações autorizadas. Esta entrega reduz uma falha independente de autenticação, mas não remove esses bloqueios do caminho crítico.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhuma conta foi excluída, aprovada ou promovida; nenhum e-mail real, OTP, cobrança ou pagamento foi criado.
- A validação usa API controlada e banco PostgreSQL isolado; não equivale à homologação ponta a ponta com contas confirmadas.
