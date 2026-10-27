# Entrega: recuperação do acesso com e-mail não confirmado

Data local: 27/10/2026 08:23:33 (America/Boa_Vista)

## Resultado funcional

Quando uma tentativa de entrada recebe do Supabase o código `email_not_confirmed`, a interface agora apresenta **Reenviar confirmação**. A ação fica vinculada ao e-mail usado na tentativa recusada, mesmo se o campo visível for alterado antes do clique, e reutiliza o endereço de retorno protegido do fluxo.

A senha é apagada, o foco retorna ao campo de senha e o espaço privado permanece fechado. O reenvio não repete o cadastro, não inicia outra tentativa de login, não cria perfil e não concede qualquer autorização.

## Evidências automatizadas

- `email_not_confirmed` apresenta a orientação de confirmação e a ação de reenvio.
- Senha é apagada, foco retorna ao campo correto e nenhuma área privada é exibida.
- O reenvio usa `type: signup`, o e-mail da tentativa original e o endereço de retorno esperado.
- Alterar posteriormente o campo visível não muda o destinatário pendente.
- A API controlada registra exatamente uma tentativa de login e um reenvio, sem novo `signUp`.
- Testes dirigidos em desktop e viewport Android: **2/2** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **293/293** testes aprovados — 13 testes Node/PostgreSQL isolado e 280 testes Playwright.
- O envio real de e-mail não foi executado; limites e entrega continuam sob controle do Supabase e do provedor SMTP configurado.
- Banco conectado, produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/mock-supabase.js`
- `tests/ui/flows.spec.js`
