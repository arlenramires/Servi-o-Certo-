# Entrega: contenção de reenvio de confirmação indisponível

Data local: 29/10/2026 00:33:38 (America/Boa_Vista)

## Resultado funcional

Quando uma conta ainda não confirmada oferece o reenvio do e-mail e o Supabase recusa a operação com `email_address_not_authorized` ou `email_provider_disabled`, a interface agora apresenta orientação específica e remove a ação de reenvio. Isso impede cliques repetidos contra uma condição que não será resolvida por nova tentativa imediata.

O endereço usado no acesso permanece disponível para conferência, mas a área privada continua fechada. Não há nova autenticação, criação de conta, aprovação de perfil ou reenvio automático.

## Referência verificada

- O catálogo atual do Supabase Auth descreve `email_address_not_authorized` como endereço ao qual o projeto não pode enviar e-mail e `email_provider_disabled` como indisponibilidade do cadastro por e-mail e senha.
- O changelog do Supabase foi consultado antes da implementação. A remoção futura de cifras TLS 1.2 antigas não altera esta contenção no cliente.

## Evidências automatizadas

- Cenário dirigido em desktop e viewport Android: **2/2** aprovados, cobrindo os dois códigos.
- Cada cenário confirma apenas as chamadas originais de login e reenvio; um novo clique programático depois da contenção não produz outra chamada ao Auth.
- O botão de reenvio, o painel de conta e o espaço privado ficam ocultos depois da recusa.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **345/345** testes aprovados — 13 Node/PostgreSQL isolado e 332 Playwright.
- Nenhum e-mail real foi enviado. Banco conectado, produção, pagamentos, aprovações e privilégios administrativos permaneceram inalterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
