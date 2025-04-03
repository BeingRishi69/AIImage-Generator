-- Reset the PostgREST query cache
SELECT pg_notify('pgrst', 'reload schema');