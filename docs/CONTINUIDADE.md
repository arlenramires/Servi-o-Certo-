# Serviço Certo — continuidade de execução

Trabalhar na branch `desenvolvimento-login-supabase`, preservando `main` e os arquivos originais do protótipo público.

## Entregas registradas

1. [Autenticação, pedidos, aceite e chat com testes](ENTREGA-2026-10-19.md). Código no commit `5c6bfa81f62335f1be25627e579adfe49a51c454`, CI aprovado: https://github.com/arlenramires/Servi-o-Certo-/actions/runs/39206997735.
2. [Orçamento estruturado e decisão protegida](ENTREGA-2026-10-19-ORCAMENTOS.md). Verificar o commit e o GitHub Actions associado a este arquivo antes da próxima alteração.
3. [Acordo versionado com aceite das partes](ENTREGA-2026-10-19-CONTRATOS.md). Código integrado à conversa do serviço; revisão jurídica, identidade e homologação comercial pendentes.
4. [Execução, conclusão confirmada e avaliações](ENTREGA-2026-10-19-EXECUCAO.md). Migração preparada e validada somente no PostgreSQL isolado; verificar commit e CI antes da próxima alteração.
5. [Cancelamento antes do início e reencaminhamento seguro](ENTREGA-2026-10-19-CANCELAMENTOS.md). Cliente pode cancelar pedido aberto/aceito; cancelamento do prestador antes do início cria novo chamado sem permitir que ele o aceite novamente. Migração preparada e validada somente no PostgreSQL isolado.
6. [Serviços extras com decisão do cliente](ENTREGA-2026-10-19-EXTRAS.md). Prestador registra novo escopo e valor durante a execução; cliente aceita ou recusa de forma imutável antes da conclusão. Nenhuma cobrança é criada.
7. [Abertura e manifestação de contestação](ENTREGA-2026-10-19-CONTESTACOES.md). As partes registram relato e manifestação imutáveis com acesso protegido; análise administrativa, provas e efeitos financeiros não foram automatizados.
8. [Proposta de vistoria antes do orçamento](ENTREGA-2026-10-19-VISTORIAS.md). Prestador registra finalidade, data e valor previsto; cliente aceita ou recusa. Aceite permanece pendente de pagamento e não confirma agenda.
9. [Mensagens não lidas por serviço](ENTREGA-2026-10-19-MENSAGENS-NAO-LIDAS.md). Cliente e prestador recebem contagem privada das mensagens da outra parte; abrir a conversa registra a leitura. Push e e-mail não fazem parte desta entrega.
10. [Comprovante exportável do acordo](ENTREGA-2026-10-19-COMPROVANTE-ACORDO.md). Após o aceite bilateral, as partes podem baixar a versão, o hash e os dois registros de aceite em JSON. O arquivo não comprova pagamento nem substitui assinatura certificada.
11. [Status de deslocamento do prestador](ENTREGA-2026-10-19-DESLOCAMENTO.md). Prestador registra “a caminho” e “cheguei ao local” em ordem protegida; cliente acompanha o estado dentro do serviço. GPS e ETA não fazem parte desta entrega.
12. [Chegada obrigatória antes do início](ENTREGA-2026-10-19-INICIO-APOS-CHEGADA.md). O botão e a operação protegida de início só são liberados depois que o prestador registra a chegada ao local.
13. [Previsão manual de chegada](ENTREGA-2026-10-19-ETA-MANUAL.md). Durante o deslocamento, o prestador informa ou atualiza uma previsão de 10 a 90 minutos que fica visível ao cliente, sem coleta de GPS.
14. [Confirmação da chegada pelo cliente](ENTREGA-2026-10-20-CONFIRMACAO-CHEGADA.md). Depois da chegada informada pelo prestador, somente o cliente confirma a presença; o início fica bloqueado até essa confirmação.
15. [Ajuste antes da confirmação de conclusão](ENTREGA-2026-10-20-AJUSTE-CONCLUSAO.md). Após o prestador declarar a conclusão, o cliente pode pedir um ajuste; a confirmação fica bloqueada até a resposta imutável do prestador.
16. [Atualizações de andamento do serviço](ENTREGA-2026-10-20-ANDAMENTO-SERVICO.md). Durante a execução, o prestador registra marcos crescentes com resumo; o cliente acompanha o histórico privado antes da conclusão.
17. [Reagendamento antes do deslocamento](ENTREGA-2026-10-20-REAGENDAMENTO.md). Prestador propõe nova data com motivo; cliente aceita ou recusa, e somente o aceite atualiza a agenda antes de “Estou a caminho”.
18. [Reagendamento bilateral com bloqueio de deslocamento](ENTREGA-2026-10-20-REAGENDAMENTO-BILATERAL.md). Cliente ou prestador propõe nova data; somente a outra parte decide, e uma proposta pendente impede o início do deslocamento.
19. [Retirada de proposta de reagendamento](ENTREGA-2026-10-20-RETIRADA-REAGENDAMENTO.md). O autor pode retirar sua própria proposta pendente sem apagar o histórico nem alterar a agenda; a retirada libera novamente o fluxo de deslocamento.
20. [Recusa privada de oportunidade](ENTREGA-2026-10-20-RECUSA-OPORTUNIDADE.md). Prestador elegível pode remover um chamado da própria fila sem cancelar o pedido nem escondê-lo de outros profissionais.
21. [Restauração de oportunidade ocultada](ENTREGA-2026-10-20-RESTAURACAO-OPORTUNIDADE.md). Prestador pode revisar os próprios chamados ocultados ainda elegíveis e devolvê-los à própria fila sem afetar outros profissionais.
22. [Contexto seguro da oportunidade](ENTREGA-2026-10-20-CONTEXTO-OPORTUNIDADE.md). Antes do aceite, o prestador vê cidade/UF, urgência e horário preferido sem receber descrição, identidade, endereço ou coordenadas do cliente.
23. [Pedido urgente pelo cliente](ENTREGA-2026-10-20-PEDIDO-URGENTE.md). O cliente pode marcar a solicitação como urgente; a prioridade é persistida, confirmada na própria lista e exibida aos prestadores elegíveis sem ampliar os dados expostos.
24. [Ajuste de urgência do pedido aberto](ENTREGA-2026-10-20-AJUSTE-URGENCIA.md). O cliente pode marcar ou remover a urgência enquanto o pedido próprio continua aberto e sem prestador; terceiros, anônimos e alterações após o aceite são bloqueados.
25. [Ajuste do horário preferido no pedido aberto](ENTREGA-2026-10-20-AJUSTE-AGENDAMENTO-ABERTO.md). O cliente pode alterar ou remover o horário preferido enquanto o pedido próprio permanece aberto e sem prestador; datas passadas, terceiros, anônimos e alterações após o aceite são bloqueados.
26. [Correção da descrição no pedido aberto](ENTREGA-2026-10-20-AJUSTE-DESCRICAO-ABERTO.md). O cliente pode corrigir o texto enquanto o pedido próprio permanece aberto e sem prestador; limites de tamanho, propriedade e congelamento após o aceite são protegidos no banco.
27. [Ajuste da região no pedido aberto](ENTREGA-2026-10-20-AJUSTE-REGIAO-ABERTO.md). O cliente pode corrigir cidade/UF antes do aceite; a busca regional é atualizada, coordenadas antigas são descartadas e terceiros permanecem bloqueados.
28. [Ajuste da profissão no pedido aberto](ENTREGA-2026-10-20-AJUSTE-PROFISSAO-ABERTO.md). O cliente pode trocar a especialidade solicitada antes do aceite; o banco restringe a escolha ao catálogo existente e congela a profissão quando um prestador assume.
29. [Solicitar novamente após cancelamento ou conclusão](ENTREGA-2026-10-20-SOLICITAR-NOVAMENTE.md). O cliente pode reaproveitar profissão, descrição e região em um novo formulário revisável; urgência e agenda são limpas, e o histórico anterior permanece intacto.
30. [Filtros de serviços ativos e histórico](ENTREGA-2026-10-20-FILTROS-SERVICOS.md). A lista pode alternar entre todos, ativos e histórico sem excluir nem modificar pedidos; estados abertos/aceitos/em andamento e concluídos/cancelados permanecem separados de forma clara.
31. [Busca nos próprios serviços](ENTREGA-2026-10-21-BUSCA-SERVICOS.md). Cliente e prestador podem localizar pedidos por profissão ou descrição, combinar a busca com ativos/histórico e limpar o termo sem modificar registros.
32. [Ordenação dos próprios serviços](ENTREGA-2026-10-21-ORDENACAO-SERVICOS.md). A lista pode priorizar pedidos recentes, antigos ou urgentes, mantendo busca e filtros combináveis sem alterar os registros.

## Próximas entregas prioritárias

- Acordos: revisar texto/processo com responsável jurídico e homologar com contas confirmadas. O comprovante exportável já foi implementado, mas não tratar o arquivo, hash ou aceite como assinatura certificada ou validação jurídica.
- Administração de análises com trilha de auditoria, documentos privados e provisionamento seguro do proprietário. Banco sem conta do proprietário confirmada; não escolher administrador por metadados de cadastro.
- Homologar execução, conclusão e avaliações com contas confirmadas no ambiente conectado. O fluxo não movimenta nem comprova pagamento ou repasse.
- Vistorias: após autorização do gateway sandbox, confirmar pagamento/agendamento e implementar a regra comercial de repasse ou abatimento. Provas privadas e análise administrativa das contestações dependem de armazenamento e proprietário verificado. Homologar esses fluxos com contas confirmadas no ambiente conectado.
- Gateway sandbox: definir provedor e obter credenciais de teste por meio seguro; checkout, webhooks idempotentes, split, garantias, estornos e reconciliação dependem dessa integração.
- Homologação hospedada, e-mails reais, notificações push (o indicador interno de não lidas já foi implementado), localização por GPS/ETA automático (os estados e a previsão manual já foram implementados), LGPD, empacotamento Android e preparação de produção.

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

As migrações de segurança e de acordos desta execução foram aplicadas e testadas no projeto conectado sob autorização expressa do proprietário durante a sessão. Essa aplicação não concede autorização de implantação autônoma em produção às rodadas futuras.
