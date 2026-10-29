# Entrega: correção após reenvio para endereço inválido

Data local: 29/10/2026 03:27:57 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase Auth recusa o reenvio de confirmação com `email_address_invalid`, a interface agora informa que o endereço usado na confirmação não é válido e orienta criar a conta novamente com outro e-mail.

A ação de reenvio é ocultada e o endereço pendente é descartado, impedindo outra solicitação imediata para o mesmo destino. Uma eventual referência protegida de serviço permanece disponível sem revelar seu código; conta, painel privado e espaço de trabalho continuam fechados.

## Referências verificadas

- O catálogo atual de erros do Supabase Auth descreve `email_address_invalid` para endereços não aceitos, incluindo domínios de exemplo ou teste, e orienta usar outro endereço.
- A referência atual de `supabase.auth.resend` confirma o reenvio de confirmação com `type: 'signup'` e o e-mail original.
- O changelog atual do Supabase foi consultado antes da implementação. A restrição de personalização dos templates no plano gratuito não altera o tratamento local dessa recusa.

## Evidências automatizadas

- Cenário dirigido em desktop e viewport Android: **2/2** aprovados.
- O cenário confirma somente uma tentativa de login e um reenvio, orientação para novo cadastro, ação oculta e impossibilidade de repetir o reenvio pela interface.
- O link protegido permanece na URL sem ter seu código exibido; painel de conta e espaço privado permanecem ocultos.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **351/351** testes aprovados — 13 Node/PostgreSQL isolado e 338 Playwright.
- Nenhuma conta ou sessão real foi criada e nenhum e-mail real foi enviado. Banco conectado, produção, pagamentos, aprovações e privilégios administrativos permaneceram inalterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
