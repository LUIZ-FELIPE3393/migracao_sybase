import mysql.connector

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

    mycursor = mydb.cursor()
    mycursor.execute(f"CREATE TABLE {table_name} ()")