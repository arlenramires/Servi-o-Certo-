# Entrega — contenção de CAPTCHA recusado na reautenticação

Data da validação: 04/11/2026 17:35:51 (America/Boa_Vista)

## Entrega funcional

A recuperação de senha agora contém `captcha_failed` retornado ao pedir ou reenviar o código de reautenticação:

- informa que a verificação de segurança precisa ser refeita;
- consome o pedido recusado e impede outra chamada de `updateUser()` ou `reauthenticate()` na mesma abertura;
- exige recarregar a página antes de reabrir a recuperação;
- mantém senhas apagadas e a área privada fechada;
- preserva o contexto protegido do serviço sem revelar seu código;
- aplica a mesma proteção no pedido inicial e no reenvio após código expirado.

Não houve mudança de banco, verificação CAPTCHA real, envio de e-mail ou OTP, alteração de conta, concessão administrativa ou publicação em produção.

## Referências verificadas

O catálogo oficial define `captcha_failed` como falha na verificação do desafio pelo provedor e recomenda identificar erros pelo código estável. A referência JavaScript informa que `auth.reauthenticate()` exige usuário autenticado e envia um OTP para a conta. A documentação de CAPTCHA confirma seu uso nos fluxos de acesso e recuperação. O changelog de Auth não apresenta incompatibilidade específica com esta entrega; a mudança futura relevante continua sendo a remoção de cifras TLS antigas em 10/11/2026.

- https://supabase.com/docs/guides/auth/debugging/error-codes
- https://supabase.com/docs/reference/javascript/auth-reauthenticate
- https://supabase.com/docs/guides/auth/auth-captcha
- https://supabase.com/changelog?tags=auth

## Evidências

1. `npm ci --ignore-scripts`: concluído.
2. O runtime não tinha o Chromium após a instalação limpa. O primeiro host retornou arquivos vazios; o espelho alternativo do Playwright restaurou Chromium, FFMPEG e Headless Shell.
3. Testes dirigidos Playwright, cobrindo pedido inicial e reenvio em desktop e viewport Android: **4/4 aprovados** depois da restauração do navegador.
4. `npm run test:all`: **425/425 aprovados**:
   - 13 testes Node/PostgreSQL isolado;
   - 412 testes Playwright com API controlada.
5. As provas confirmam que a falha consome a ação nos dois pontos, impede chamadas extras e mantém o espaço privado fechado.

## Prazo e dependências

A meta definida pelo proprietário permanece em 04/12/2026, sem extensão automática nem redução de escopo. Há risco real de atraso enquanto pagamentos, contas confirmadas, proprietário administrativo verificado, documentos privados e homologação hospedada dependerem de decisões, credenciais sandbox e validações autorizadas. Esta entrega reduz uma falha independente de autenticação, mas não remove esses bloqueios do caminho crítico.

## Limites preservados

- `main`, a página pública, o catálogo de 82 profissões e a identidade azul e branca não foram alterados.
- Nenhum banco conectado ou de produção foi consultado ou modificado.
- Nenhuma conta foi aprovada ou promovida; nenhum CAPTCHA, e-mail real, OTP, cobrança ou pagamento foi criado.
- A validação usa API controlada e banco PostgreSQL isolado; não equivale à homologação ponta a ponta com CAPTCHA, provedor de e-mail e contas confirmadas.
