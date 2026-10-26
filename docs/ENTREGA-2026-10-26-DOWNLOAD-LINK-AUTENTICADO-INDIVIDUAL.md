# Entrega — download do link autenticado individual

Horário da validação: 26/10/2026, 04:58:03 (America/Boa_Vista).

## Resultado funcional

- Cada cartão autorizado em **Meus serviços** possui a ação **Baixar link**.
- A ação gera um arquivo `.txt` contendo somente o endereço autenticado com o código do serviço.
- O nome do arquivo identifica o serviço de forma segura para facilitar envio e conferência.
- O destino do link continua exigindo login com uma conta participante do serviço.
- Descrição livre, participantes, mensagens, propostas e valores não entram no arquivo.
- A ação reutiliza o registro já autorizado e carregado, sem nova consulta nem alteração do pedido.

## Evidências

- `npm ci --ignore-scripts`: concluído sem erro.
- Teste dirigido: 2/2 aprovados (desktop e Android).
- `npm run test:all`: 251/251 aprovados — 13 testes de domínio/PostgreSQL e 238 testes de interface.
- O teste confirma o nome `servico-download-service-link-link.txt`, o endereço exato esperado, a ausência da descrição privada e a inexistência de nova consulta ou mutação.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade e segurança

A entrega não altera Supabase Auth, RLS, esquema, migrações ou consultas ao banco. O acesso pelo link permanece protegido pelas mesmas regras de conta participante do serviço.

## Arquivos alterados

- `auth-teste/app.js`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-26-DOWNLOAD-LINK-AUTENTICADO-INDIVIDUAL.md`
