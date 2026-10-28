# Entrega: orientação após senha fraca recusada

Data local: 28/10/2026 05:24:25 (America/Boa_Vista)

## Resultado funcional

Quando as regras de segurança do Supabase recusam uma senha no cadastro ou na redefinição com o código estável `weak_password`, a interface agora apresenta uma orientação específica para criar uma senha mais forte, em vez do erro genérico de conexão.

Os dois campos de senha rejeitados são apagados, o foco retorna ao primeiro campo da etapa e a pessoa permanece no cadastro ou na redefinição para tentar novamente. Nenhuma conta é criada, nenhuma senha é alterada e o espaço privado continua fechado.

## Evidências automatizadas

- O cadastro envia uma única tentativa ao Auth controlado e traduz `weak_password` em orientação acionável.
- A redefinição envia uma única tentativa de atualização e mantém o painel protegido aberto após a recusa.
- Cadastro e redefinição apagam os dois segredos rejeitados, devolvem o foco e não abrem o espaço privado.
- Testes dirigidos em desktop e viewport Android: **4/4** cenários aprovados.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- `npm run test:all`: **303/303** testes aprovados — 13 testes Node/PostgreSQL isolado e 290 testes Playwright.
- O Chromium exigido pelo Playwright foi restaurado após `npm ci`; a repetição dirigida e a suíte integral foram aprovadas.
- A validação usou a API controlada da interface; nenhuma conta ou sessão real foi criada e nenhuma senha real foi alterada.
- Banco conectado, produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
