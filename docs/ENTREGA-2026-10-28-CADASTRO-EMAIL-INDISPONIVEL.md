# Entrega: retorno seguro quando o cadastro por e-mail está indisponível

Data local: 28/10/2026 11:11:45 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase recusa a criação de conta com os códigos oficiais `signup_disabled` ou `email_provider_disabled`, a interface agora informa que novos cadastros por e-mail estão temporariamente indisponíveis e retorna ao modo de entrada. Antes, essas situações apareciam como uma falha genérica de conexão e deixavam o formulário na etapa de cadastro.

O e-mail permanece preenchido para quem já possui conta, enquanto nome, perfil solicitado e senhas são removidos. O foco retorna à senha de entrada. A aplicação não repete a requisição, não reenvia confirmação, não autentica e não abre o espaço privado.

## Evidências automatizadas

- Os dois códigos oficiais de indisponibilidade retornam ao login com a mesma orientação segura.
- O e-mail é preservado; nome, perfil solicitado e as duas senhas são limpos.
- Reenvio de confirmação e espaço privado permanecem ocultos.
- Cada tentativa produz exatamente uma chamada de cadastro, sem repetição automática.
- Testes dirigidos em desktop e viewport Android: **2/2** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **319/319** testes aprovados — 13 Node/PostgreSQL isolado e 306 Playwright.
- A validação usou API controlada; nenhuma conta real foi criada ou acessada e nenhum e-mail real foi enviado.
- Banco conectado, produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
