# Entrega: link autenticado para localizar serviço

Validada em 24/10/2026 às 18:40 (America/Boa_Vista).

## Funcionalidade entregue

- Cada cartão autorizado oferece a ação **Copiar link**.
- O link contém somente o código do serviço no parâmetro `servico`; descrição, localização, situação e participantes não são expostos na URL.
- Ao abrir o link, a área continua fechada até a autenticação e, depois do login, preenche a busca com o código recebido.
- A localização reutiliza exclusivamente a lista de serviços que o banco já autorizou para a conta autenticada. Um código não autorizado não cria acesso público nem uma consulta privilegiada.
- A cópia usa a mesma estratégia compatível já validada para navegadores que recusam a API moderna.

## Evidências

- Teste dirigido Playwright: 2 cenários aprovados, em desktop e viewport Android.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 184 testes Playwright aprovados, totalizando 197 testes.
- O novo cenário confirma autenticação obrigatória, preenchimento da busca pelo parâmetro, exibição de somente um serviço correspondente, URL copiada sem dados privados, ausência de chamadas adicionais durante a cópia e ausência de mutação nos pedidos.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Runtime

- O `npm ci` removeu o Chromium usado pelo Playwright; a primeira execução dirigida identificou somente a ausência do executável.
- O navegador foi restaurado pelo espelho já validado. Em seguida, o teste dirigido e a suíte completa passaram sem falhas.

## Compatibilidade e segurança

- A implementação é somente de interface e não exige migração ou mudança de política RLS.
- O changelog oficial atual do Supabase foi conferido; não foi identificada incompatibilidade relevante para esta mudança local.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alterados.
- Não houve publicação em produção, alteração de banco conectado, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

O link é uma referência de navegação, não uma autorização. A conta precisa continuar autorizada pelo banco para que o serviço apareça; caso contrário, a busca não retorna o registro.
