USE master;

CREATE OR REPLACE PROCEDURE sp_bancos AS
        SELECT * FROM master.dbo.sysdatabases;

EXEC sp_bancos;

CREATE OR REPLACE PROCEDURE sp_list_tables_from_db
    @db_name SYSNAME -- Par�metro para o nome do banco de dados
AS
BEGIN
    DECLARE @sql NVARCHAR(4000)
    -- Cria��o do comando SQL din�mico para listar tabelas
    SET @sql = 'SELECT * FROM '+ @db_name +'.dbo.sysobjects WHERE type = ''U'''
    -- Execu��o do SQL din�mico
    EXEC (@sql)
END;

EXEC sp_list_tables_from_db @db_name = 'pizzaria';

CREATE OR REPLACE PROCEDURE sp_listar_colunas_de_tabela
        @nome_bd SYSNAME,
        @nome_tab LONGSYSNAME
AS
BEGIN
        DECLARE @sql NVARCHAR(4000)
        SET @sql = 'SELECT c.name, c.length, c.type, c.prec, c.scale,
                CASE
                        WHEN c.id = k.id AND c.colid IN (k.key1, k.key2, k.key3, k.key4, k.key5, k.key6, k.key7, k.key8)
                                THEN ''YES''
                        ELSE ''NO''
                END AS ''pk''
                FROM '+@nome_bd+'.dbo.syscolumns c
                INNER JOIN '+@nome_bd+'.dbo.sysobjects o ON o.id = c.id
                LEFT JOIN '+@nome_bd+'.dbo.syskeys k ON k.id = c.id
                WHERE o.name = '''+@nome_tab+'''
                AND k.type = 1'
                                    
        EXEC (@sql)
END;

EXEC sp_listar_colunas_de_tabela bd2024, cliente;   

CREATE OR REPLACE PROCEDURE sp_listar_tabelas_relacionadas
        @nome_bd SYSNAME,
        @nome_tab LONGSYSNAME
AS
BEGIN
        DECLARE @sql NVARCHAR(4000)
        SET @sql = 
        '
        SELECT o2.name as ref_table, ''ref'' as relation, c.name as fk, c2.name as pk
        FROM '+@nome_bd+'.dbo.sysobjects o
        INNER JOIN '+@nome_bd+'.dbo.sysreferences r ON r.tableid = o.id
        INNER JOIN '+@nome_bd+'.dbo.sysobjects o2 ON o2.id = r.reftabid
        INNER JOIN '+@nome_bd+'.dbo.syscolumns c ON c.id = o.id
        INNER JOIN '+@nome_bd+'.dbo.syscolumns c2 ON c2.id = o2.id
        INNER JOIN '+@nome_bd+'.dbo.syskeys k ON k.id = c2.id
        WHERE o.name = '''+@nome_tab+'''
        AND c.colid = r.fokey1
        AND c2.colid IN (k.key1, k.key2, k.key3, k.key4, k.key5, k.key6, k.key7, k.key8)
        AND k.type = 1'
        
        EXEC (@sql)
END;

EXEC sp_listar_tabelas_relacionadas bd2024, venda;

SELECT o2.name as ref_table, 'ref' as relation, c.name as fk, c2.name as pk
FROM bd2024.dbo.sysobjects o
INNER JOIN bd2024.dbo.sysreferences r ON r.tableid = o.id
INNER JOIN bd2024.dbo.sysobjects o2 ON o2.id = r.reftabid
INNER JOIN bd2024.dbo.syscolumns c ON c.id = o.id
INNER JOIN bd2024.dbo.syscolumns c2 ON c2.id = o2.id
INNER JOIN bd2024.dbo.syskeys k ON k.id = c2.id
WHERE o.name = 'venda'
AND c.colid = r.fokey1
AND c2.colid IN (k.key1, k.key2, k.key3, k.key4, k.key5, k.key6, k.key7, k.key8)
AND k.type = 1;
             
             
