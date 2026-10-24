# Entrega: mensagens novas na exportação CSV

Validada em 24/10/2026 às 05:31 (America/Boa_Vista).

## Funcionalidade entregue

- O arquivo gerado por **Baixar lista** agora inclui a coluna **Mensagens novas**.
- Cada linha informa a quantidade de mensagens não lidas do serviço autorizado, permitindo priorizar o acompanhamento fora da tela.
- A exportação continua respeitando busca, filtro e ordenação atuais, inclusive os resultados ainda não expandidos visualmente.
- A contagem reutiliza o resultado privado já carregado pela tela: nenhuma consulta adicional é realizada, nenhuma conversa é marcada como lida e nenhum pedido ou mensagem é alterado.

## Evidências

- Teste direcionado Playwright: 2 cenários aprovados (desktop e viewport Android).
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 180 testes Playwright aprovados, totalizando 193 testes.
- O teste de interface usa API controlada e confirma contagens com e sem mensagens novas, cabeçalho, código do serviço, filtro, ordem, neutralização de fórmula e ausência de mutação nos pedidos e nas mensagens.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Compatibilidade e segurança

- O changelog atual do Supabase foi conferido. As mudanças anunciadas de cifras TLS e de exposição automática de tabelas não afetam esta exportação local.
- O CSV reutiliza exclusivamente serviços e contagens já retornados pelas regras de acesso existentes e mantém UTF-8 com BOM.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.
- Não houve publicação em produção, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

A quantidade representa o estado carregado na tela no momento da exportação. O CSV não consulta novamente o servidor, não marca mensagens como lidas e não é comprovante de atendimento ou pagamento.
