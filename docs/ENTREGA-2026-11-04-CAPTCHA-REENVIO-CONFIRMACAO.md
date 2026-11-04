# Entrega — contenção de CAPTCHA recusado no reenvio de confirmação

Data da validação: 04/11/2026 17:54:29 (America/Boa_Vista)

## Entrega funcional

O reenvio do e-mail de confirmação agora contém `captcha_failed` sem permitir repetição da solicitação recusada:

- informa que a verificação de segurança precisa ser refeita;
- consome o e-mail pendente e oculta a ação de reenvio;
- impede outra chamada a `auth.resend()` na mesma abertura, inclusive por acionamento programático do botão oculto;
- mantém a conta e a área privada fechadas;
- preserva uma referência protegida de serviço sem revelar seu código;
- exige recarregar a página e iniciar uma nova verificação antes de outro pedido.

Não houve mudança de banco, verificação CAPTCHA real, envio de e-mail, criação ou aprovação de conta, concessão administrativa ou publicação em produção.

## Referências verificadas

O catálogo oficial define `captcha_failed` como falha na verificação do desafio pelo provedor e recomenda identificar erros pelo código estável. A documentação atual confirma proteção CAPTCHA nos fluxos de cadastro, acesso e recuperação, enquanto `auth.resend()` reenvia uma confirmação de cadastro já existente. O changelog de Auth não apresenta incompatibilidade específica com esta entrega; a mudança futura relevante continua sendo a remoção de cifras TLS antigas em 10/11/2026.

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/guides/auth/auth-captcha
- https://supabase.com/docs/reference/javascript/auth-resend
- https://supabase.com/changelog?tags=auth

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. Teste dirigido Playwright em desktop e viewport Android: **2/2 aprovados**.
3. `npm run test:all`: **427/427 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 414 testes Playwright com API controlada.
4. A prova confirma que o primeiro `captcha_failed` oculta e consome o reenvio e que um clique programático posterior não chama `auth.resend()` novamente.
5. Uma desconexão transitória do executor ocorreu somente ao coletar o horário depois dos testes; a repetição da leitura concluiu sem perda de alterações ou evidências.

## Prazo e dependências

A meta definida pelo proprietário permanece em 04/12/2026, sem extensão automática nem redução de escopo. Há risco real de atraso enquanto pagamentos, contas confirmadas, proprietário administrativo verificado, documentos privados e homologação hospedada dependerem de decisões, credenciais sandbox e validações autorizadas. Esta entrega reduz uma falha independente de autenticação, mas não remove esses bloqueios do caminho crítico.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhuma conta foi aprovada ou promovida; nenhum CAPTCHA, e-mail real, OTP, cobrança ou pagamento foi criado.
- A validação usa API controlada e banco PostgreSQL isolado; não equivale à homologação ponta a ponta com CAPTCHA, SMTP e contas confirmadas.
