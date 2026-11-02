import os
import psycopg2

from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
from pymongo import MongoClient


# Load environment variables
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, "backend", ".env")

load_dotenv(ENV_FILE)


# Connect to PostgreSQL
postgres_connection = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    database=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
)


# Connect to MongoDB Atlas
mongo_client = MongoClient(
    os.getenv("MONGO_URI"),
    serverSelectionTimeoutMS=10000
)

mongo_client.admin.command("ping")

mongo_database = mongo_client[
    os.getenv("MONGO_DB_NAME")
]


# Tables and corresponding MongoDB collections
tables = {
    "users": "users",
    "complaints": "complaints",
    "complaint_assignments": "complaint_assignments",
    "complaint_feedback": "complaint_feedback"
}


try:
    cursor = postgres_connection.cursor(
        cursor_factory=RealDictCursor
    )

    print("\nStarting PostgreSQL to MongoDB migration...\n")

    for table_name, collection_name in tables.items():

        collection = mongo_database[collection_name]

        # Protect existing MongoDB data
        existing_count = collection.count_documents({})

        if existing_count > 0:
            raise Exception(
                f"Collection '{collection_name}' already contains data. "
                "Migration stopped to prevent overwriting."
            )

        # Read PostgreSQL records
        cursor.execute(f"SELECT * FROM {table_name}")

        records = cursor.fetchall()

        documents = [
            dict(record)
            for record in records
        ]

        # Insert records into MongoDB
        if documents:
            collection.insert_many(documents)

        print(
            f"{table_name}: "
            f"{len(documents)} records migrated successfully."
        )

    print("\n================================")
    print("MIGRATION COMPLETED SUCCESSFULLY!")
    print("================================")

except Exception as error:

    print("\nMIGRATION FAILED!")
    print(type(error).__name__, error)

finally:

    postgres_connection.close()
    mongo_client.close()

    print("\nDatabase connections closed.")