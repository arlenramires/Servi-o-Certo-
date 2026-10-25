# Entrega: resumo seguro do serviço em arquivo de texto

Validada em 24/10/2026 às 20:44 (America/Boa_Vista).

## Funcionalidade entregue

- Cada cartão autorizado oferece a ação **Baixar resumo**.
- O arquivo `.txt` contém código, profissão, situação legível, cidade/UF, indicação de urgência, data da solicitação, horário preferido quando válido e link autenticado.
- A descrição livre, nomes dos participantes, mensagens, propostas e valores não são incluídos.
- O nome segue o formato `servico-<codigo>-resumo.txt`, com neutralização de caracteres impróprios.
- O download reutiliza somente os dados já carregados no cartão e não faz consultas adicionais nem modifica o serviço.

## Evidências

- Teste dirigido Playwright: 2 cenários aprovados, em desktop e viewport Android.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 190 testes Playwright aprovados, totalizando 203 testes.
- O cenário abre o download real, confere o nome e todo o conteúdo do arquivo, confirma a ausência da descrição privada e comprova que não houve chamada adicional à API nem mutação do pedido.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Runtime

- O Chromium removido pela instalação limpa foi restaurado pelo espelho já validado antes dos testes.
- O teste dirigido e a suíte completa passaram sem falhas.

## Compatibilidade e segurança

- A implementação é somente de interface e mantém a autorização sob as políticas RLS existentes.
- O changelog oficial do Supabase foi conferido em 24/10/2026. A remoção anunciada de cifras TLS 1.2 antigas não afeta este download local nem exige mudança no cliente moderno usado pelo projeto.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alterados.
- Não houve publicação em produção, alteração de banco conectado, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

O arquivo é uma referência de atendimento e conferência. Ele não comprova pagamento, identidade, assinatura ou o estado futuro do serviço, e o link continua exigindo autenticação e autorização da conta participante.
