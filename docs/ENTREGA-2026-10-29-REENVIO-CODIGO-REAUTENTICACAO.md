# Entrega: reenvio controlado após código de reautenticação expirar

Data local: 29/10/2026 05:03:19 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase Auth responde `otp_expired` ao código usado para definir uma nova senha, a interface agora apaga o código vencido, mantém a recuperação aberta e apresenta a ação explícita “Enviar novo código”.

A ação chama `reauthenticate()` somente após o clique e consome sua disponibilidade antes da chamada. Depois do pedido, o botão é ocultado e cliques programáticos adicionais não iniciam outro envio. A pessoa continua no campo do código para aguardar o novo e-mail; senhas já informadas permanecem apagadas e o espaço privado não é aberto.

## Referências verificadas

- A referência atual do Supabase Auth documenta que `reauthenticate()` envia o OTP usado como `nonce` em `updateUser`.
- O catálogo atual de erros do Auth define `otp_expired` como código expirado e orienta nova autenticação.
- O changelog atual foi consultado; a futura retirada de cifras TLS 1.2 antigas não altera este fluxo em navegadores atuais.

## Evidências automatizadas

- Cenário dirigido em desktop e viewport Android: **2/2** aprovado.
- A expiração preserva a recuperação, apaga o código anterior, mantém as senhas limpas, fecha a área privada e não revela a referência protegida.
- O clique produz uma única chamada adicional de reautenticação; uma segunda tentativa programática não produz chamada.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **357/357** testes aprovados — 13 Node/PostgreSQL isolado e 344 Playwright.
- O Chromium ausente no cache do runtime foi restaurado antes da validação; a suíte completa foi repetida com código de saída zero.
- Os testes usam API controlada; nenhum código ou e-mail real foi enviado. Banco conectado, produção, pagamentos, aprovações e privilégios administrativos permaneceram inalterados.

## Arquivos funcionais

- `auth-teste/index.html`
- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
