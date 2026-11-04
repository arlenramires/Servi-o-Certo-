# Entrega — retorno seguro após autorização ausente na reautenticação

Data da validação: 04/11/2026 14:47:56 (America/Boa_Vista)

## Entrega funcional

A recuperação de senha agora contém `no_authorization` retornado pelo Supabase Auth ao pedir ou reenviar o código de reautenticação:

- encerra a recuperação que perdeu a autorização em vez de manter um formulário sem sessão válida;
- retorna à solicitação genérica de um novo e-mail de recuperação;
- mantém a senha inalterada e a área privada fechada;
- preserva o contexto protegido do serviço sem revelar seu código;
- não tenta repetir automaticamente `updateUser()` ou `reauthenticate()`.

Não houve mudança de banco, envio real de e-mail ou OTP, desbloqueio de usuário, concessão administrativa ou publicação em produção.

## Referências verificadas

A referência JavaScript atual confirma que `auth.reauthenticate()` envia um OTP para o usuário autenticado. O catálogo oficial define `no_authorization` como ausência do cabeçalho de autorização exigido; manter a recuperação aberta nessa condição não permitiria concluir a operação com segurança. O changelog de Auth também foi conferido; a mudança futura encontrada trata da remoção de cifras TLS antigas em 10/11/2026, sem incompatibilidade específica com este fluxo em navegador moderno.

- https://supabase.com/docs/reference/javascript/auth-reauthenticate
- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/changelog?tags=auth

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. O Chromium não estava presente após a instalação limpa; o navegador foi restaurado pelo espelho alternativo do Playwright antes dos testes da aplicação.
3. Os testes dirigidos foram refinados para aguardar o estado assíncrono de código expirado e respeitar o limite real do campo de OTP; a execução final aprovou **4/4** casos em desktop e viewport Android.
4. A primeira execução de `npm run test:all` aprovou os 13 testes Node/PostgreSQL e 399/400 testes de UI. Um teste preexistente de timeout do reenvio de confirmação excedeu 30 segundos sob saturação do runtime; repetido isoladamente, passou em 1,6 segundo.
5. A repetição integral de `npm run test:all` aprovou **413/413**:
   - 13 testes Node/PostgreSQL isolado;
   - 400 testes Playwright com API controlada.
6. As provas confirmam os dois pontos de contenção: pedido inicial e reenvio após OTP expirado.

## Prazo e dependências

A meta definida pelo proprietário permanece em 04/12/2026, sem redução de escopo. Há risco real de atraso enquanto pagamentos, contas confirmadas, proprietário administrativo verificado, documentos privados e homologação hospedada dependerem de decisões, credenciais sandbox e validações autorizadas. Esta entrega reduz uma falha independente de autenticação, mas não remove esses bloqueios do caminho crítico.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhuma conta foi aprovada ou promovida; nenhum e-mail real, OTP, cobrança ou pagamento foi criado.
- A validação realizada usa API controlada e banco PostgreSQL isolado; não equivale à homologação ponta a ponta com contas confirmadas.
