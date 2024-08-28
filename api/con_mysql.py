import mysql.connector
import simplejson as json
import sys

def create_schema( db_name ):
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        password="5286"
    )   

    mycursor = mydb.cursor()
    mycursor.execute(f"CREATE SCHEMA {db_name}")

def create_table( db_name, table_name, table_columns ):
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        password="5286",
        database=db_name
    )

    f = open("./resultset.json")

    data = json.load(f)

    print(data)

    mycursor = mydb.cursor()
    mycursor.execute(f"CREATE TABLE {table_name} ()")

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