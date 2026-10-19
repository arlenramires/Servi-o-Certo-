# Executar a versão de desenvolvimento

Use a branch `desenvolvimento-login-supabase`.

```sh
git clone --branch desenvolvimento-login-supabase https://github.com/arlenramires/Servi-o-Certo-.git
cd Servi-o-Certo-
npm ci --ignore-scripts
npx playwright install --with-deps chromium
npm run test:all
```

Node.js 24 é a versão usada no GitHub Actions. Os testes não precisam de senhas, tokens administrativos ou acesso ao banco de produção.

Para abrir a área conectada ao Supabase:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Acesse `http://127.0.0.1:8000/auth-teste/`. A raiz `/` continua sendo o protótipo local demonstrativo.

A chave no navegador é pública. Não acrescente `service_role`, segredos de gateway ou senha de banco a arquivos públicos. As permissões ficam no banco.

Antes de testar confirmação e recuperação reais, configure a URL exata de retorno do ambiente em Supabase Auth → URL Configuration → Redirect URLs. Para produção, configurar domínio e SMTP e validar entrega de e-mail; não basta trocar a URL no código.

## O que os testes comprovam

- `npm test`: roda PostgreSQL em WASM com fixture das tabelas afetadas e aplica a migração de segurança desta entrega. Testa permissões e operações reais de SQL, sem simular RLS em JavaScript.
- `npm run test:ui`: executa os formulários e painéis em Chromium desktop e viewport Android com uma API controlada. Não envia e-mails nem realiza pagamentos.
- `supabase/tests/security-flow.sql`: cenário transacional que também foi validado no projeto conectado. Só execute em ambiente autorizado; os dados sintéticos são revertidos, e qualquer erro deve interromper a execução. Não é teste de carga nem de concorrência entre sessões.

Os relatórios do navegador ficam em `playwright-report/`; em CI são disponibilizados como artefato `validacao-servico-certo`. Falhas incluem traces. O workflow tem permissão somente de leitura e não publica o aplicativo.

O fixture parcial `schema-snapshot.json` não deve ser aplicado ao projeto hospedado e não representa todas as tabelas da plataforma. Para reconstrução completa será necessário consolidar o histórico de migrações existente no Supabase.
