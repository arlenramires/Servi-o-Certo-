# Serviço Certo — continuidade de execução

Trabalhar na branch `desenvolvimento-login-supabase`, preservando `main` e os arquivos originais do protótipo público.

## Entregas registradas

1. [Autenticação, pedidos, aceite e chat com testes](ENTREGA-2026-10-19.md). Código no commit `5c6bfa81f62335f1be25627e579adfe49a51c454`, CI aprovado: https://github.com/arlenramires/Servi-o-Certo-/actions/runs/39206997735.
2. [Orçamento estruturado e decisão protegida](ENTREGA-2026-10-19-ORCAMENTOS.md). Verificar o commit e o GitHub Actions associado a este arquivo antes da próxima alteração.
3. [Contrato versionado e aceite bilateral](ENTREGA-2026-10-19-CONTRATOS.md). Migração preparada e validada somente no PostgreSQL isolado; não aplicada ao Supabase conectado. Verificar o commit e o GitHub Actions associado a este arquivo antes da próxima alteração.

## Próximas entregas prioritárias

- Revisão jurídica do texto-base do contrato e evolução dos contratos para adicionais, cancelamentos, garantias e disputas. Não tratar o texto técnico versionado como validação jurídica.
- Administração de análises com trilha de auditoria, documentos privados e provisionamento seguro do proprietário. Banco sem conta do proprietário confirmada; não escolher administrador por metadados de cadastro.
- Fluxo de execução e conclusão com confirmação do cliente e avaliação das partes. Não marcar pagamento ou repasse como realizado por simulação.
- Vistorias, extras, cancelamento, reencaminhamento e disputas com estados controlados e provas.
- Gateway sandbox: definir provedor e obter credenciais de teste por meio seguro; checkout, webhooks idempotentes, split, garantias, estornos e reconciliação dependem dessa integração.
- Homologação hospedada, e-mails reais, notificações, localização/ETA, LGPD, empacotamento Android e preparação de produção.

## Regras para rodadas automáticas

- Existe uma rotina horária de implementação e uma rotina diária de relatório; a diária não inicia um segundo escritor.
- Conferir HEAD, código e CI atual. Cada entrega deve ter implementação e teste proporcional; não contar alterações apenas documentais como funcionalidade entregue.
- Usar atualização da branch com `expected_sha`, sem force push. Se houver alteração concorrente, reler e integrar com cuidado.
- Testar em ambiente isolado. Não aplicar migrações ou outras mutações ao banco de produção nas rodadas automáticas; preparar migrações versionadas e indicar o que ainda não foi aplicado.
- Não publicar produção, criar gastos ou cobranças reais, nem aprovar usuários/profissões/documentos automaticamente. Não expor credenciais.
- Nunca contornar bloqueio de aprovação. O CLI Supabase foi bloqueado anteriormente por tentativa de telemetria ao PostHog; usar conectores autorizados quando apropriado, sem repetir essa execução bloqueada.
- Se uma frente depender de acesso, credencial ou revisão externa, registrar o impedimento e avançar em outra pendência independente.
- Ao informar uma entrega, distinguir teste de UI com API controlada, SQL no banco isolado, SQL no Supabase conectado e teste real ponta a ponta com contas confirmadas.
- A rotina agenda rodadas; não garante processo contínuo, nem commit a cada hora. Relatar falhas e falta de runtime com precisão, sem inventar avanço.

## Testes existentes

`npm ci --ignore-scripts` e `npm run test:all` (instalar Chromium com Playwright quando necessário). Fixture parcial de dez tabelas, sem segredos ou dados pessoais, usada somente nos testes. Não é backup nem migração inicial completa do projeto.

As duas migrações de segurança desta execução foram aplicadas e testadas no projeto conectado sob autorização expressa do proprietário durante a sessão. Essa aplicação não concede autorização de implantação autônoma em produção às rodadas futuras.
