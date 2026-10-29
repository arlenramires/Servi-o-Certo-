# Entrega: retorno seguro após sessão expirada no carregamento

Data local: 28/10/2026 20:54:00 (America/Boa_Vista)

## Resultado funcional

Quando a validação inicial do Supabase informa `session_expired`, `session_not_found`, `refresh_token_not_found` ou `refresh_token_already_used`, a interface agora reconhece que a sessão terminou em vez de apresentar uma falha genérica de conexão.

O espaço privado e seus dados são limpos, o login volta a receber foco e a pessoa recebe uma orientação única para entrar novamente. Uma eventual referência protegida de serviço permanece no endereço para o próximo acesso, mas seu código não é exibido no formulário. A contingência não repete chamadas de autenticação e não tenta renovar uma sessão revogada.

## Referência verificada

- O catálogo atual do Supabase Auth descreve esses quatro códigos como sessão expirada ou inexistente e token de renovação ausente, revogado ou reutilizado fora da janela permitida.
- O changelog do Supabase foi consultado antes da implementação. A alteração incompatível recente sobre cifras TLS 1.2 antigas não modifica esta contingência de sessão no cliente.

## Evidências automatizadas

- Cenário dirigido em desktop e viewport Android: **2/2** testes aprovados, cobrindo os quatro códigos oficiais.
- Para cada código, os painéis da conta e do espaço privado permanecem ocultos, listas privadas ficam vazias e o foco retorna ao e-mail.
- A referência protegida permanece na URL sem ser exibida, pronta para a próxima autenticação autorizada.
- Nenhuma chamada de login, cadastro, recuperação ou renovação é disparada durante a correção.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **339/339** testes aprovados — 13 Node/PostgreSQL isolado e 326 Playwright.
- A comparação dos blobs após a primeira atualização detectou truncamento no arquivo de testes durante o transporte; a publicação foi corrigida em seguida por avanço normal da mesma branch, sem force push, e o conteúdo final foi conferido contra o arquivo validado localmente.
- Nenhuma conta, sessão ou mensagem real foi criada. Banco conectado, produção, pagamentos, aprovações e privilégios administrativos permaneceram inalterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
