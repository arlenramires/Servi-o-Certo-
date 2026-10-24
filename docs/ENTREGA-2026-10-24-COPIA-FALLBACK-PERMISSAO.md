# Entrega: recuperação da cópia após negação de permissão

Validada em 24/10/2026 às 17:11 (America/Boa_Vista).

## Funcionalidade entregue

- As ações **Copiar código** e **Copiar códigos** tentam primeiro a API moderna da área de transferência.
- Se o navegador expõe essa API, mas recusa a permissão, a interface passa automaticamente ao mecanismo compatível já existente.
- A mensagem de sucesso só é apresentada depois que uma das estratégias conclui a cópia.
- Se as duas estratégias falharem, a mensagem de erro existente continua sendo exibida.
- A recuperação é inteiramente local ao navegador e não consulta nem altera serviços, mensagens ou dados de autenticação.

## Evidências

- Teste dirigido Playwright: 6 cenários aprovados em desktop e viewport Android.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 182 testes Playwright aprovados, totalizando 195 testes.
- O teste específico simula `NotAllowedError` na API moderna, confirma uma única tentativa e comprova que o código autorizado foi copiado pela alternativa compatível.
- Os cenários de cópia em lote validam também o caminho moderno para cliente e prestador.
- Os testes confirmam ausência de mutação nos serviços e ausência de chamadas adicionais à API.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Runtime

- O `npm ci` removeu o Chromium usado pelo Playwright; o navegador foi restaurado pelo espelho já validado.
- Depois da restauração, os seis cenários dirigidos e a suíte completa passaram sem falhas.

## Compatibilidade e segurança

- A mudança não amplia os dados copiados nem contorna uma negativa de acesso a serviços; apenas usa a alternativa local do navegador sobre dados já autorizados e visíveis ao usuário.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alterados.
- Não houve publicação em produção, alteração de banco conectado, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

Navegadores que bloquearem tanto a API moderna quanto o comando compatível continuarão recebendo a mensagem de falha, sem falsa confirmação de cópia.
