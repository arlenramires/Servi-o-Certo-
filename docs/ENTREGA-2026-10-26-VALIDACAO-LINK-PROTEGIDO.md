# Entrega: validação do link protegido

Data local: 26/10/2026 16:41:38 (America/Boa_Vista)

## Resultado funcional

O acesso agora valida o parâmetro `servico` antes de tratá-lo como referência protegida. Valores vazios, acima de 100 caracteres ou fora do conjunto alfanumérico com hífen são removidos imediatamente do endereço, o aviso contextual permanece oculto e o login normal continua disponível com uma mensagem neutra.

A validação acontece antes de autenticação, consulta de pedidos ou construção dos retornos de cadastro e recuperação. O valor rejeitado não é exibido na interface e não é propagado para outro URL. Links válidos e os fluxos já entregues continuam inalterados.

## Evidências automatizadas

- Teste dirigido de interface cobre caracteres inválidos e referência acima do limite, em desktop e Android, verificando URL limpa, login visível, aviso protegido oculto, mensagem neutra, ausência de consultas e ausência do valor recebido na página.
- `npm ci --ignore-scripts`: concluído em ambiente isolado (4 pacotes instalados).
- Teste dirigido `tests/ui/deep-link-focus.spec.js`: **16/16** cenários aprovados (desktop e Android).
- `npm run test:all`: **267/267** testes aprovados — 13 testes Node/PostgreSQL e 254 testes Playwright.
- Banco de produção, hospedagem, pagamentos, aprovações e privilégios administrativos não foram alterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/deep-link-focus.spec.js`
