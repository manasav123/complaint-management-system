import os
from dotenv import load_dotenv
from pymongo import MongoClient

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, "backend", ".env"))

client = MongoClient(
    os.getenv("MONGO_URI"),
    serverSelectionTimeoutMS=10000
)

try:
    client.admin.command("ping")

    db = client[os.getenv("MONGO_DB_NAME")]

    print("\nMONGODB ATLAS DATA VERIFICATION")
    print("--------------------------------")

    collections = [
        "users",
        "complaints",
        "complaint_assignments",
        "complaint_feedback"
    ]

    for name in collections:
        count = db[name].count_documents({})
        print(f"{name}: {count} records")

    print("--------------------------------")
    print("MongoDB verification completed!")

finally:
    client.close()