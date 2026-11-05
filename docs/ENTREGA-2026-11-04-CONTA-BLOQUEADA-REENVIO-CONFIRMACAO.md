# Entrega — contenção de conta bloqueada no reenvio de confirmação

Data da validação: 04/11/2026 20:56:00 (America/Boa_Vista)

## Entrega funcional

O reenvio do e-mail de confirmação agora contém `user_banned` sem repetir uma solicitação para a conta bloqueada:

- informa de forma neutra que o acesso está temporariamente indisponível e orienta procurar o suporte;
- consome o e-mail pendente e oculta a ação de reenvio;
- impede outra chamada a `auth.resend()` na mesma abertura, inclusive por acionamento programático do botão oculto;
- mantém a conta e a área privada fechadas;
- preserva uma referência protegida de serviço sem revelar seu código.

Não houve mudança de banco, desbloqueio ou aprovação de conta, envio de e-mail, concessão administrativa ou publicação em produção.

## Referências verificadas

O catálogo oficial define `user_banned` como uma conta cujo `banned_until` ainda está ativo e determina que nenhuma outra requisição de API seja tentada até o bloqueio ser removido. A documentação de `auth.resend()` confirma que a operação reenvia uma confirmação de cadastro existente. O changelog atual não apresenta incompatibilidade específica com esta entrega; a mudança futura relevante continua sendo a remoção de cifras TLS antigas em 10/11/2026.

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/reference/javascript/auth-resend
- https://supabase.com/changelog?types=breaking-change

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Teste dirigido Playwright em desktop e viewport Android: **2/2 aprovados**.
3. `npm run test:all`: **429/429 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 416 testes Playwright com API controlada.
4. A prova confirma que o primeiro `user_banned` oculta e consome o reenvio e que um clique programático posterior não chama `auth.resend()` novamente.
5. A instalação limpa removeu o Chromium do cache; o primeiro teste dirigido não executou o código. O navegador foi restaurado pelo espelho alternativo do Playwright, e tanto a repetição dirigida quanto a suíte integral passaram.

## Prazo e dependências

A meta definida pelo proprietário permanece em 04/12/2026, sem extensão automática nem redução de escopo. Há risco real de atraso enquanto pagamentos, contas confirmadas, proprietário administrativo verificado, documentos privados e homologação hospedada dependerem de decisões, credenciais sandbox e validações autorizadas. Esta entrega reduz uma falha independente de autenticação, mas não remove esses bloqueios do caminho crítico.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhuma conta foi desbloqueada, aprovada ou promovida; nenhum e-mail real, cobrança ou pagamento foi criado.
- A validação usa API controlada e banco PostgreSQL isolado; não equivale à homologação ponta a ponta com SMTP e contas confirmadas.
