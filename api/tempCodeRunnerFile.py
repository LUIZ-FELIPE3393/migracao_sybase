import pyodbc
import sys
import simplejson as json

user = "sa" 
passwd = "123456"
host = "10.100.39.30" #Altere para ficar de acordo com sua VM
db = "master"
port = "5000"
driver="Devart ODBC Driver for ASE"
conn = pyodbc.connect(driver=driver, server=host, database=db, port = port, uid=user, pwd=passwd)