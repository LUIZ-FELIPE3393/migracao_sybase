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

    print("OK")

def create_table( db_name, table_name ):
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        password="5286",
        database=db_name
    )

    f = open("./api/resultset.json")

    data = json.load(f)

    # print(data)

    mycursor = mydb.cursor()

    columns = []

    for i in data:
        column = ""

        match (i["type"]):
            case 56:
                column = f"{i["name"]} INT"
            case 63:
                column = f"{i["name"]} NUMERIC({i["prec"]}, {i["scale"]})"
            case 47:
                column = f"{i["name"]} CHAR"
            case 123:
                column = f"{i["name"]} DATE"
            case 39:
                column = f"{i["name"]} VARCHAR({i["length"]})"

        columns.append(column)

    print(f"CREATE TABLE {table_name} ({'%s' % ', '.join(map(str, columns))})")

    mycursor.execute(f"CREATE TABLE {table_name} ({'%s' % ', '.join(map(str, columns))})")

def primary_keys( db_name, table_name, column_names ):
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        password="5286",
        database=db_name
    )


# Match for functions below
match sys.argv[2]:
    case 'create_schema':
        create_schema(sys.argv[3])
    case 'create_table':
        create_table(sys.argv[3], sys.argv[4])