# Entrega: cópia em lote dos códigos dos serviços filtrados

Validada em 24/10/2026 às 16:37 (America/Boa_Vista).

## Funcionalidade entregue

- A área **Meus serviços** oferece agora a ação **Copiar códigos**.
- A cópia inclui todos os serviços correspondentes ao filtro, busca e ordenação atuais, inclusive os que ainda não aparecem na paginação visual.
- Cada código é colocado em uma linha, pronto para colar em atendimento, conferência ou planilha.
- A interface confirma de forma acessível quantos códigos foram copiados, com singular e plural corretos.
- A ação fica indisponível quando o recorte não possui resultados.
- A cópia reutiliza somente os dados já autorizados e carregados, sem consulta adicional e sem alteração dos serviços ou mensagens.

## Evidências

- Teste dirigido Playwright: 4 cenários aprovados, cobrindo cliente e prestador em desktop e viewport Android.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 182 testes Playwright aprovados, totalizando 195 testes.
- O cenário de cliente valida 12 códigos filtrados, a ordem atual, a inclusão dos resultados além dos dez visíveis e a exclusão do serviço fora do filtro.
- O cenário de prestador valida a cópia em singular e o identificador autorizado.
- Os cenários confirmam ausência de novas chamadas à API e ausência de mutações.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Runtime

- O Chromium não estava disponível depois da instalação limpa e foi restaurado no runtime.
- Após a restauração, os quatro cenários dirigidos e a suíte completa passaram sem falhas.

## Compatibilidade e segurança

- O mecanismo existente mantém alternativa de cópia para navegadores sem a API moderna de área de transferência.
- Somente identificadores de serviços já autorizados entram na cópia; descrição, identidade, endereço, coordenadas e credenciais não são incluídos.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alterados.
- Não houve publicação em produção, alteração de banco conectado, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

A lista copiada é um retrato do recorte atual e não substitui consulta posterior ao estado do serviço na plataforma.
