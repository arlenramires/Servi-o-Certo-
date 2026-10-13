-- Serviço Certo | correção mínima de permissões (PROPOSTA NÃO APLICADA)
-- Data: 2026-10-13
-- Escopo: remover TRUNCATE de papéis expostos à API em duas tabelas.
-- Não exclui registros, não altera RLS, não modifica políticas nem papéis administrativos.
-- Aplicar SOMENTE após teste em ambiente Supabase separado e aprovação.
BEGIN;
REVOKE TRUNCATE ON TABLE public.profiles FROM anon, authenticated;
REVOKE TRUNCATE ON TABLE public.service_requests FROM anon, authenticated;
COMMIT;

-- Validação pós-aplicação: esperado false nas quatro linhas.
SELECT t.table_name, r.role_name,
       has_table_privilege(r.role_name, format('public.%I', t.table_name), 'TRUNCATE') AS can_truncate
FROM (VALUES ('profiles'), ('service_requests')) AS t(table_name)
CROSS JOIN (VALUES ('anon'), ('authenticated')) AS r(role_name)
ORDER BY t.table_name, r.role_name;

-- Verificação de contagem: não deve mudar como efeito da correção.
SELECT 'profiles' AS table_name, count(*) AS row_count FROM public.profiles
UNION ALL
SELECT 'service_requests', count(*) FROM public.service_requests;

-- Observação: outras permissões (INSERT/UPDATE/DELETE/TRIGGER/REFERENCES)
-- devem ser auditadas em conjunto com RLS e os fluxos reais antes de restrições adicionais.
