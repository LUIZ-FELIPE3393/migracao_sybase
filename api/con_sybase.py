import pyodbc
import sys
import simplejson as json

user = "sa" 
passwd = "123456"
# host = "" #Carlos 
host = "192.168.1.35" #Luiz Felipe
# host = "25.3.28.238" #Luiz - Hamachi
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
    
def create_database(db_name):
    conn.autocommit = True
    conn.execute("CREATE DATABASE " + db_name)
    conn.close()


def create_table(db_name, table_name, constraints_file):
    tb_file = open(sys.argv[1])
    cnst_file = open(constraints_file)
    tables = json.load(tb_file)
    constraints = json.load(cnst_file)

    cursor = conn.cursor()
    conn.autocommit = True

    columns = []
    primary_keys = []

    for i in tables:
        column = ""

        match (i["type"]):
            case "int":
                column = f"{i["name"]} INT"
            case "decimal":
                column = f"{i["name"]} DOUBLE({i["prec"]}, {i["scale"]})"
            case "char":
                column = f"{i["name"]} CHAR({i["length"]})"
            case "date":
                column = f"{i["name"]} DATE"
            case "varchar":
                column = f"{i["name"]} VARCHAR({i["length"]})"
            case _:
                column = f"{i["name"]} VARCHAR(64)"

        columns.append(column)   
        if i["pk"] == "YES":
            primary_keys.append(i["name"])

    if len(primary_keys) > 0:
        columns.append(f"PRIMARY KEY ({'%s' % ', '.join(map(str, primary_keys))})")

    print("aaa", len(primary_keys))

    for i in constraints:
        columns.append(f"FOREIGN KEY ({i["fk"]}) REFERENCES {db_name}.dbo.{i["ref_table"]}({i["pk"]})")

    cursor.execute(f"SELECT * FROM {db_name}.dbo.sysobjects WHERE name = '{table_name}' AND type = 'U'")

    if len(cursor.fetchall()) == 0:
        cursor.execute(f"CREATE TABLE {db_name}.dbo.{table_name} ({'%s' % ', '.join(map(str, columns))})")

    conn.close()

def insert_data(db_name, table_name):  
    file = open(sys.argv[1])
    data = json.load(file)

    cursor = conn.cursor()

    for i in data:
        value_list = list(i.values())
        print(f"INSERT INTO {db_name}.dbo.{table_name} VALUES ({str(value_list).replace('[', '').replace(']', '').replace('None', 'null')})")
        cursor.execute(f"INSERT INTO {db_name}.dbo.{table_name} VALUES ({str(value_list).replace('[', '').replace(']', '').replace('None', 'null')})")

    conn.commit()
    conn.close()


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
    case 'create_database':
        create_database(sys.argv[3])
    case 'create_table':
        create_table(sys.argv[3], sys.argv[4], sys.argv[5])
    case 'insert_data':
        insert_data(sys.argv[3], sys.argv[4])
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
    case _:
        print("Rota não encontrada")