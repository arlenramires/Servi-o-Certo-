# Entrega: contenção do limite de e-mails na reautenticação

Data local: 29/10/2026 07:39:51 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase Auth responde `over_email_send_rate_limit` ao envio inicial do código de reautenticação ou ao reenvio solicitado depois de um código vencido, a recuperação agora bloqueia novas solicitações na mesma abertura e orienta aguardar antes de reiniciar o fluxo.

O bloqueio é ativado assim que a recusa é recebida. O botão de reenvio é consumido antes da chamada e permanece oculto; novos envios do formulário são recusados localmente, sem alcançar `updateUser()` ou `reauthenticate()`. Senhas são apagadas e conta, painel e espaço privado permanecem fechados.

## Referências verificadas

- A documentação atual de testes do Supabase Auth confirma que o serviço retorna HTTP 429 com `over_email_send_rate_limit` quando o limite de e-mails é atingido.
- O catálogo atual do Auth orienta aguardar antes de solicitar outro e-mail.
- O changelog atual foi consultado. A retirada futura de cifras TLS 1.2 antigas não altera este controle no navegador; esta entrega não modifica schema, banco ou configuração de SMTP.

## Evidências automatizadas

- Cenários dirigidos em desktop e viewport Android: **4/4** aprovados.
- O limite no primeiro envio produz somente uma chamada de atualização e uma de reautenticação; novo envio do formulário não gera outra chamada.
- O limite no reenvio consome e oculta a ação; tentar usar novamente o formulário também não alcança o Auth.
- Senhas são apagadas e o espaço privado permanece fechado em ambos os caminhos.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **363/363** testes aprovados — 13 Node/PostgreSQL isolado e 350 Playwright.
- O Chromium ausente após a instalação limpa foi restaurado no runtime isolado antes dos testes; a suíte terminou com código de saída zero.
- Os testes usam API e limite de e-mail controlados; nenhum e-mail real foi enviado. Banco conectado, produção, pagamentos, aprovações e privilégios administrativos permaneceram inalterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
