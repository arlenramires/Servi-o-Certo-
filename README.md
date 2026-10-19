# Serviço Certo

Desenvolvimento da plataforma de contratação de profissionais, inicialmente em Manaus.

## Versões existentes

- `index.html`: protótipo público original, preservado. Usa dados locais demonstrativos; não é a versão comercial.
- `auth-teste/`: área de desenvolvimento conectada ao Supabase, na branch `desenvolvimento-login-supabase`. Inclui autenticação, solicitação de prestador, criação de pedidos, busca/aceite, conversa, orçamento e acordo eletrônico versionado com aceite das partes. Os acordos estão em homologação; pagamentos ainda não estão disponíveis.

A área de desenvolvimento precisa ser servida por HTTP/HTTPS. Para teste local, rode `python3 -m http.server 8000 --bind 127.0.0.1` e abra `http://127.0.0.1:8000/auth-teste/`. Não configure o GitHub Pages público para esta branch como parte dos testes.

## Testes

```sh
npm ci --ignore-scripts
npx playwright install --with-deps chromium
npm run test:all
```

Consulte [instruções de teste](docs/EXECUTAR-TESTES.md) e [entrega com evidências e pendências](docs/ENTREGA-2026-10-19.md).

O workflow de validação roda no GitHub Actions sem credenciais de produção e sem implantar o aplicativo. Os testes de interface usam uma API controlada; a segurança é testada separadamente com SQL. A validação no viewport Android não equivale a APK nem teste em aparelho físico.

## Condição de lançamento

O aplicativo ainda não está liberado para clientes reais. Faltam homologação com contas confirmadas, administração e validação profissional completas, revisão jurídica dos acordos e homologação de ponta a ponta, integração financeira sandbox, conclusão/repasse/avaliação de ponta a ponta, LGPD e revisão jurídica/financeira, notificações, empacotamento mobile e configuração de produção.

A chave publishable no navegador é pública. Nunca adicione `service_role`, senhas ou segredos financeiros ao frontend.
