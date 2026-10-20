# Entrega — previsão manual de chegada

Validada em 19/10/2026 às 23h16 (Boa Vista).

## Funcionalidade

- Depois de registrar **Estou a caminho**, o prestador escolhe uma previsão de 10, 20, 30, 45, 60 ou 90 minutos.
- A previsão atual pode ser corrigida enquanto o prestador ainda está em deslocamento.
- Cliente e prestador veem o horário estimado dentro do serviço.
- A opção desaparece depois de **Cheguei ao local**.
- A escrita é restrita ao prestador designado; terceiros não conseguem ler a previsão.

## Evidências

- `npm ci --ignore-scripts`.
- `npm run test:all`.
- Banco isolado: validação do intervalo, fase do deslocamento, participante autorizado, atualização sem duplicação, bloqueio de escrita direta e RLS contra terceiros.
- Interface controlada: criação e atualização da previsão pelo prestador, visualização pelo cliente e ausência dos controles no perfil do cliente.

O primeiro CDN devolveu pacotes vazios do Chromium e o diretório compartilhado deixou um lock órfão. A instalação foi refeita em diretório isolado pelo espelho oficial seguinte; a suíte completa passou com o headless shell validado.

## Limites e preservação

Esta previsão é declarada manualmente pelo prestador. Ela não usa GPS, não acompanha a localização, não garante o horário e não movimenta pagamentos.

A migração `20261020031500_provider_manual_eta.sql` foi preparada e testada somente no PostgreSQL efêmero. Não foi aplicada ao Supabase conectado ou à produção. A `main`, a versão pública, as 82 profissões e a identidade azul e branca foram preservadas.
