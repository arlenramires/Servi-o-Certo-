# Entrega: código estável da situação na exportação CSV

Validada em 24/10/2026 às 14:21 (America/Boa_Vista).

## Funcionalidade entregue

- A exportação inclui a nova coluna **Situação (código)** ao lado da situação legível.
- O arquivo conserva rótulos claros, como **Concluído** e **Profissional aceitou**, e também os valores estáveis `concluido` e `aceito`.
- O código técnico permite filtros e integrações sem depender de acentos, tradução ou mudanças futuras na apresentação do rótulo.
- A informação reutiliza o status já carregado na lista, sem consulta adicional e sem alteração dos serviços.

## Evidências

- Teste dirigido Playwright: 4 cenários aprovados, cobrindo cliente e prestador em desktop e viewport Android.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 182 testes Playwright aprovados, totalizando 195 testes.
- O cenário de cliente confirma o par `Concluído`/`concluido`, a filtragem, a proteção contra fórmulas e a ausência de mutações.
- O cenário de prestador confirma o par `Profissional aceitou`/`aceito` e que o serviço permanece inalterado.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Runtime

- O primeiro teste dirigido não iniciou porque o Chromium ainda não existia neste runtime.
- Após `npm ci --ignore-scripts`, o Chromium foi instalado e o teste dirigido e a suíte completa passaram.

## Compatibilidade e segurança

- A nova coluna não expõe identidade, credencial ou dado adicional; apenas preserva o valor de status já autorizado para o usuário.
- A proteção já existente contra fórmulas de planilha permanece aplicada a todas as células.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.
- Não houve publicação em produção, alteração de banco conectado, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

O código técnico representa o estado registrado no momento da exportação; ele não acompanha mudanças posteriores do serviço.
