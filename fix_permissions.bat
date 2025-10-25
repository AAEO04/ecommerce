
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d postgres -c "GRANT USAGE ON SCHEMA public TO madrush_user;"
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d postgres -c "ALTER USER madrush_user CREATEDB;"

