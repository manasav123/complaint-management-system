import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from backend.database import connection
from passlib.context import CryptContext

import base64
import hashlib
import hmac
import json
import time


# ---------------------------------------------------------
# APP
# ---------------------------------------------------------

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
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO users (name, email, password)
            VALUES (%s, %s, %s)
            RETURNING id, name, email, role
            """,
            (
                user.name,
                user.email,
                pwd_context.hash(user.password)
            )
        )

        new_user = cursor.fetchone()

        connection.commit()
        cursor.close()

        return {
            "message": "User registered successfully",
            "user": {
                "id": new_user[0],
                "name": new_user[1],
                "email": new_user[2],
                "role": new_user[3]
            }
        }

    except Exception as error:

        connection.rollback()

        return {
            "error": str(error)
        }


# ---------------------------------------------------------
# LOGIN
# ---------------------------------------------------------

@app.post("/login")
def login_user(user: UserLogin):

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT id, name, email, password, role
            FROM users
            WHERE email = %s
            """,
            (user.email,)
        )

        existing_user = cursor.fetchone()

        cursor.close()

        if not existing_user:

            return {
                "error": "Invalid email or password"
            }

        if not pwd_context.verify(
            user.password,
            existing_user[3]
        ):

            return {
                "error": "Invalid email or password"
            }

        token = create_auth_token(
            existing_user[0],
            existing_user[4]
        )

        return {
            "message": "Login successful",

            "token": token,

            "user": {
                "id": existing_user[0],
                "name": existing_user[1],
                "email": existing_user[2],
                "role": existing_user[4]
            }
        }

    except Exception as error:

        connection.rollback()

        return {
            "error": str(error)
        }


# ---------------------------------------------------------
# CREATE COMPLAINT
# ---------------------------------------------------------

@app.post("/complaints")
def create_complaint(
    complaint: ComplaintCreate
):

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO complaints
            (
                user_id,
                title,
                description,
                category,
                priority
            )
            VALUES (%s, %s, %s, %s, %s)

            RETURNING
                id,
                user_id,
                title,
                description,
                category,
                status,
                priority
            """,
            (
                complaint.user_id,
                complaint.title,
                complaint.description,
                complaint.category,
                complaint.priority
            )
        )

        new_complaint = cursor.fetchone()

        connection.commit()
        cursor.close()

        return {
            "message": "Complaint created successfully",

            "complaint": {
                "id": new_complaint[0],
                "user_id": new_complaint[1],
                "title": new_complaint[2],
                "description": new_complaint[3],
                "category": new_complaint[4],
                "status": new_complaint[5],
                "priority": new_complaint[6]
            }
        }

    except Exception as error:

        connection.rollback()

        return {
            "error": str(error)
        }


# ---------------------------------------------------------
# GET USER COMPLAINTS
# ---------------------------------------------------------

@app.get("/complaints/user/{user_id}")
def get_user_complaints(user_id: int):

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                id,
                title,
                description,
                category,
                status,
                priority,
                created_at
            FROM complaints
            WHERE user_id = %s
            ORDER BY created_at DESC
            """,
            (user_id,)
        )

        complaints = cursor.fetchall()

        cursor.close()

        return {
            "complaints": [
                {
                    "id": complaint[0],
                    "title": complaint[1],
                    "description": complaint[2],
                    "category": complaint[3],
                    "status": complaint[4],
                    "priority": complaint[5],
                    "created_at": complaint[6]
                }

                for complaint in complaints
            ]
        }

    except Exception as error:

        connection.rollback()

        return {
            "error": str(error)
        }


# ---------------------------------------------------------
# GET ALL COMPLAINTS
# ---------------------------------------------------------

@app.get("/complaints")
def get_all_complaints():

    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                complaints.id,
                complaints.user_id,
                users.name,
                users.email,
                complaints.title,
                complaints.description,
                complaints.category,
                complaints.status,
                complaints.priority,
                complaints.created_at

            FROM complaints

            JOIN users
                ON complaints.user_id = users.id

            ORDER BY complaints.created_at DESC
            """
        )

        complaints = cursor.fetchall()

        cursor.close()

        return {
            "complaints": [
                {
                    "id": complaint[0],
                    "user_id": complaint[1],
                    "user_name": complaint[2],
                    "user_email": complaint[3],
                    "title": complaint[4],
                    "description": complaint[5],
                    "category": complaint[6],
                    "status": complaint[7],
                    "priority": complaint[8],
                    "created_at": complaint[9]
                }

                for complaint in complaints
            ]
        }

    except Exception as error:

        connection.rollback()

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
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE complaints

            SET
                status = %s,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = %s

            RETURNING
                id,
                status,
                updated_at
            """,
            (
                status_data.status,
                complaint_id
            )
        )

        updated_complaint = cursor.fetchone()

        if not updated_complaint:

            cursor.close()

            return {
                "error": "Complaint not found"
            }

        connection.commit()
        cursor.close()

        return {
            "message": "Complaint status updated successfully",

            "complaint": {
                "id": updated_complaint[0],
                "status": updated_complaint[1],
                "updated_at": updated_complaint[2]
            }
        }

    except Exception as error:

        connection.rollback()

        return {
            "error": str(error)
        }


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
        cursor = connection.cursor()

        # Check staff user
        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE id = %s
            AND role = 'staff'
            """,
            (assignment.staff_id,)
        )

        staff = cursor.fetchone()

        if not staff:

            cursor.close()

            return {
                "error": "Staff user not found"
            }

        # Check complaint
        cursor.execute(
            """
            SELECT id
            FROM complaints
            WHERE id = %s
            """,
            (complaint_id,)
        )

        complaint = cursor.fetchone()

        if not complaint:

            cursor.close()

            return {
                "error": "Complaint not found"
            }

        # Create assignment
        cursor.execute(
            """
            INSERT INTO complaint_assignments
            (
                complaint_id,
                staff_id
            )

            VALUES (%s, %s)

            RETURNING
                id,
                complaint_id,
                staff_id,
                assigned_at
            """,
            (
                complaint_id,
                assignment.staff_id
            )
        )

        new_assignment = cursor.fetchone()

        connection.commit()
        cursor.close()

        return {
            "message": "Complaint assigned successfully",

            "assignment": {
                "id": new_assignment[0],
                "complaint_id": new_assignment[1],
                "staff_id": new_assignment[2],
                "assigned_at": new_assignment[3]
            }
        }

    except Exception as error:

        connection.rollback()

        return {
            "error": str(error)
        }


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
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                complaints.id,
                complaints.user_id,
                users.name,
                users.email,
                complaints.title,
                complaints.description,
                complaints.category,
                complaints.status,
                complaints.priority,
                complaints.created_at

            FROM complaint_assignments

            JOIN complaints
                ON complaint_assignments.complaint_id = complaints.id

            JOIN users
                ON complaints.user_id = users.id

            WHERE complaint_assignments.staff_id = %s

            ORDER BY complaints.created_at DESC
            """,
            (staff_id,)
        )

        complaints = cursor.fetchall()

        cursor.close()

        return {
            "complaints": [
                {
                    "id": complaint[0],
                    "user_id": complaint[1],
                    "user_name": complaint[2],
                    "user_email": complaint[3],
                    "title": complaint[4],
                    "description": complaint[5],
                    "category": complaint[6],
                    "status": complaint[7],
                    "priority": complaint[8],
                    "created_at": complaint[9]
                }

                for complaint in complaints
            ]
        }

    except Exception as error:

        connection.rollback()

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
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                id,
                name,
                email

            FROM users

            WHERE role = 'staff'

            ORDER BY name
            """
        )

        staff = cursor.fetchall()

        cursor.close()

        return [
            {
                "id": row[0],
                "name": row[1],
                "email": row[2]
            }

            for row in staff
        ]

    except Exception as error:

        return {
            "error": str(error)
        }


# ---------------------------------------------------------
# AI COMPLAINT CLASSIFICATION
# ---------------------------------------------------------

@app.post("/ai/classify")
def classify_complaint(data: dict):

    try:
        title = data.get("title", "")
        description = data.get("description", "")

        text = f"{title} {description}".lower()

        category = "Other"
        priority = "medium"

        # Category detection

        if any(
            word in text
            for word in [
                "hostel",
                "hostel room",
                "water supply",
                "mess",
                "food",
                "bathroom",
                "warden"
            ]
        ):
            category = "Hostel"

        elif any(
            word in text
            for word in [
                "library",
                "book",
                "books",
                "reading room"
            ]
        ):
            category = "Library"

        elif any(
            word in text
            for word in [
                "classroom",
                "building",
                "fan",
                "light",
                "electricity",
                "infrastructure",
                "bench",
                "lift"
            ]
        ):
            category = "Infrastructure"

        elif any(
            word in text
            for word in [
                "bus",
                "transport",
                "vehicle",
                "driver"
            ]
        ):
            category = "Transport"

        elif any(
            word in text
            for word in [
                "exam",
                "marks",
                "teacher",
                "faculty",
                "course",
                "attendance",
                "assignment"
            ]
        ):
            category = "Academic"

        # Priority detection

        if any(
            word in text
            for word in [
                "urgent",
                "emergency",
                "danger",
                "immediately",
                "critical",
                "not working",
                "no water",
                "fire"
            ]
        ):
            priority = "high"

        elif any(
            word in text
            for word in [
                "minor",
                "small",
                "suggestion"
            ]
        ):
            priority = "low"

        return {
            "category": category,
            "priority": priority
        }

    except Exception as error:

        return {
            "error": str(error)
        }


# ---------------------------------------------------------
# SUBMIT COMPLAINT FEEDBACK
# ---------------------------------------------------------

@app.post("/complaints/{complaint_id}/feedback")
def submit_feedback(
    complaint_id: int,
    data: dict,
    current_user: dict = Depends(
        require_role("student")
    )
):

    try:
        user_id = data.get("user_id")
        rating = data.get("rating")
        comment = data.get("comment", "")

        if not user_id or not rating:

            return {
                "error": "User ID and rating are required"
            }

        if rating < 1 or rating > 5:

            return {
                "error": "Rating must be between 1 and 5"
            }

        cursor = connection.cursor()

        # Check complaint
        cursor.execute(
            """
            SELECT id
            FROM complaints
            WHERE id = %s
            """,
            (complaint_id,)
        )

        complaint = cursor.fetchone()

        if not complaint:

            cursor.close()

            return {
                "error": "Complaint not found"
            }

        # Insert feedback
        cursor.execute(
            """
            INSERT INTO complaint_feedback
            (
                complaint_id,
                user_id,
                rating,
                comment
            )

            VALUES (%s, %s, %s, %s)

            RETURNING id
            """,
            (
                complaint_id,
                user_id,
                rating,
                comment
            )
        )

        feedback_id = cursor.fetchone()[0]

        connection.commit()
        cursor.close()

        return {
            "message": "Feedback submitted successfully",
            "feedback_id": feedback_id
        }

    except Exception as error:

        connection.rollback()

        return {
            "error": str(error)
        }