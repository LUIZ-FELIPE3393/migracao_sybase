import pyodbc
import sys
import simplejson as json

user = "sa" 
passwd = "123456"
host = "192.168.56.101"
db = "bd2024"
port = "5000"
driver="Devart ODBC Driver for ASE"
conn = pyodbc.connect(driver=driver, server=host, database=db, port = port, uid=user, pwd=passwd)

def create_cursor(query): 
    cursor = conn.cursor()
    cursor.execute(query)
    return cursor

def write_to_json(results):
    json_result = json.dumps(results, indent=4, default=str)

    with open(sys.argv[3], "w") as outfile:
        outfile.write(json_result)

def convert_rows_to_dict(rows, columns):
    results = []
    for row in rows:
        results.append(dict(zip(columns, row)))
    
    return results
    
def q_databases():
    query= f"exec sp_bancos"
    cursor = create_cursor(query)

    columns = [column[0] for column in cursor.description]
    rows = cursor.fetchall()    
    results = []
    for row in rows:
        if not row.name in ['master', 'model', 'tempdb', 'sybsystemdb', 'sybsystemprocs']: #Exclui tabelas de sistema do resultado
            results.append(dict(zip(columns, row)))

    write_to_json(results)
    print("OK")

    conn.close()

def q_count(table):
    query= f"select * from {table} where clicodigo IN (1, 2, 3)"
    cursor = create_cursor(query)

    columns = [column[0] for column in cursor.description]
    rows = cursor.fetchall()    
    results = convert_rows_to_dict(rows, columns)

    write_to_json(results)
    print("OK")
    
    conn.close()

# Match for functions below
match sys.argv[1]:
    case 'q_count':
        q_count(sys.argv[2])
    case 'q_databases':
        q_databases()

