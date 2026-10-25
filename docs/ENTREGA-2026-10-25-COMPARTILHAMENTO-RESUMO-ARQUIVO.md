# Entrega: compartilhamento do resumo seguro como arquivo

Validada em 25/10/2026 às 00:47 (America/Boa_Vista).

## Funcionalidade entregue

- A ação **Compartilhar resumo** verifica se o aparelho aceita arquivos no compartilhamento nativo.
- Quando compatível, envia um arquivo `.txt` com nome contextual e o mesmo resumo seguro já usado pela cópia, download e prévia.
- Quando arquivos não são aceitos, mantém o compartilhamento em texto; sem compartilhamento nativo, mantém a cópia automática.
- A verificação de compatibilidade é protegida contra erros do navegador e não impede as alternativas existentes.
- O arquivo inclui código, profissão, situação, região, urgência, datas válidas e link autenticado, sem descrição livre, participantes, mensagens, propostas ou valores.
- A ação reutiliza somente dados já carregados e não consulta nem modifica o serviço.

## Evidências

- Testes dirigidos Playwright: 2 cenários aprovados, cobrindo compartilhamento de arquivo em desktop e viewport Android.
- `npm ci --ignore-scripts`: concluído com sucesso.
- `npm run test:all`: 13 testes Node/PostgreSQL e 198 testes Playwright aprovados, totalizando 211 testes.
- Os cenários conferem nome, tipo MIME e conteúdo do arquivo, ausência da descrição privada, confirmação apresentada ao usuário e inexistência de chamadas adicionais à API ou mutações nos pedidos.
- Os caminhos anteriores de compartilhamento em texto e cópia alternativa continuaram aprovados na suíte completa.
- Os testes PostgreSQL foram executados somente no ambiente isolado da suíte; nenhum banco conectado foi alterado.

## Runtime

- O Chromium já restaurado no cache do ambiente permaneceu disponível após a instalação limpa.
- Os testes dirigidos e a suíte completa passaram sem falhas.

## Compatibilidade e segurança

- A implementação é somente de interface e mantém a autorização sob as políticas RLS existentes.
- O changelog oficial do Supabase foi conferido em 25/10/2026. As mudanças anunciadas sobre cifras TLS antigas e exposição de novas tabelas não afetam esta entrega, que não cria tabelas nem altera chamadas à Data API.
- Nenhuma chave ou credencial privilegiada foi incluída.
- `main`, a versão pública, as 82 profissões e a identidade azul e branca não foram alterados.
- Não houve publicação em produção, alteração de banco conectado, cobrança, pagamento, aprovação de documento/profissão ou concessão de administrador.

## Limite conhecido

O suporte a arquivos no compartilhamento depende do navegador, do sistema operacional e dos destinos instalados. Quando não existe, o fluxo continua automaticamente pelo resumo em texto ou pela cópia segura já implementada.
