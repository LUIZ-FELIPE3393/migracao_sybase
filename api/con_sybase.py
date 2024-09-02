import pyodbc
import sys
import simplejson as json

user = "sa" 
passwd = "123456"
# host = "" #Carlos 
# host = "192.168.1.35" #Luiz Felipe
host = "25.3.28.238" #Luiz - Hamachi
db = "master"
port = "5000"
driver="Devart ODBC Driver for ASE"
conn = pyodbc.connect(driver=driver, server=host, database=db, port = port, uid=user, pwd=passwd)

def create_cursor(query): 
    cursor = conn.cursor()
    cursor.execute(query)
    return cursor

def write_to_json(results):
    json_result = json.dumps(results, indent=4, default=str)

    with open(sys.argv[1], "w") as outfile:
        outfile.write(json_result)

    print(json_result)

def convert_rows_to_dict(rows, columns):
    results = []

    for row in rows:
        results.append(dict(zip(columns, row)))
    
    return results
    
def q_databases():
    query= f"EXEC sp_bancos"
    cursor = create_cursor(query)

    columns = [column[0] for column in cursor.description]
    rows = cursor.fetchall()    
    results = []
    for row in rows:
        if not row.name in ['master', 'model', 'tempdb', 'sybsystemdb', 'sybsystemprocs']: #Exclui tabelas de sistema do resultado
            results.append(dict(zip(columns, row)))

    write_to_json(results)

    conn.close()

def q_list_tables(database):
    query= f"EXEC sp_list_tables_from_db {database}"
    cursor = create_cursor(query)

    columns = [column[0] for column in cursor.description]
    rows = cursor.fetchall()    
    results = convert_rows_to_dict(rows, columns)

    write_to_json(results)
    
    conn.close()

def q_list_columns (database, table):
    query= f"EXEC sp_listar_colunas_de_tabela {database}, {table}"
    cursor = create_cursor(query)

    columns = [column[0] for column in cursor.description]
    rows = cursor.fetchall()    
    results = convert_rows_to_dict(rows, columns)

    write_to_json(results)
    
    conn.close()

def q_related_tables(database, table):
    query= f"EXEC sp_listar_tabelas_relacionadas {database}, {table}"
    cursor = create_cursor(query)

    columns = [column[0] for column in cursor.description]
    rows = cursor.fetchall()    
    results = convert_rows_to_dict(rows, columns)

    write_to_json(results)
    
    conn.close()

def q_select_all_from_table(database, table):
    query= f"SELECT * FROM {database}.dbo.{table}"
    cursor = create_cursor(query)

    columns = [column[0] for column in cursor.description]
    rows = cursor.fetchall()    
    results = convert_rows_to_dict(rows, columns)

    write_to_json(results)
    
    conn.close()

# Match for functions below
match sys.argv[2]:
    case 'q_databases':
        q_databases()
    case 'q_list_tables':
        q_list_tables(sys.argv[3])
    case 'q_list_columns':
        q_list_columns(sys.argv[3], sys.argv[4])
    case 'q_related_tables':
        q_related_tables(sys.argv[3], sys.argv[4])
    case 'q_select_all_from_table':
        q_select_all_from_table(sys.argv[3], sys.argv[4])
