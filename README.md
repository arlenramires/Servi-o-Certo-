# Serviço Certo — primeira versão demonstrativa

## O que funciona
- Layout responsivo azul e branco.
- Categorias de serviços.
- Criação de pedido, perfil profissional e envio de proposta.
- Aceite/recusa de proposta, início e conclusão.
- Proposta de serviço extra com aprovação do cliente.
- Comprovante demonstrativo não fiscal com impressão/salvar PDF.
- Painel administrativo local, exportação JSON e limpeza de dados de teste.

## Limitações importantes
Esta versão usa `localStorage` no navegador. Os dados não são compartilhados entre dispositivos nem usuários. Não há autenticação real, servidor, segurança de produção, pagamentos, divisão de comissões, GPS ao vivo, notificações ou emissão de nota fiscal. O painel Admin não é protegido. Não use dados pessoais, endereços completos ou dados bancários reais.

## Abrir no computador
1. Extraia o ZIP.
2. Abra `index.html` no navegador para experimentar os fluxos básicos.
3. Para testar o modo PWA/service worker, rode um servidor local: no terminal dentro da pasta, execute `python -m http.server 8000` e acesse `http://localhost:8000`.

## Publicar grátis para testar no Android
1. Crie uma conta em https://github.com/ e um repositório chamado `servico-certo`.
2. Envie os arquivos desta pasta ao repositório.
3. Em Settings → Pages, selecione publicar a partir da branch `main` e pasta `/ (root)`.
4. Abra a URL HTTPS publicada no Chrome do Android.
5. No menu ⋮, escolha “Instalar app” ou “Adicionar à tela inicial”, se disponível.

A instalação PWA não é um APK e não publica o aplicativo na Play Store. Para publicação comercial será necessário reforçar segurança, criar backend com autenticação e regras de acesso, testar o sistema e atender às políticas da loja.

## Teste rápido
1. Aba Cliente: preencha seu nome e crie um pedido.
2. Aba Profissional: preencha nome, especialidade e região.
3. Envie proposta ao pedido da especialidade correspondente.
4. Volte à aba Cliente e aceite a proposta.
5. Confirme início e conclusão; abra o comprovante demonstrativo.
6. Teste o painel Admin e exportação JSON.
