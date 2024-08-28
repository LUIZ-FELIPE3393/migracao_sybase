import mysql.connector

mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="5286"
)

print(mydb)