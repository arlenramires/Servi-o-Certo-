# Entrega — retorno seguro após sessão expirada na reautenticação

Data da validação: 04/11/2026 14:55:44 (America/Boa_Vista)

## Entrega funcional

A recuperação de senha agora contém o encerramento da sessão ocorrido ao pedir ou reenviar o código de reautenticação:

- reconhece os códigos já tratados de sessão encerrada também dentro de `auth.reauthenticate()`;
- encerra a recuperação que perdeu a sessão em vez de manter um formulário impossível de concluir;
- retorna à solicitação genérica de um novo e-mail de recuperação;
- mantém a senha inalterada e a área privada fechada;
- preserva o contexto protegido do serviço sem revelar seu código;
- não tenta repetir automaticamente `updateUser()` ou `reauthenticate()`.

Não houve mudança de banco, envio real de e-mail ou OTP, alteração de conta, concessão administrativa ou publicação em produção.

## Referências verificadas

A referência JavaScript atual informa que `auth.reauthenticate()` exige usuário autenticado e envia o OTP para o e-mail ou telefone desse usuário. O catálogo oficial mantém códigos estáveis para sessões ausentes ou expiradas; portanto, perder a sessão durante esse pedido exige reiniciar a recuperação por um novo link. O changelog de Auth foi conferido e não apresenta incompatibilidade específica com esta mudança; a alteração futura relevante continua sendo a remoção de cifras TLS antigas em 10/11/2026.

- https://supabase.com/docs/reference/javascript/auth-reauthenticate
- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/changelog?tags=auth

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Testes dirigidos Playwright, cobrindo pedido inicial e reenvio em desktop e viewport Android: **4/4 aprovados**.
3. `npm run test:all`: **417/417 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 404 testes Playwright com API controlada.
4. As provas confirmam que o retorno seguro ocorre após `session_expired` sem nova chamada automática e sem abertura da área privada.

## Prazo e dependências

A meta definida pelo proprietário permanece em 04/12/2026, sem extensão automática nem redução de escopo. Há risco real de atraso enquanto pagamentos, contas confirmadas, proprietário administrativo verificado, documentos privados e homologação hospedada dependerem de decisões, credenciais sandbox e validações autorizadas. Esta entrega reduz uma falha independente de autenticação, mas não remove esses bloqueios do caminho crítico.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhuma conta foi aprovada ou promovida; nenhum e-mail real, OTP, cobrança ou pagamento foi criado.
- A validação usa API controlada e banco PostgreSQL isolado; não equivale à homologação ponta a ponta com contas confirmadas.
