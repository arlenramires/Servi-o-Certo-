# Entrega: correção de endereço sem envio autorizado

Data local: 28/10/2026 16:12:04 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase responde com `email_address_not_authorized`, cadastro e recuperação informam que não foi possível enviar mensagem ao endereço e orientam a pessoa a usar outro e-mail ou procurar o suporte.

No cadastro, nome, perfil solicitado e endereço permanecem disponíveis para correção, enquanto as duas senhas são apagadas. Na recuperação, o endereço permanece preenchido. Nos dois caminhos, o foco retorna ao e-mail, nenhuma solicitação é repetida automaticamente e a área privada continua fechada.

## Referência verificada

- O catálogo atual de erros do Supabase Auth define `email_address_not_authorized` quando o serviço de e-mail configurado não permite envio ao endereço informado.
- A interface não expõe detalhes internos da configuração SMTP; oferece apenas uma ação segura para a pessoa.
- O changelog do Supabase foi consultado antes da implementação. A alteração incompatível recente sobre cifras TLS 1.2 antigas não muda este tratamento do envio de autenticação.

## Evidências automatizadas

- Cenário dirigido em desktop e viewport Android: **2/2** testes aprovados.
- A API controlada recusa uma chamada de cadastro e uma de recuperação com `email_address_not_authorized`.
- Nome e perfil são preservados no cadastro, senhas são apagadas e o foco retorna ao e-mail.
- A recuperação preserva o endereço e não dispara outra solicitação automaticamente.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **329/329** testes aprovados — 13 Node/PostgreSQL isolado e 316 Playwright.
- Nenhuma conta ou mensagem real foi criada ou enviada. Banco conectado, produção, pagamentos, aprovações e privilégios administrativos permaneceram inalterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
