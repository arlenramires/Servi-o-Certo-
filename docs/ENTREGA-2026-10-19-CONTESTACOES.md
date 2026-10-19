# Entrega — abertura e manifestação de contestação

Horário da validação local: **2026-10-19 09:29:29 -04:00**.

## Funcionalidade entregue

- Cliente ou prestador atribuído pode abrir uma contestação categorizada durante ou depois da execução do serviço.
- O relato original fica imutável e a outra parte pode registrar uma única manifestação, também imutável.
- A interface deixa explícito que o registro não decide responsabilidade, pagamento ou estorno e que uma contestação respondida ainda depende de análise administrativa.
- Há no máximo uma contestação por serviço nesta etapa; uma repetição idêntica é idempotente e qualquer tentativa de substituir relato ou resposta é recusada.
- A tabela usa RLS para leitura exclusiva das partes. Escrita direta foi revogada; abertura e resposta passam por funções autenticadas que conferem o vínculo com o serviço.

## Evidências

- `npm ci --ignore-scripts`: concluído com 4 pacotes instalados e sem execução de scripts de dependências.
- `npm run test:all`: aprovado.
  - 8/8 testes Node/PostgreSQL no PGlite isolado.
  - 40/40 testes Playwright, sendo 20 desktop e 20 em viewport Android.
- Cobertura nova de banco: estado do serviço, validação de categoria e tamanho, idempotência, imutabilidade, resposta somente pela outra parte, RLS, negação de escrita direta e ausência de leitura/resposta por terceiro.
- Cobertura nova de UI: abertura pelo cliente sem alegação financeira e manifestação da outra parte com aviso de análise administrativa pendente, em desktop e viewport Android.

## Limites e pendências

A migração `20261019133000_service_disputes_intake.sql` foi executada somente no PostgreSQL efêmero dos testes. Não foi aplicada ao Supabase conectado nem à produção. Esta entrega ainda não recebe anexos/provas nem permite decisão por administrador, restituição, cobrança, retenção ou alteração automática do estado do serviço. Essas etapas dependem de armazenamento privado, política de retenção, provisionamento verificado do proprietário e, para efeitos financeiros, gateway sandbox autorizado.

Não houve publicação, gasto, aprovação de documentos/profissões, concessão de administrador ou alteração da branch `main`. O aplicativo público, as 82 profissões e a identidade azul e branca permanecem preservados.
