# Entrega: datas legíveis e exatas na exportação CSV

Validada em 24/10/2026 às 06:34 (America/Boa_Vista).

## Funcionalidade entregue

- O arquivo gerado por **Baixar lista** agora apresenta **Horário preferido** e **Solicitado em** no formato local brasileiro, mais fácil de ler.
- As colunas correspondentes com sufixo **(ISO)** preservam os valores exatos recebidos, permitindo conferência e importação sem perda de precisão.
- Serviços sem horário preferido mantêm vazias tanto a coluna legível quanto a coluna ISO.
- A exportação continua respeitando busca, filtro e ordenação atuais, sem consulta adicional nem alteração dos serviços.

## Evidências

- Teste direcionado Playwright: 2 cenários aprovados (desktop e viewport Android).
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 180 testes Playwright aprovados, totalizando 193 testes.
- O teste de interface usa API controlada e confirma datas locais calculadas pelo navegador, valores ISO exatos, ausência de horário preferido, filtro, ordem, proteção contra fórmulas e ausência de mutação nos pedidos e mensagens.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Compatibilidade e segurança

- Datas inválidas ou ausentes não produzem texto local enganoso; o valor original permanece disponível na coluna ISO quando existir.
- O CSV reutiliza exclusivamente dados já retornados pelas regras de acesso existentes e mantém UTF-8 com BOM.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.
- Não houve publicação em produção, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

As colunas legíveis usam o fuso horário do navegador no momento da exportação. As colunas ISO devem ser usadas quando a precisão absoluta ou a conversão para outro fuso for necessária.
