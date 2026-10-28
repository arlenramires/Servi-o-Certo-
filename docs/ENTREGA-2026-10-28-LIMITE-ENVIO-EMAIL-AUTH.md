# Entrega: contenção após limite de envio de e-mails

Data local: 28/10/2026 13:00:03 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase informa `over_email_send_rate_limit`, a interface orienta a pessoa a aguardar antes de solicitar outro e-mail. O tratamento cobre cadastro, recuperação de senha e reenvio da confirmação.

Se o limite ocorrer no reenvio da confirmação, a ação é ocultada depois da única tentativa recusada. Isso impede cliques repetidos na mesma etapa; o espaço privado permanece fechado e nenhuma autenticação ou nova solicitação é executada automaticamente.

## Evidências automatizadas

- Cadastro limitado preserva os dados não secretos úteis, limpa as senhas e realiza uma única chamada.
- Recuperação limitada permanece aberta, preserva o e-mail e realiza uma única chamada.
- Reenvio limitado usa o endereço original da tentativa de login e oculta a ação após a recusa.
- Nenhum dos três caminhos repete automaticamente a chamada ou abre o espaço privado.
- Testes dirigidos em desktop e viewport Android: **2/2** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **323/323** testes aprovados — 13 Node/PostgreSQL isolado e 310 Playwright.
- A validação usou API controlada; nenhum e-mail real foi enviado e nenhuma conta real foi acessada.
- Banco conectado, produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
