# Entrega: saída limitada à sessão atual

Data local: 27/10/2026 10:06:53 (America/Boa_Vista)

## Resultado funcional

O botão **Sair** agora encerra explicitamente somente a sessão aberta no navegador com `signOut({ scope: 'local' })`. Assim, a pessoa sai do Serviço Certo neste dispositivo sem invalidar sessões válidas mantidas em outros aparelhos.

A ação **Entrar com outra conta** nos links protegidos usa o mesmo escopo local. A interface privada é limpa e o código do link permanece disponível para a próxima conta, sem encerrar sessões remotas.

A conclusão da troca de senha continua usando a saída global existente por ser um fluxo de segurança distinto; esta entrega altera apenas as saídas voluntárias comuns.

## Evidências automatizadas

- O logout comum chama o Supabase Auth uma vez com o escopo `local`.
- Após sair, os pedidos e a conversa deixam de aparecer e o formulário de entrada volta a ser exibido.
- A troca de conta em link protegido chama o mesmo escopo local e preserva o pedido original e o código do link.
- Testes dirigidos em desktop e viewport Android: **4/4** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **295/295** testes aprovados — 13 testes Node/PostgreSQL isolado e 282 testes Playwright.
- A validação usou a API controlada da interface; nenhuma sessão real foi encerrada.
- Banco conectado, produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/deep-link-focus.spec.js`
