# Entrega: correção de endereço de e-mail recusado

Data local: 28/10/2026 12:37:37 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase recusa um endereço com o código oficial `email_address_invalid`, cadastro e solicitação de recuperação agora informam que é necessário usar um e-mail válido e devolvem o foco ao campo do endereço. Antes, o cadastro apresentava uma falha genérica de conexão e retornava o foco à senha, embora o dado que precisava de correção fosse o e-mail.

No cadastro, nome e perfil solicitado permanecem disponíveis para correção, enquanto as duas senhas são apagadas. Na recuperação, o endereço permanece preenchido e a etapa continua aberta. A aplicação não repete a requisição, não cria conta, não envia recuperação e não abre o espaço privado.

## Evidências automatizadas

- Cadastro recusado orienta a correção e devolve o foco ao e-mail.
- Nome e perfil solicitado são preservados; senha e confirmação são limpas.
- Recuperação recusada mantém a etapa e o endereço preenchido com foco correto.
- As duas ações produzem exatamente uma chamada cada, sem repetição automática.
- Testes dirigidos em desktop e viewport Android: **2/2** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **321/321** testes aprovados — 13 Node/PostgreSQL isolado e 308 Playwright.
- A validação usou API controlada; nenhuma conta real foi criada e nenhum e-mail real foi enviado.
- Banco conectado, produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
