from datetime import datetime
import io
import os
import base64
import hashlib
import hmac
import json
import time
import re

from pathlib import Path
from dotenv import load_dotenv
from google import genai

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from passlib.context import CryptContext

# Load environment variables
load_dotenv(Path(__file__).resolve().parent / ".env")

# Database imports
from backend.database import (
    database,
    users_collection,
    complaints_collection,
    assignments_collection,
    feedback_collection,
    images_bucket
)

# Gemini configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

gemini_client = (
    genai.Client(api_key=GEMINI_API_KEY)
    if GEMINI_API_KEY else None
)

# Initialize FastAPI
app = FastAPI()


# ---------------------------------------------------------
# PASSWORD HASHING
# ---------------------------------------------------------

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ---------------------------------------------------------
# AUTHENTICATION CONFIGURATION
# ---------------------------------------------------------

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "complaint-system-demo-secret-key-2026"
)

security = HTTPBearer()


# ---------------------------------------------------------
# CREATE AUTH TOKEN
# ---------------------------------------------------------

def create_auth_token(user_id, role):
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": int(time.time()) + (60 * 60 * 24)
    }

    payload_json = json.dumps(
        payload,
        separators=(",", ":")
    ).encode()

    payload_encoded = base64.urlsafe_b64encode(
        payload_json
    ).decode().rstrip("=")

    signature = hmac.new(
        SECRET_KEY.encode(),
        payload_encoded.encode(),
        hashlib.sha256
    ).digest()

    signature_encoded = base64.urlsafe_b64encode(
        signature
    ).decode().rstrip("=")

    return f"{payload_encoded}.{signature_encoded}"


# ---------------------------------------------------------
# VERIFY AUTH TOKEN
# ---------------------------------------------------------

def verify_auth_token(token):
    try:
        parts = token.split(".")

        if len(parts) != 2:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

        payload_encoded = parts[0]
        signature_encoded = parts[1]

        expected_signature = hmac.new(
            SECRET_KEY.encode(),
            payload_encoded.encode(),
            hashlib.sha256
        ).digest()

        expected_signature_encoded = base64.urlsafe_b64encode(
            expected_signature
        ).decode().rstrip("=")

        if not hmac.compare_digest(
            signature_encoded,
            expected_signature_encoded
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

        padding = "=" * (-len(payload_encoded) % 4)

        payload_json = base64.urlsafe_b64decode(
            payload_encoded + padding
        )

        payload = json.loads(
            payload_json.decode()
        )

        if payload["exp"] < int(time.time()):
            raise HTTPException(
                status_code=401,
                detail="Authentication token expired"
            )

        return payload

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )


# ---------------------------------------------------------
# AUTHENTICATION DEPENDENCY
# ---------------------------------------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    return verify_auth_token(token)


# ---------------------------------------------------------
# ROLE AUTHORIZATION
# ---------------------------------------------------------

def require_role(*allowed_roles):

    def role_checker(
        current_user: dict = Depends(get_current_user)
    ):

        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to access this resource"
            )

        return current_user

    return role_checker


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# PYDANTIC MODELS
# ---------------------------------------------------------

class UserRegistration(BaseModel):
    name: str
    email: str
    password: str
    role: str = "student"


class UserLogin(BaseModel):
    email: str
    password: str


class ComplaintCreate(BaseModel):
    user_id: int
    title: str
    description: str
    category: str
    priority: str = "medium"


class ComplaintStatusUpdate(BaseModel):
    status: str


class ComplaintAssignment(BaseModel):
    staff_id: int


class FeedbackCreate(BaseModel):
    rating: int
    comment: str = ""
class ChatRequest(BaseModel):
    message: str


# ---------------------------------------------------------
# ROOT
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "AI-Powered Complaint Management System API is running"
    }


# ---------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ---------------------------------------------------------
# REGISTER
# ---------------------------------------------------------

@app.post("/register")
def register_user(user: UserRegistration):

    try:
        if user.role not in ["student", "staff"]:
            return {
                "error": "Invalid role. Choose student or staff."
            }

        existing_user = users_collection.find_one({
            "email": user.email
        })

        if existing_user:
            return {
                "error": "Email already registered"
            }

        latest_user = users_collection.find_one(
            sort=[("id", -1)]
        )

        new_user_id = (
            latest_user["id"] + 1 if latest_user else 1
        )

        new_user = {
            "id": new_user_id,
            "name": user.name,
            "email": user.email,
            "password": pwd_context.hash(user.password),
            "role": user.role,
            "created_at": datetime.utcnow()
        }

        users_collection.insert_one(new_user)

        return {
            "message": "User registered successfully",
            "user": {
                "id": new_user_id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }

    except Exception as error:
        return {
            "error": str(error)
        }

# ---------------------------------------------------------
# LOGIN
# ---------------------------------------------------------

@app.post("/login")
def login_user(user: UserLogin):

    try:
        existing_user = users_collection.find_one({
            "email": user.email
        })

        if not existing_user:
            return {
                "error": "Invalid email or password"
            }

        if not pwd_context.verify(
            user.password,
            existing_user["password"]
        ):
            return {
                "error": "Invalid email or password"
            }

        token = create_auth_token(
            existing_user["id"],
            existing_user["role"]
        )

        return {
            "message": "Login successful",
            "token": token,
            "user": {
                "id": existing_user["id"],
                "name": existing_user["name"],
                "email": existing_user["email"],
                "role": existing_user["role"]
            }
        }

    except Exception as error:
        return {
            "error": str(error)
        }


# ---------------------------------------------------------
# CREATE COMPLAINT
# ---------------------------------------------------------

@app.post("/complaints")
def create_complaint(complaint: ComplaintCreate):

    try:
        latest_complaint = complaints_collection.find_one(
            sort=[("id", -1)]
        )

        new_complaint_id = (
            latest_complaint["id"] + 1
            if latest_complaint else 1
        )

        current_time = datetime.utcnow()

        new_complaint = {
            "id": new_complaint_id,
            "user_id": complaint.user_id,
            "title": complaint.title,
            "description": complaint.description,
            "category": complaint.category,
            "status": "pending",
            "priority": complaint.priority,
            "created_at": current_time,
            "updated_at": current_time
        }

        complaints_collection.insert_one(new_complaint)

        return {
            "message": "Complaint created successfully",
            "complaint": {
                "id": new_complaint_id,
                "user_id": complaint.user_id,
                "title": complaint.title,
                "description": complaint.description,
                "category": complaint.category,
                "status": "pending",
                "priority": complaint.priority
            }
        }

    except Exception as error:
        return {
            "error": str(error)
        }

# ---------------------------------------------------------
# GET USER COMPLAINTS
# ---------------------------------------------------------
# ---------------------------------------------------------
# GET USER COMPLAINTS
# ---------------------------------------------------------

@app.get("/complaints/user/{user_id}")
def get_user_complaints(user_id: int):

    try:
        complaints = list(
            complaints_collection.find(
                {"user_id": user_id},
                {"_id": 0}
            ).sort("created_at", -1)
        )

        result = []

        for complaint in complaints:

            result.append({
                "id": complaint["id"],
                "title": complaint["title"],
                "description": complaint["description"],
                "category": complaint["category"],
                "status": complaint["status"],
                "priority": complaint["priority"],
                "created_at": complaint["created_at"],

                # IMAGE INFORMATION
                "image_file_id": (
                    str(complaint["image_file_id"])
                    if complaint.get("image_file_id")
                    else None
                ),

                "image_filename": complaint.get("image_filename"),
                "image_content_type": complaint.get("image_content_type")
            })

        return {
            "complaints": result
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
# ---------------------------------------------------------
# GET ALL COMPLAINTS
# ---------------------------------------------------------

# ---------------------------------------------------------
# GET ALL COMPLAINTS
# ---------------------------------------------------------

@app.get("/complaints")
def get_all_complaints():

    try:
        complaints = list(
            complaints_collection.find(
                {},
                {"_id": 0}
            ).sort("created_at", -1)
        )

        result = []

        for complaint in complaints:

            user = users_collection.find_one(
                {"id": complaint["user_id"]},
                {"_id": 0, "name": 1, "email": 1}
            )

            result.append({
                "id": complaint["id"],
                "user_id": complaint["user_id"],
                "user_name": user["name"] if user else "Unknown",
                "user_email": user["email"] if user else "",
                "title": complaint["title"],
                "description": complaint["description"],
                "category": complaint["category"],
                "status": complaint["status"],
                "priority": complaint["priority"],
                "created_at": complaint["created_at"],

                # IMAGE INFORMATION
                "image_file_id": str(complaint["image_file_id"])
                    if complaint.get("image_file_id") else None,

                "image_filename": complaint.get("image_filename"),
                "image_content_type": complaint.get("image_content_type")
            })

        return {
            "complaints": result
        }

    except Exception as error:
        return {
            "error": str(error)
        }

# ---------------------------------------------------------
# UPDATE COMPLAINT STATUS
# ---------------------------------------------------------

@app.put("/complaints/{complaint_id}/status")
def update_complaint_status(
    complaint_id: int,
    status_data: ComplaintStatusUpdate,
    current_user: dict = Depends(
        require_role("staff", "admin")
    )
):
    try:
        # Valid statuses must match the frontend values
        valid_statuses = [
            "pending",
            "in_progress",
            "resolved"
        ]

        new_status = status_data.status.lower().strip()

        if new_status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail="Invalid complaint status"
            )

        # Check whether complaint exists
        complaint = complaints_collection.find_one({
            "id": complaint_id
        })

        if not complaint:
            raise HTTPException(
                status_code=404,
                detail="Complaint not found"
            )

        # Staff can update only complaints assigned to them
        if current_user["role"] == "staff":

            assignment = assignments_collection.find_one({
                "complaint_id": complaint_id,
                "staff_id": current_user["user_id"]
            })

            if not assignment:
                raise HTTPException(
                    status_code=403,
                    detail="This complaint is not assigned to you"
                )

        # Update MongoDB
        updated_time = datetime.utcnow()

        result = complaints_collection.update_one(
            {"id": complaint_id},
            {
                "$set": {
                    "status": new_status,
                    "updated_at": updated_time
                }
            }
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Complaint not found"
            )

        return {
            "message": "Complaint status updated successfully",
            "complaint": {
                "id": complaint_id,
                "status": new_status,
                "updated_at": updated_time
            }
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
# ---------------------------------------------------------
# ASSIGN COMPLAINT TO STAFF
# ---------------------------------------------------------


@app.post("/complaints/{complaint_id}/assign")
def assign_complaint(
    complaint_id: int,
    assignment: ComplaintAssignment,
    current_user: dict = Depends(
        require_role("admin")
    )
):

    try:
        # Check whether staff exists
        staff = users_collection.find_one({
            "id": assignment.staff_id,
            "role": "staff"
        })

        if not staff:
            return {
                "error": "Staff user not found"
            }

        # Check whether complaint exists
        complaint = complaints_collection.find_one({
            "id": complaint_id
        })

        if not complaint:
            return {
                "error": "Complaint not found"
            }

        # Prevent duplicate assignments
        existing_assignment = assignments_collection.find_one({
            "complaint_id": complaint_id
        })

        if existing_assignment:
            assignments_collection.update_one(
                {"complaint_id": complaint_id},
                {
                    "$set": {
                        "staff_id": assignment.staff_id,
                        "assigned_at": datetime.utcnow()
                    }
                }
            )

            return {
                "message": "Complaint assignment updated successfully",
                "assignment": {
                    "complaint_id": complaint_id,
                    "staff_id": assignment.staff_id
                }
            }

        # Generate assignment ID
        latest_assignment = assignments_collection.find_one(
            sort=[("id", -1)]
        )

        new_assignment_id = (
            latest_assignment["id"] + 1
            if latest_assignment else 1
        )

        assigned_time = datetime.utcnow()

        new_assignment = {
            "id": new_assignment_id,
            "complaint_id": complaint_id,
            "staff_id": assignment.staff_id,
            "assigned_at": assigned_time
        }

        assignments_collection.insert_one(new_assignment)

        return {
            "message": "Complaint assigned successfully",
            "assignment": {
                "id": new_assignment_id,
                "complaint_id": complaint_id,
                "staff_id": assignment.staff_id,
                "assigned_at": assigned_time
            }
        }

    except Exception as error:
        return {
            "error": str(error)
        }
# ---------------------------------------------------------
# GET STAFF COMPLAINTS
# ---------------------------------------------------------

# ---------------------------------------------------------
# GET STAFF COMPLAINTS
# ---------------------------------------------------------

@app.get("/staff/{staff_id}/complaints")
def get_staff_complaints(
    staff_id: int,
    current_user: dict = Depends(
        require_role("staff", "admin")
    )
):

    try:
        # Get complaints assigned to this staff member
        assignments = list(
            assignments_collection.find({
                "staff_id": staff_id
            })
        )

        result = []

        for assignment in assignments:

            complaint = complaints_collection.find_one({
                "id": assignment["complaint_id"]
            })

            if not complaint:
                continue

            user = users_collection.find_one({
                "id": complaint["user_id"]
            })

            result.append({
                "id": complaint["id"],
                "user_id": complaint["user_id"],
                "user_name": user["name"] if user else "Unknown",
                "user_email": user["email"] if user else "",
                "title": complaint["title"],
                "description": complaint["description"],
                "category": complaint["category"],
                "status": complaint["status"],
                "priority": complaint["priority"],
                "created_at": complaint["created_at"],

                # IMAGE INFORMATION
                "image_file_id": str(complaint["image_file_id"])
                    if complaint.get("image_file_id") else None,

                "image_filename": complaint.get("image_filename"),
                "image_content_type": complaint.get("image_content_type")
            })

        result.sort(
            key=lambda item: item["created_at"],
            reverse=True
        )

        return {
            "complaints": result
        }

    except Exception as error:
        return {
            "error": str(error)
        }
# ---------------------------------------------------------
# GET ALL STAFF MEMBERS
# ---------------------------------------------------------

@app.get("/staff")
def get_staff(
    current_user: dict = Depends(
        require_role("admin")
    )
):

    try:
        staff = list(
            users_collection.find(
                {"role": "staff"},
                {
                    "_id": 0,
                    "id": 1,
                    "name": 1,
                    "email": 1
                }
            ).sort("name", 1)
        )

        return staff

    except Exception as error:
        return {
            "error": str(error)
        }


# ---------------------------------------------------------
# UPLOAD COMPLAINT IMAGE
# ---------------------------------------------------------

@app.post("/complaints/{complaint_id}/image")
async def upload_complaint_image(
    complaint_id: int,
    image: UploadFile = File(...),
    current_user: dict = Depends(require_role("student"))
):
    """Upload one image (JPEG, PNG or WebP, max 5 MB) for the logged-in student's complaint."""
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    max_size = 5 * 1024 * 1024

    complaint = complaints_collection.find_one({"id": complaint_id})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    user_id = current_user["user_id"]
    if complaint.get("user_id") != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can upload an image only to your own complaint"
        )

    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG and WebP images are allowed"
        )

    contents = await image.read(max_size + 1)
    if not contents:
        raise HTTPException(status_code=400, detail="The uploaded image is empty")
    if len(contents) > max_size:
        raise HTTPException(status_code=413, detail="Image must be 5 MB or smaller")

    # Remove any previous image attached to this complaint.
    previous_image_id = complaint.get("image_file_id")
    if previous_image_id:
        try:
            images_bucket.delete(previous_image_id)
        except Exception:
            pass

    filename = os.path.basename(image.filename or "complaint-image")
    file_id = images_bucket.upload_from_stream(
        filename,
        io.BytesIO(contents),
        metadata={
            "complaint_id": complaint_id,
            "user_id": user_id,
            "content_type": image.content_type
        }
    )

    complaints_collection.update_one(
        {"id": complaint_id},
        {"$set": {
            "image_file_id": file_id,
            "image_filename": filename,
            "image_content_type": image.content_type,
            "updated_at": datetime.utcnow()
        }}
    )

    return {
        "message": "Complaint image uploaded successfully",
        "complaint_id": complaint_id,
        "filename": filename
    }


# ---------------------------------------------------------
# VIEW COMPLAINT IMAGE
# ---------------------------------------------------------

@app.get("/complaints/{complaint_id}/image")
def get_complaint_image(
    complaint_id: int,
    current_user: dict = Depends(get_current_user)
):
    complaint = complaints_collection.find_one({"id": complaint_id})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Students may view only their own complaint images. Staff/admin may view
    # complaint evidence as part of complaint handling.
    if current_user.get("role") == "student":
        if complaint.get("user_id") != current_user.get("user_id"):
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.get("role") == "staff":
        assignment = assignments_collection.find_one({
            "complaint_id": complaint_id,
            "staff_id": current_user.get("user_id")
        })
        if not assignment:
            raise HTTPException(status_code=403, detail="This complaint is not assigned to you")
    elif current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    file_id = complaint.get("image_file_id")
    if not file_id:
        raise HTTPException(status_code=404, detail="No image uploaded for this complaint")

    try:
        grid_out = images_bucket.open_download_stream(file_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Complaint image not found")

    content_type = complaint.get("image_content_type", "application/octet-stream")
    filename = complaint.get("image_filename", "complaint-image")
    return StreamingResponse(
        grid_out,
        media_type=content_type,
        headers={"Content-Disposition": f'inline; filename="{filename}"'}
    )


# ---------------------------------------------------------
# AI COMPLAINT CLASSIFICATION
# ---------------------------------------------------------

# ---------------------------------------------------------
# GEMINI AI COMPLAINT CLASSIFICATION
# ---------------------------------------------------------

@app.post("/ai/classify")
def classify_complaint(data: dict):

    try:
        if not gemini_client:
            raise HTTPException(
                status_code=503,
                detail="Gemini API key is not configured"
            )

        title = data.get("title", "")
        description = data.get("description", "")

        if not title and not description:
            raise HTTPException(
                status_code=400,
                detail="Complaint title or description is required"
            )

        prompt = f"""
        You are an AI complaint classification system
        for a college complaint management application.

        Analyze this complaint.

        Title: {title}
        Description: {description}

        Choose exactly one category:
        Hostel, Library, Infrastructure, Transport, Academic, Other

        Choose priority:
        low, medium, high

        Return only JSON in this format:
        {{
            "category": "Hostel",
            "priority": "high"
        }}
        """

        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config={
                "response_mime_type": "application/json"
            }
        )

        result = json.loads(response.text)

        allowed_categories = [
            "Hostel",
            "Library",
            "Infrastructure",
            "Transport",
            "Academic",
            "Other"
        ]

        allowed_priorities = [
            "low",
            "medium",
            "high"
        ]

        category = result.get("category")
        priority = result.get("priority")

        if category not in allowed_categories:
            category = "Other"

        if priority not in allowed_priorities:
            priority = "medium"

        return {
            "category": category,
            "priority": priority
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini classification failed: {str(error)}"
        )

# ---------------------------------------------------------
# SUBMIT COMPLAINT FEEDBACK
# ---------------------------------------------------------

# ==============================
# SUBMIT COMPLAINT FEEDBACK
# ==============================

@app.post("/complaints/{complaint_id}/feedback")
def submit_feedback(
    complaint_id: int,
    feedback: FeedbackCreate,
    current_user: dict = Depends(require_role("student"))
):
    try:
        # Check whether complaint exists
        complaint = complaints_collection.find_one({
            "id": complaint_id
        })

        if not complaint:
            raise HTTPException(
                status_code=404,
                detail="Complaint not found"
            )

        # Get logged-in student's ID
        user_id = current_user["user_id"]

        # Check complaint ownership
        if complaint["user_id"] != user_id:
            raise HTTPException(
                status_code=403,
                detail="You cannot submit feedback for another student's complaint"
            )

        # Validate rating
        if feedback.rating < 1 or feedback.rating > 5:
            raise HTTPException(
                status_code=400,
                detail="Rating must be between 1 and 5"
            )

        # Generate next feedback ID
        last_feedback = feedback_collection.find_one(
            sort=[("id", -1)]
        )

        next_id = last_feedback["id"] + 1 if last_feedback else 1

        # Save feedback in MongoDB
        feedback_collection.insert_one({
            "id": next_id,
            "complaint_id": complaint_id,
            "user_id": user_id,
            "rating": feedback.rating,
            "comment": feedback.comment,
            "created_at": datetime.utcnow()
        })

        return {
            "message": "Feedback submitted successfully",
            "feedback_id": next_id
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
# ---------------------------------------------------------
# GEMINI AI CHATBOT
# ---------------------------------------------------------

# ---------------------------------------------------------
# GEMINI AI CHATBOT WITH REAL COMPLAINT STATUS
# ---------------------------------------------------------
# --------------------------------------------------
# GEMINI CHATBOT REQUEST MODEL
# --------------------------------------------------


# --------------------------------------------------
# GEMINI AI CHATBOT
# --------------------------------------------------

@app.post("/ai/chat")
def ai_chat(
    data: ChatRequest,
    current_user: dict = Depends(require_role("student", "staff", "admin"))
):
    try:
        print("CHATBOT REQUEST RECEIVED")

        message = data.message.strip()

        if not message:
            raise HTTPException(
                status_code=400,
                detail="Message cannot be empty"
            )

        user_id = current_user["user_id"]

        # Retrieve only this student's latest 10 complaints
        complaints = list(
            complaints_collection.find(
                {"user_id": user_id},
                {
                    "_id": 0,
                    "id": 1,
                    "title": 1,
                    "category": 1,
                    "status": 1,
                    "priority": 1
                }
            ).sort("created_at", -1).limit(10)
        )

        # Calculate analytics
        total = len(complaints)

        pending = sum(
            1 for c in complaints
            if c.get("status") == "pending"
        )

        in_progress = sum(
            1 for c in complaints
            if c.get("status") == "in_progress"
        )

        resolved = sum(
            1 for c in complaints
            if c.get("status") == "resolved"
        )

        category_counts = {}

        for complaint in complaints:
            category = complaint.get("category", "Other")
            category_counts[category] = (
                category_counts.get(category, 0) + 1
            )

        analytics = {
            "total_complaints": total,
            "pending": pending,
            "in_progress": in_progress,
            "resolved": resolved,
            "category_counts": category_counts
        }

        lower_message = message.lower()

        # --------------------------------
        # 1. GREETINGS - NO GEMINI REQUEST
        # --------------------------------

        greetings = [
            "hi", "hello", "hey", "good morning",
            "good afternoon", "good evening"
        ]

        if lower_message.strip(" !.,?") in greetings:
            return {
                "reply": (
                    "Hello! Welcome to CampusCare. "
                    "How can I help you with your college complaints today?"
                )
            }

        # --------------------------------
        # 2. COMPLAINT STATISTICS - NO GEMINI
        # --------------------------------

        statistics_keywords = [
            "statistics", "stats", "how many complaints",
            "complaint count", "total complaints",
            "my complaints summary"
        ]

        if any(word in lower_message for word in statistics_keywords):

            return {
                "reply": (
                    f"Here are your complaint statistics based on "
                    f"your latest 10 retrieved complaints:\n"
                    f"Total complaints: {total}\n"
                    f"Pending: {pending}\n"
                    f"In progress: {in_progress}\n"
                    f"Resolved: {resolved}\n"
                    f"Category counts: {category_counts}"
                )
            }

        # --------------------------------
        # 3. MOST COMMON CATEGORY - NO GEMINI
        # --------------------------------

        if (
            "most common category" in lower_message
            or "most common complaint category" in lower_message
            or "common category" in lower_message
            or "popular category" in lower_message
            or "which category" in lower_message
        ):
            if not category_counts:
                reply = "You don't have any complaints in the latest 10 retrieved records."

            else:
                highest = max(category_counts.values())

                common_categories = [
                    category
                    for category, count in category_counts.items()
                    if count == highest
                ]

                reply = (
                    f"Your most common complaint category is "
                    f"{', '.join(common_categories)}, "
                    f"with {highest} complaint(s). "
                    f"This is based on your latest 10 retrieved complaints."
                )

            return {"reply": reply}

        # --------------------------------
        # 4. LATEST COMPLAINT STATUS - NO GEMINI
        # --------------------------------

        if (
            "status" in lower_message
            or "latest complaint" in lower_message
        ):
            if not complaints:
                return {
                    "reply": "You have no complaints in the latest 10 retrieved records."
                }

            id_match = re.search(
                r"\b(?:complaint\s*)?#?(\d+)\b",
                lower_message
            )

            if id_match:
                requested_id = int(id_match.group(1))

                selected = next(
                    (
                        c for c in complaints
                        if str(c.get("id")) == str(requested_id)
                    ),
                    None
                )

                if not selected:
                    return {
                        "reply": (
                            f"I couldn't find complaint ID {requested_id} "
                            "in your latest 10 retrieved complaints."
                        )
                    }

            else:
                selected = complaints[0]

            reply = (
                f"Your complaint ID {selected.get('id')} "
                f"titled '{selected.get('title')}' "
                f"has status: {selected.get('status')}.\n"
                f"Priority: {selected.get('priority')}.\n"
            )

            if selected.get("status") == "pending":
                reply += (
                    "Your complaint is waiting for staff action. "
                    "You can contact the complaint administrator "
                    "if it has been pending for a long time."
                )

            elif selected.get("status") == "in_progress":
                reply += (
                    "Staff are working on your complaint. "
                    "Please wait for further updates."
                )

            elif selected.get("status") == "resolved":
                reply += (
                    "Has your issue actually been fixed? "
                    "If not, please contact the complaint administrator."
                )

            return {"reply": reply}

        # --------------------------------
        # 5. COMPLAINT SUBMISSION - NO GEMINI
        # --------------------------------

        if (
            "submit complaint" in lower_message
            or "submit a complaint" in lower_message
            or "how do i submit" in lower_message
            or "how to submit" in lower_message
            or "how to complain" in lower_message
            or "raise a complaint" in lower_message
            or "create a complaint" in lower_message
        ):
            return {
                "reply": (
                    "To submit a complaint:\n"
                    "1. Log in to your CampusCare account.\n"
                    "2. Open the Submit Complaint page.\n"
                    "3. Enter your complaint title.\n"
                    "4. Select the category and priority.\n"
                    "5. Describe your problem.\n"
                    "6. Attach an image if needed.\n"
                    "7. Click Submit Complaint.\n"
                    "You can track your complaint from My Complaints."
                )
            }
            
                    # --------------------------------
        # 6. GENERAL QUESTIONS - USE GEMINI
        # --------------------------------

        if not gemini_client:
            raise HTTPException(
                status_code=503,
                detail="Gemini API key is not configured."
            )

        complaint_data = json.dumps(
            complaints,
            default=str
        )

        analytics_data = json.dumps(analytics)

        prompt = f"""
You are CampusCare AI Assistant.

Help students with college complaint management.

Student's latest 10 complaints:
{complaint_data}

Complaint analytics:
{analytics_data}

Student question:
{message}

Rules:
1. Give short, friendly and helpful answers.
2. Use simple English.
3. Never invent complaint IDs, statuses or statistics.
4. Never reveal another student's information.
5. Explain college complaint procedures when asked.
6. For pending complaints, suggest contacting the administrator
   if they have been pending for a long time.
7. For in-progress complaints, explain that staff are working on them.
8. For resolved complaints, ask whether the issue was actually fixed.
9. Never promise a specific resolution time.
10. Analytics refer only to the latest 10 retrieved complaints.
11. Use plain text without Markdown formatting.

Answer the student helpfully.
"""

        print("SENDING MESSAGE TO GEMINI...")

        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt
        )

        print("GEMINI RESPONSE RECEIVED")

        reply = response.text or "Sorry, I couldn't generate a response."

        reply = re.sub(r"\*+", "", reply)
        reply = re.sub(r"#+\s*", "", reply)

        return {"reply": reply.strip()}

    except HTTPException:
        raise

    except Exception as error:
        print("GEMINI CHAT ERROR:", repr(error))

        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Sorry, the AI assistant is temporarily unavailable. Please try again."
        )