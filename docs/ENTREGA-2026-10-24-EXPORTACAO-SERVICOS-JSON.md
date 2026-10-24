# Entrega: exportação estruturada dos próprios serviços em JSON

Validada em 24/10/2026 às 15:41 (America/Boa_Vista).

## Funcionalidade entregue

- A área **Meus serviços** oferece agora ações separadas para **Baixar CSV** e **Baixar JSON**.
- O JSON inclui versão do formato, instante da exportação, filtro, busca, ordenação e papel do usuário.
- Cada serviço traz código, profissão, situação técnica e legível, papel, mensagens novas, descrição, região, urgência e datas exatas.
- O arquivo considera todos os resultados do recorte atual, inclusive os que ainda não foram exibidos pela paginação visual.
- O nome conserva filtro, busca, ordenação e data, usando a extensão `.json`.
- A exportação reutiliza somente os dados já autorizados e carregados, sem consulta adicional e sem alteração dos serviços ou mensagens.

## Evidências

- Teste dirigido Playwright: 4 cenários aprovados, cobrindo cliente e prestador em desktop e viewport Android.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 182 testes Playwright aprovados, totalizando 195 testes.
- O cenário de cliente valida nome, contexto, 12 resultados filtrados, campos estruturados, mensagens novas e exclusão do serviço fora do filtro.
- O cenário de prestador valida papel, situação e ausência de mutações.
- Os dois botões ficam desabilitados quando o recorte não possui resultados.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Correção durante a validação

- A primeira execução funcional identificou um conflito entre o nome temporário do conteúdo JSON e o objeto `document` do navegador, impedindo o download.
- O nome foi corrigido antes de qualquer publicação; o cenário dirigido e a suíte completa passaram depois da correção.

## Runtime

- O Chromium não estava disponível no início deste runtime e foi restaurado após a instalação limpa.
- Nenhuma falha permaneceu após a correção e a restauração do navegador.

## Compatibilidade e segurança

- O JSON contém somente campos da própria lista autorizada; não inclui e-mail, identidade civil, coordenadas, credenciais ou dados administrativos.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alteradas.
- Não houve publicação em produção, alteração de banco conectado, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

O arquivo é um retrato de conferência no instante do download; não é backup transacional, assinatura ou sincronização automática com mudanças posteriores.
