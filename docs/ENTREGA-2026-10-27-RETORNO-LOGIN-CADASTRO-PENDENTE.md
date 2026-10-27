# Entrega: retorno ao login após cadastro pendente

Data local: 27/10/2026 05:51:52 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase aceita um cadastro que ainda depende da confirmação do e-mail e não devolve uma sessão, a interface agora retorna automaticamente ao modo de entrada. O nome e o perfil solicitados são limpos, as senhas permanecem vazias, o e-mail é preservado para o acesso posterior e o foco segue para a senha.

O retorno não repete o cadastro nem inicia uma tentativa de entrada: existe somente a chamada original a `signUp`. O espaço privado continua fechado, e a mensagem mantém explícitas tanto a confirmação por e-mail quanto a análise necessária para o perfil de prestador.

## Evidências automatizadas

- Cadastro pendente retorna de **Criar conta** para **Entrar** e oculta os campos exclusivos de cadastro.
- Nome e perfil solicitado são limpos; o perfil local volta a cliente sem conceder autoridade.
- E-mail é preservado, senhas permanecem vazias e o foco retorna ao campo de senha.
- A API controlada registra exatamente uma chamada, a solicitação original de cadastro.
- Testes dirigidos em desktop e viewport Android: **2/2** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **291/291** testes aprovados — 13 testes Node/PostgreSQL isolado e 278 testes Playwright.
- Banco de produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
