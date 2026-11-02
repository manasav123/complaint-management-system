import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv("backend/.env")

mongo_uri = os.getenv("MONGO_URI")
database_name = os.getenv("MONGO_DB_NAME")

try:
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=10000)

    client.admin.command("ping")

    print("MongoDB Atlas connected successfully!")

    db = client[database_name]
    print("Database selected:", db.name)

    client.close()

except Exception as error:
    print("MongoDB connection failed.")
    print(type(error).__name__, error)