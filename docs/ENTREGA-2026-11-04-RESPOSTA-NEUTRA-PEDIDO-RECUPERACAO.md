# Entrega — resposta neutra no pedido de recuperação

Data da validação: 04/11/2026 22:59:10 (America/Boa_Vista)

## Entrega funcional

O pedido de recuperação de senha agora mantém a mesma resposta genérica quando o Auth retorna `user_not_found` ou `user_banned`:

- não revela se a conta existe ou está bloqueada;
- informa apenas que as instruções serão enviadas caso o e-mail esteja cadastrado;
- retorna ao login mantendo o e-mail informado e o foco no campo de senha;
- realiza somente uma chamada a `resetPasswordForEmail()` para cada pedido;
- mantém a área privada fechada e preserva uma referência protegida sem revelar seu código.

Não houve mudança de banco, criação, desbloqueio ou aprovação de conta, envio de e-mail real, concessão administrativa ou publicação em produção.

## Referências verificadas

A documentação oficial determina que `resetPasswordForEmail()` não revele se existe uma conta para o endereço informado e que, quando não há usuário associado, nenhum e-mail é enviado embora a operação normalmente termine sem erro. A referência JavaScript confirma que a operação envia o pedido de recuperação ao endereço informado.

- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
- https://supabase.com/changelog?types=breaking-change

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Teste dirigido Playwright em desktop e viewport Android: **2/2 aprovados**, cobrindo conta ausente e conta bloqueada em cada viewport.
3. `npm run test:all`: **433/433 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 420 testes Playwright com API controlada.
4. A prova confirma texto idêntico nos dois cenários, retorno ao login, ausência de enumeração e exatamente uma chamada de recuperação.
5. O Chromium removido pela instalação limpa foi restaurado pelo espelho alternativo do Playwright antes das provas; os testes dirigidos e integrais passaram.

## Prazo e dependências

A meta definida pelo proprietário permanece em 04/12/2026, sem extensão automática nem redução de escopo. Há risco real de atraso enquanto pagamentos, contas confirmadas, proprietário administrativo verificado, documentos privados e homologação hospedada dependerem de decisões, credenciais sandbox e validações autorizadas. Esta entrega reduz um risco independente de enumeração de contas, mas não remove esses bloqueios do caminho crítico.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhuma conta foi criada, desbloqueada, aprovada ou promovida; nenhum e-mail real, cobrança ou pagamento foi criado.
- A validação usa API controlada e banco PostgreSQL isolado; não equivale à homologação ponta a ponta com SMTP e contas confirmadas.
