import pyodbc
import sys
import json

user = "sa" 
passwd = "123456"
host = "192.168.56.101"
db = "bd2024"
port = "5000"
driver="Devart ODBC Driver for ASE"

def q_count(table):
    conn = pyodbc.connect(driver=driver, server=host, database=db, port = port, uid=user, pwd=passwd) 
    print(conn)    
    cursor = conn.cursor()  
    query= f"select count(*) from {table}"
    cursor.execute(query)
    row = cursor.fetchall()    
    print(str(row[0]))
    #json_result = json.dumps(row)

    #with open(sys.argv[3], "w") as outfile:
    #    outfile.write(json_result)
    #print("OK")

    conn.close()

# Match for functions below
match sys.argv[1]:
    case 'q_count':
        q_count(sys.argv[2])

