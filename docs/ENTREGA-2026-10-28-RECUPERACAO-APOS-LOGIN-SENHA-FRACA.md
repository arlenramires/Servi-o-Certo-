# Entrega: recuperação após login com senha fraca

Data local: 28/10/2026 06:40:11 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase recusa o acesso com `weak_password` porque uma senha antiga deixou de atender às regras de segurança, a interface agora muda diretamente para **Recuperar senha** e explica que é necessário criar uma senha mais forte. Antes, a pessoa permanecia no login sem um caminho direto para trocar o segredo recusado.

O e-mail informado permanece preenchido, a senha é apagada e o foco retorna ao e-mail para solicitar as instruções. Se o acesso começou por um link protegido de serviço, a referência continua no endereço, mas seu código não é exibido. O espaço privado permanece fechado.

## Evidências automatizadas

- O acesso envia uma única tentativa ao Auth controlado e reconhece `weak_password` sem autenticar.
- A interface seleciona **Recuperar senha**, preserva o e-mail e posiciona o foco nele.
- A senha recusada é apagada, o campo deixa de ser exibido e o espaço privado continua fechado.
- Uma referência protegida de serviço permanece no endereço e no aviso neutro sem revelar seu código.
- Testes dirigidos em desktop e viewport Android: **2/2** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **305/305** testes aprovados — 13 testes Node/PostgreSQL isolado e 292 testes Playwright.
- O Chromium exigido pelo Playwright foi restaurado após `npm ci`; os testes dirigidos e a suíte integral foram aprovados.
- A validação usou a API controlada da interface; nenhuma conta ou sessão real foi acessada e nenhum e-mail real foi enviado.
- Banco conectado, produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
