# Entrega: referência exata no link autenticado do serviço

Validada em 24/10/2026 às 19:21 (America/Boa_Vista).

## Funcionalidade entregue

- O parâmetro `servico` agora localiza somente o pedido cujo código completo é exatamente igual à referência do link.
- Textos iguais presentes na profissão, descrição, região ou situação de outro pedido não produzem correspondência acidental.
- Se a conta autenticada não receber o serviço em sua lista autorizada, a interface mostra uma mensagem neutra, sem confirmar se o código existe para outra pessoa.
- **Limpar busca** ou **Limpar filtros** encerra o modo de referência, remove o parâmetro da URL e devolve a lista autorizada normal.
- O parâmetro é limitado ao mesmo tamanho máximo aceito pelo campo de busca.

## Evidências

- Teste dirigido Playwright: 4 cenários aprovados, em desktop e viewport Android.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 186 testes Playwright aprovados, totalizando 199 testes.
- Os cenários confirmam correspondência exata, rejeição de coincidência apenas na descrição, mensagem neutra para código indisponível, limpeza da URL, retorno à lista completa e ausência de mutação nos serviços.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Runtime

- O `npm ci` removeu o Chromium usado pelo Playwright; a primeira execução dirigida não iniciou por ausência do executável.
- O navegador foi restaurado pelo espelho já validado. Em seguida, os quatro cenários dirigidos e a suíte completa passaram sem falhas.

## Compatibilidade e segurança

- A implementação é somente de interface e mantém a autorização sob as políticas RLS existentes.
- O changelog oficial do Supabase foi conferido em 24/10/2026. As mudanças anunciadas sobre TLS e exposição automática de novas tabelas não afetam esta entrega, que não cria tabelas nem altera acesso à Data API.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alterados.
- Não houve publicação em produção, alteração de banco conectado, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

O link continua sendo somente uma referência. A visualização exige autenticação e que o serviço faça parte da lista devolvida à conta pelo banco.
