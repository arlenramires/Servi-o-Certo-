# Entrega: acesso temporariamente indisponível

Data local: 28/10/2026 14:16:36 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase recusa o login com `user_banned`, a interface informa de forma neutra que o acesso está temporariamente indisponível e orienta tentar novamente mais tarde ou procurar o suporte. O texto não revela bloqueio administrativo nem detalhes internos da conta.

O e-mail permanece preenchido para correção ou troca de conta, a senha é apagada e o foco volta ao endereço. Uma eventual referência protegida de serviço continua no URL sem ter seu código exibido; o espaço privado permanece fechado e a chamada de autenticação não é repetida automaticamente.

## Referência verificada

- O catálogo atual de erros do Supabase Auth define `user_banned` para usuário com `banned_until` ainda ativo e orienta não realizar novas requisições até a liberação do campo.
- O changelog do Supabase foi consultado antes da implementação. A alteração incompatível recente sobre desativação de cifras TLS 1.2 antigas não muda este tratamento de erro no cliente.

## Evidências automatizadas

- Cenário dirigido em desktop e viewport Android: **2/2** testes aprovados.
- A API controlada retorna `user_banned` para uma única tentativa de login.
- A mensagem não expõe o motivo administrativo; e-mail e link protegido são preservados sem exibir o código.
- A senha é apagada, o foco volta ao e-mail, o reenvio de confirmação permanece oculto e a área privada não abre.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **325/325** testes aprovados — 13 Node/PostgreSQL isolado e 312 Playwright.
- Nenhuma conta real foi acessada e nenhuma alteração foi aplicada ao banco conectado, produção, pagamentos, aprovações ou privilégios administrativos.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
