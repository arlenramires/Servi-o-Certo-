# Entrega: orientação após excesso de tentativas

Data local: 28/10/2026 10:33:20 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase limita temporariamente requisições de autenticação com o código oficial `over_request_rate_limit`, a interface agora orienta a pessoa a aguardar alguns minutos antes de tentar novamente. Antes, login, cadastro, solicitação de recuperação e definição de nova senha apresentavam uma falha genérica de conexão.

Cada etapa permanece pronta para uma tentativa posterior: o e-mail e os dados não secretos úteis são preservados, senhas recusadas são apagadas e o foco retorna ao campo correto. A aplicação não repete automaticamente a requisição, não abre o espaço privado, não altera a senha e não encerra sessões.

## Evidências automatizadas

- Login limitado preserva o e-mail, apaga a senha e realiza uma única chamada.
- Cadastro limitado preserva nome, perfil solicitado e e-mail, apaga as senhas e realiza uma única chamada.
- Solicitação de recuperação limitada mantém o e-mail e a etapa aberta sem novo envio.
- Definição de senha limitada mantém a recuperação protegida, apaga os dois campos e não executa saída.
- Testes dirigidos em desktop e viewport Android: **8/8** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **317/317** testes aprovados — 13 Node/PostgreSQL isolado e 304 Playwright.
- A validação usou API controlada; nenhuma conta ou sessão real foi acessada, nenhuma senha foi alterada e nenhum e-mail real foi enviado.
- Banco conectado, produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
