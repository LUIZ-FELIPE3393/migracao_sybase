import mysql.connector
import simplejson as json
import sys

host="localhost"
user="root"
password="5286"

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

def create_table( db_name, table_name, constraints_file ):
    mydb = mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=db_name
    )

    tb_file = open(sys.argv[1])
    cnst_file = open(constraints_file)
    tables = json.load(tb_file)
    constraints = json.load(cnst_file)

    mycursor = mydb.cursor()

    columns = []
    primary_keys = []

    for i in tables:
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
        if i["pk"] == "YES":
            primary_keys.append(i["name"])

    columns.append(f"PRIMARY KEY ({'%s' % ', '.join(map(str, primary_keys))})")

    for i in constraints:
        if i["relation"] == "ref":
            print(f"FOREIGN KEY ({i["fk"]}) REFERENCES {i["ref_table"]}({i["pk"]});")
            columns.append(f"FOREIGN KEY ({i["fk"]}) REFERENCES {i["ref_table"]}({i["pk"]})")


    print(f"CREATE TABLE {table_name} ({'%s' % ', '.join(map(str, columns))})")

    mycursor.execute(f"CREATE TABLE IF NOT EXISTS {table_name} ({'%s' % ', '.join(map(str, columns))})")

    mydb.commit()
    mydb.close()

def insert_data( db_name, table_name ):
    mydb = mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=db_name
    )

    f = open(sys.argv[1])
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
        create_table(sys.argv[3], sys.argv[4], sys.argv[5])
    case 'insert_data':
        insert_data(sys.argv[3], sys.argv[4])