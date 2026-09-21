import psycopg2

connection = psycopg2.connect(
    host="localhost",
    port="5432",
    database="complaint_management",
    user="postgres",
    password="postgres@11139"
)

print("Database connected successfully!")