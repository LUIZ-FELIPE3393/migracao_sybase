import mysql.connector
import simplejson as json
import sys

host="localhost"
user="root"
password="root"

def create_schema( db_name ):
    mydb = mysql.connector.connect(
        host=host,
        user=user,
        password=password
    )   

    mycursor = mydb.cursor()
    mycursor.execute(f"CREATE SCHEMA {db_name}")

    print("OK")

    mydb.close()

def create_table( db_name, table_name ):
    mydb = mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=db_name
    )

    f = open("./api/resultset.json")
    data = json.load(f)
    mycursor = mydb.cursor()

    columns = []

    for i in data:
        column = ""

        match (i["type"]):
            case 56 | 38 | 66:
                column = f"{i["name"]} INT"
            case 63 | 108:
                column = f"{i["name"]} NUMERIC({i["prec"]}, {i["scale"]})"
            case 47:
                column = f"{i["name"]} CHAR"
            case 123 | 49:
                column = f"{i["name"]} DATE"
            case 39:
                column = f"{i["name"]} VARCHAR({i["length"]})"
            case _:
                column = f"{i["name"]} VARCHAR(64)"

        columns.append(column)

    print(f"CREATE TABLE {table_name} ({'%s' % ', '.join(map(str, columns))})")

    mycursor.execute(f"CREATE TABLE {table_name} ({'%s' % ', '.join(map(str, columns))})")

    mydb.commit()
    mydb.close()

def insert_data( db_name, table_name ):
    mydb = mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=db_name
    )

    f = open("./api/resultset.json")
    data = json.load(f)
    mycursor = mydb.cursor()

    print(data)

    for i in data:
        value_list = list(i.values())
        mycursor.execute(f"INSERT INTO {table_name} VALUES ({str(value_list).replace('[', '').replace(']', '').replace('None', 'null')});")

    mydb.commit()     
    mydb.close()


# Match for functions below
match sys.argv[2]:
    case 'create_schema':
        create_schema(sys.argv[3])
    case 'create_table':
        create_table(sys.argv[3], sys.argv[4])
    case 'insert_data':
        insert_data(sys.argv[3], sys.argv[4])