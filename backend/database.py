import os
from dotenv import load_dotenv
from pymongo import MongoClient
from gridfs import GridFSBucket

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_FILE)

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=10000
)

# Check MongoDB connection
client.admin.command("ping")

# Select database
database = client[MONGO_DB_NAME]

# Collections
users_collection = database["users"]
complaints_collection = database["complaints"]
assignments_collection = database["complaint_assignments"]
feedback_collection = database["complaint_feedback"]

# GridFS image storage
images_bucket = GridFSBucket(
    database,
    bucket_name="complaint_images"
)

print("MongoDB Atlas connected successfully!")
print("GridFS image storage initialized successfully!")