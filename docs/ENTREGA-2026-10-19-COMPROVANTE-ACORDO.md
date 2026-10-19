# Entrega — comprovante exportável do acordo

Validada em 19/10/2026 às 13h24 (Boa Vista).

## Funcionalidade

- Após o aceite do cliente e do prestador, a conversa oferece o botão **Baixar comprovante do acordo**.
- O arquivo JSON registra a versão exata, identificadores do serviço e orçamento, conteúdo do acordo, hash e data dos dois aceites.
- O comprovante não é disponibilizado enquanto faltar o aceite de uma das partes.
- O nome do arquivo identifica o serviço e a versão, facilitando guardar versões sem sobrescrever o histórico.
- O próprio arquivo e a interface esclarecem que ele não comprova pagamento e não substitui assinatura digital certificada.

O comprovante é montado apenas com dados que a RLS existente já liberou ao participante autenticado. Esta entrega não amplia acesso ao banco nem cria nova migração.

## Evidências

- `npm ci --ignore-scripts`: concluído na segunda tentativa. A primeira recebeu HTTP 403 transitório do registro npm.
- `npm run test:all`: aprovado.
  - 12/12 testes Node/PostgreSQL, incluindo dois testes unitários novos do comprovante.
  - 48/48 testes Playwright, sendo 24 desktop e 24 no viewport Android.
- Testes verificam conteúdo, hash e ordem dos aceites, bloqueio sem aceite bilateral, nome do download e arquivo JSON efetivamente baixado.

O Chromium precisou ser reinstalado porque o cache inicial encerrava o navegador antes dos testes. Depois da reinstalação, a suíte completa foi repetida e aprovada.

## Limites e preservação

O arquivo é um comprovante eletrônico de homologação, não uma assinatura ICP-Brasil, validação jurídica ou prova de pagamento. Revisão jurídica e homologação com contas confirmadas seguem pendentes.

Nenhuma alteração foi aplicada ao Supabase conectado ou à produção. Não houve publicação, pagamento, gasto, aprovação de documentos/profissões ou concessão de administrador. A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
