# Checklist de autenticação — Serviço Certo

Data da análise: 13/10/2026.

## Situação verificada
- Projeto Supabase ativo.
- Cadastro de profissões: 82 registros.
- Contas de autenticação: 0.
- Perfis de usuário: 0.
- Solicitações de serviço: 0.
- A página principal ainda é uma demonstração local e não possui integração Supabase.
- O gatilho de criação de perfil já diferencia cliente e prestador.

## Requisitos antes de abrir cadastros reais
1. Impedir mudanças não autorizadas do papel de usuário no banco de dados.
2. Validar as políticas de acesso (RLS) com três contas de teste.
3. Conectar a interface de cadastro e login ao Supabase Auth.
4. Testar confirmação de e-mail, recuperação de senha e encerramento de sessão.
5. Verificar que clientes não acessam dados privados de prestadores, e vice-versa.
6. Garantir que administrador só seja atribuído por procedimento privilegiado.
7. Testar tudo fora da versão publicada.

## Publicação
Não promover a branch de desenvolvimento para a principal antes de passar nos testes de segurança e fluxo completo.
