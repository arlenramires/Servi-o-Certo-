# Entrega — prévia em lote dos resumos seguros filtrados

Horário da validação: 25/10/2026, 09:44 (America/Boa_Vista).

## Resultado funcional

- A área “Meus serviços” agora oferece a ação **Ver resumos** para conferir na própria tela o conteúdo seguro da lista filtrada antes de copiar, baixar ou compartilhar.
- A prévia reúne todos os resultados correspondentes à busca, ao filtro e à ordenação atuais, inclusive serviços além da paginação visível.
- A ação alterna de forma acessível entre **Ver resumos** e **Ocultar resumos**, com `aria-controls` e `aria-expanded` sincronizados.
- A prévia longa possui rolagem própria para não alongar excessivamente a página.
- Ao atualizar, pesquisar, filtrar ou ordenar a lista, a prévia anterior é fechada e descartada para não mostrar um recorte desatualizado.
- Cada bloco contém somente código, profissão, situação, cidade/UF, urgência, datas válidas e link autenticado. Descrição livre, participantes, mensagens, propostas e valores permanecem excluídos.
- A prévia usa somente os dados autorizados já carregados, sem nova consulta ou alteração dos pedidos.

## Evidências

- `npm ci --ignore-scripts`: concluído com sucesso.
- Testes dirigidos: 2 cenários aprovados, em desktop e viewport Android.
- Os testes confirmaram 12 resumos na prévia quando apenas dez cartões estavam visíveis, incluindo o primeiro e o último resultado e excluindo o serviço fora do filtro e todas as descrições privadas.
- Os testes também confirmaram abertura, fechamento e estado acessível, sem chamada adicional à API nem modificação dos pedidos.
- `npm run test:all`: 13 testes Node/PostgreSQL e 214 testes Playwright aprovados; total de 227 testes.
- O Chromium removido pela instalação limpa foi restaurado antes dos testes de interface; o espelho alternativo concluiu a instalação após resposta inválida do primeiro espelho.
- Testes executados com API e banco controlados, sem conexão com produção, migração, publicação, cobrança ou aprovação automática.

## Compatibilidade verificada

O changelog oficial do Supabase foi conferido em 25/10/2026. A mudança de concessões padrão da Data API prevista para 30/10/2026 e a remoção de cifras TLS antigas prevista para 10/11/2026 não interferem nesta prévia local nem requerem mudança de banco.

## Arquivos alterados

- `auth-teste/index.html`
- `auth-teste/app.js`
- `auth-teste/style.css`
- `tests/ui/flows.spec.js`
- `docs/CONTINUIDADE.md`
- `docs/ENTREGA-2026-10-25-PREVIA-RESUMOS-SEGUROS-FILTRADOS.md`
