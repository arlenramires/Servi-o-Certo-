# Entrega: reautenticação para definir nova senha

Data local: 29/10/2026 03:52:52 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase Auth responde `reauthentication_needed` durante a definição da nova senha, a interface agora chama `reauthenticate()` uma única vez, apresenta o campo para o código enviado à conta e solicita que a nova senha seja digitada novamente.

O segundo envio inclui o `nonce` informado. Um código válido conclui a troca e encerra as sessões com escopo global, como já exigido pelo fluxo. Um código recusado com `reauthentication_not_valid` é apagado, recebe o foco e mantém a recuperação aberta para correção sem disparar outro e-mail automaticamente.

## Referências verificadas

- O guia atual de segurança de senhas do Supabase documenta `reauthenticate()` e o envio do `nonce` em `updateUser` quando a política exige autenticação recente.
- O catálogo atual do Supabase Auth orienta chamar `reauthenticate()` para `reauthentication_needed` e pedir um novo código ao usuário quando a validação falha.
- O changelog atual foi consultado. A futura retirada de cifras TLS 1.2 antigas não altera este fluxo em navegadores atuais.

## Evidências automatizadas

- Cenários dirigidos em desktop e viewport Android: **4/4** aprovados.
- O código válido produz exatamente duas chamadas de atualização, uma chamada de reautenticação entre elas e uma saída global após o sucesso.
- O código inválido é apagado e recebe foco; senhas também são limpas, a recuperação permanece visível e nenhum novo código é solicitado automaticamente.
- O link protegido é preservado sem revelar seu código e o espaço privado permanece fechado durante todo o processo.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **355/355** testes aprovados — 13 Node/PostgreSQL isolado e 342 Playwright.
- Os testes usam API controlada; nenhum código ou e-mail real foi enviado. Banco conectado, produção, pagamentos, aprovações e privilégios administrativos permaneceram inalterados.

## Arquivos funcionais

- `auth-teste/index.html`
- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
