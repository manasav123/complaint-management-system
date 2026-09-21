from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.database import connection
from passlib.context import CryptContext

app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

@app.get("/")
def root():
    return {
        "message": "AI-Powered Complaint Management System API is running"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


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
            (user.name, user.email, pwd_context.hash(user.password))
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

        if not pwd_context.verify(user.password, existing_user[3]):
            return {
                "error": "Invalid email or password"
            }

        return {
            "message": "Login successful",
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
@app.post("/complaints")
def create_complaint(complaint: ComplaintCreate):
    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO complaints
            (user_id, title, description, category, priority)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, user_id, title, description, category, status, priority
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
@app.get("/complaints/user/{user_id}")
def get_user_complaints(user_id: int):
    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT id, title, description, category, status, priority, created_at
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
            JOIN users ON complaints.user_id = users.id
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
@app.put("/complaints/{complaint_id}/status")
def update_complaint_status(
    complaint_id: int,
    status_update: ComplaintStatusUpdate
):
    try:
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE complaints
            SET status = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, status, updated_at
            """,
            (status_update.status, complaint_id)
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
@app.post("/complaints/{complaint_id}/assign")
def assign_complaint(
    complaint_id: int,
    assignment: ComplaintAssignment
):
    try:
        cursor = connection.cursor()

        # Check that the staff user exists and has staff role
        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE id = %s AND role = 'staff'
            """,
            (assignment.staff_id,)
        )

        staff = cursor.fetchone()

        if not staff:
            cursor.close()
            return {
                "error": "Staff user not found"
            }

        # Check that the complaint exists
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
            (complaint_id, staff_id)
            VALUES (%s, %s)
            RETURNING id, complaint_id, staff_id, assigned_at
            """,
            (complaint_id, assignment.staff_id)
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
@app.get("/staff/{staff_id}/complaints")
def get_staff_complaints(staff_id: int):
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