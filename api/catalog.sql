USE master;

sp_fkeys sysconstraints;

sp_tables;

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
        SET @sql = 
        'SELECT name, length, type, prec, scale
        FROM '+@nome_bd+'.dbo.syscolumns
        WHERE id = (SELECT id FROM 
                        '+@nome_bd+'.dbo.sysobjects 
                        WHERE type = ''U''
                        AND name = '''+@nome_tab+''')'                    
        EXEC (@sql)
END;

EXEC sp_listar_colunas_de_tabela 
        @nome_bd = 'pizzaria', 
        @nome_tab = 'pizza';   

CREATE OR REPLACE PROCEDURE sp_listar_tabelas_relacionadas
        @nome_bd SYSNAME,
        @nome_tab LONGSYSNAME
AS
BEGIN
        DECLARE @sql NVARCHAR(4000)
        SET @sql = 
        'SELECT name,
                CASE
                        WHEN id IN (SELECT tableid
                            FROM '+@nome_bd+'.dbo.sysreferences
                            WHERE reftabid = (SELECT id 
                                               FROM '+@nome_bd+'.dbo.sysobjects
                                               WHERE name = '''+@nome_tab+'''))
                                THEN ''Referencia''
                        WHEN id IN (SELECT reftabid
                                    FROM '+@nome_bd+'.dbo.sysreferences
                                    WHERE tableid = (SELECT id 
                                                       FROM '+@nome_bd+'.dbo.sysobjects
                                                       WHERE name = '''+@nome_tab+'''))       
                                THEN ''Referenciado''
               END AS ''Relacao''                               
        FROM '+@nome_bd+'.dbo.sysobjects
        WHERE type = ''U''
        AND id IN (SELECT tableid
                    FROM '+@nome_bd+'.dbo.sysreferences
                    WHERE reftabid = (SELECT id 
                                       FROM '+@nome_bd+'.dbo.sysobjects
                                       WHERE name = '''+@nome_tab+'''))
        OR id IN (SELECT reftabid
                    FROM '+@nome_bd+'.dbo.sysreferences
                    WHERE tableid = (SELECT id 
                                       FROM '+@nome_bd+'.dbo.sysobjects
                                       WHERE name = '''+@nome_tab+'''))'
        EXEC (@sql)
END;

EXEC sp_listar_tabelas_relacionadas bd2024, cliente;



