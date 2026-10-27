# Entrega: aviso após encerramento inesperado da sessão

Data local: 27/10/2026 13:52:39 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase emite o evento `SIGNED_OUT` por encerramento, expiração ou revogação da sessão, a interface agora informa **Sua sessão terminou. Entre novamente para continuar.**

O espaço privado, os serviços carregados e a conversa aberta são removidos imediatamente da tela. O formulário de entrada volta a ser exibido com foco no e-mail, sem tentar autenticar novamente de forma automática.

As saídas voluntárias continuam apresentando suas mensagens específicas depois que a operação é concluída.

## Evidências automatizadas

- O evento de sessão encerrada fecha a conta e o espaço privado.
- Serviços e mensagens carregados deixam de aparecer na interface.
- O formulário de entrada retorna com foco no campo de e-mail.
- A orientação para entrar novamente é exibida sem nova chamada ao Supabase Auth.
- Testes dirigidos em desktop e viewport Android: **2/2** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **297/297** testes aprovados — 13 testes Node/PostgreSQL isolado e 284 testes Playwright.
- A validação usou a API controlada da interface e um evento de sessão simulado; nenhuma sessão real foi encerrada.
- Banco conectado, produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/mock-supabase.js`
- `tests/ui/flows.spec.js`
