# Entrega — mensagens não lidas por serviço

Validada em 19/10/2026 às 12h39 (Boa Vista).

## Funcionalidade

- Cliente e prestador veem, no cartão do serviço, quantas mensagens da outra parte ainda não foram lidas.
- Mensagens enviadas pelo próprio usuário não entram na contagem.
- Abrir a conversa registra a leitura de forma idempotente e remove o indicador.
- O marcador pertence ao usuário autenticado e só pode ser consultado na conversa da qual ele participa.
- Escrita direta no marcador foi revogada; a atualização ocorre por função validada.

## Evidências

- `npm ci --ignore-scripts`: concluído.
- `npm run test:all`: 10/10 testes Node/PostgreSQL e 46/46 testes Playwright aprovados.
- A suíte de interface validou a contagem e a baixa em desktop e viewport Android.
- O teste SQL validou duas mensagens recebidas, exclusão da mensagem própria, leitura idempotente, nova mensagem posterior, escrita direta bloqueada e isolamento de terceiro.

Na primeira tentativa da suíte completa, o cache compartilhado do Chromium encerrou todos os navegadores com erro de ICU. O navegador foi reinstalado pelo Playwright e a suíte completa foi repetida com sucesso.

## Limites e segurança

A migração foi aplicada somente ao PostgreSQL isolado dos testes. Não houve aplicação no Supabase conectado, publicação em produção, alteração na `main`, cobrança, gasto, aprovação de documento/profissão ou concessão de administrador. A versão pública, as 82 profissões e a identidade azul e branca foram preservadas.

Esta entrega cria apenas o indicador interno. Push, e-mail e alertas fora do aplicativo continuam dependentes de integrações e permissões próprias.
