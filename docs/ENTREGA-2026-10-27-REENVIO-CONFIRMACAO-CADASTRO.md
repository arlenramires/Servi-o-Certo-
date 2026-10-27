# Entrega: reenvio da confirmação de cadastro

Data local: 27/10/2026 07:06:05 (America/Boa_Vista)

## Resultado funcional

Quando o cadastro permanece pendente de confirmação por e-mail, a interface agora oferece **Reenviar confirmação**. A ação usa `auth.resend` com o tipo `signup`, o e-mail original do cadastro e o mesmo endereço de retorno protegido já utilizado na primeira solicitação.

O botão só aparece depois de um cadastro aceito sem sessão e é ocultado após um reenvio concluído ou quando a pessoa troca o modo de acesso. Alterar o campo de e-mail antes do clique não redireciona a confirmação para outro endereço. O reenvio não autentica a conta, não repete `signUp`, não cria perfil e não abre o espaço privado.

## Evidências automatizadas

- Cadastro pendente apresenta a ação de reenvio sem abrir o espaço privado.
- O reenvio usa `type: signup`, o e-mail original e o endereço de retorno esperado.
- Uma alteração posterior no campo de e-mail não muda o destinatário pendente.
- Após o sucesso, a ação é ocultada para evitar reenvios consecutivos pela mesma confirmação visual.
- A API controlada registra exatamente `signUp` e `resend`, sem tentativa de login ou criação duplicada.
- Testes dirigidos em desktop e viewport Android: **2/2** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **291/291** testes aprovados — 13 testes Node/PostgreSQL isolado e 278 testes Playwright.
- O envio real de e-mail não foi executado; limites e entrega continuam sob controle do Supabase e do provedor SMTP configurado.
- Banco conectado, produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/index.html`
- `auth-teste/app.js`
- `tests/ui/mock-supabase.js`
- `tests/ui/flows.spec.js`
