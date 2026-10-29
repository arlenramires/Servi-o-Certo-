# Entrega: retorno seguro após falha na verificação CAPTCHA

Data local: 29/10/2026 06:04:16 (America/Boa_Vista)

## Resultado funcional

Quando o Supabase Auth responde `captcha_failed`, login, cadastro e recuperação de senha agora informam que a verificação de segurança não pôde ser confirmada e orientam recarregar a página antes de uma nova tentativa manual.

Cada etapa permanece aberta com e-mail e demais dados úteis preservados. Senhas são apagadas, o foco retorna ao campo adequado e uma eventual referência protegida de serviço continua disponível sem revelar seu código. Conta, painel e espaço privado permanecem fechados; a interface não repete automaticamente nenhuma chamada ao Auth.

## Referências verificadas

- O catálogo atual do Supabase Auth define `captcha_failed` como falha de validação do desafio pelo provedor CAPTCHA e recomenda revisar a integração.
- A documentação atual recomenda CAPTCHA ou Turnstile como proteção contra abuso em endpoints de autenticação.
- O changelog atual foi consultado. A retirada futura de cifras TLS 1.2 antigas e a mudança de exposição automática de novas tabelas não alteram este tratamento no navegador; esta entrega não cria tabela nem migração.

## Evidências automatizadas

- Cenário dirigido em desktop e viewport Android: **2/2** aprovado, exercitando login, cadastro e recuperação em cada execução.
- Cada caminho produz exatamente uma chamada esperada ao Auth, preserva dados não sensíveis e não inicia repetição automática.
- Senhas são apagadas, o foco retorna ao campo da etapa e a referência protegida permanece sem exibir seu código.
- Painel de conta e espaço privado permanecem ocultos durante toda a recusa.
- `npm ci --ignore-scripts`: concluído em ambiente isolado.
- `npm run test:all`: **359/359** testes aprovados — 13 Node/PostgreSQL isolado e 346 Playwright.
- O Chromium ausente no cache do runtime foi restaurado antes da validação; a suíte completa terminou com código de saída zero.
- Os testes usam API e falha CAPTCHA controladas; nenhuma chave CAPTCHA foi usada. Banco conectado, produção, pagamentos, aprovações e privilégios administrativos permaneceram inalterados.

## Arquivos funcionais

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `tests/ui/mock-supabase.js`
