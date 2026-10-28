# Entrega: nova senha diferente da atual

Data local: 28/10/2026 07:45:11 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase recusa uma redefinição com o código estável `same_password`, a interface agora informa que a nova senha deve ser diferente da senha atual. Antes, essa resposta aparecia como um erro genérico de conexão e não orientava a correção necessária.

Os dois campos são apagados, o foco retorna à nova senha e a etapa de recuperação permanece aberta para outra tentativa. A senha não é alterada, a saída global não é executada e o espaço privado continua fechado.

## Evidências automatizadas

- A redefinição envia uma única tentativa de atualização ao Auth controlado.
- A resposta `same_password` é traduzida em orientação específica, sem depender do texto retornado pelo servidor.
- Os dois campos são apagados, o foco retorna à nova senha e o painel de recuperação permanece aberto.
- Nenhuma chamada de saída é realizada e o espaço privado continua fechado.
- Testes dirigidos em desktop e viewport Android: **2/2** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **307/307** testes aprovados — 13 testes Node/PostgreSQL isolado e 294 testes Playwright.
- O Chromium exigido pelo Playwright foi restaurado após `npm ci`; os testes dirigidos e a suíte integral foram aprovados.
- A validação usou a API controlada da interface; nenhuma senha ou sessão real foi alterada.
- Banco conectado, produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
