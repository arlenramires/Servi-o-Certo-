# Entrega: papel do usuário na exportação CSV

Validada em 24/10/2026 às 11:59 (America/Boa_Vista).

## Funcionalidade entregue

- A exportação inclui a nova coluna **Meu papel**.
- Cada serviço exportado é identificado como **Cliente** ou **Prestador**, conforme o perfil autenticado que preparou a planilha.
- O contexto continua correto quando a planilha é compartilhada ou consultada fora da plataforma.
- O valor reutiliza o perfil já carregado na sessão, sem consulta adicional e sem alteração dos serviços.

## Evidências

- Teste dirigido Playwright: 4 cenários aprovados, cobrindo cliente e prestador em desktop e viewport Android.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 182 testes Playwright aprovados, totalizando 195 testes.
- O cenário de cliente confirma a coluna, o valor `Cliente`, os dados filtrados, a proteção contra fórmulas e a ausência de mutações.
- O cenário de prestador confirma o valor `Prestador` e que o serviço permanece inalterado.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Runtime

- O Chromium removido pela instalação limpa foi restaurado antes da suíte completa.
- A suíte completa passou após a restauração.

## Compatibilidade e segurança

- A coluna não expõe identidade, e-mail ou qualquer credencial; informa somente o papel funcional já visível na conta autenticada.
- A proteção já existente contra fórmulas de planilha permanece aplicada a todas as células.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.
- Não houve publicação em produção, alteração de banco conectado, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

O campo registra o papel funcional da conta que gerou o arquivo; ele não é uma assinatura, certificação de identidade ou prova jurídica de participação.
