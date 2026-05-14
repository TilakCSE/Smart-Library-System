import os
import sys
import uuid
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.engine import engine
from sqlmodel import Session, select
from app.models import User
from app.services.firebase_auth import initialize_firebase
from firebase_admin import auth as firebase_auth

load_dotenv()
initialize_firebase()

def create_users(session: Session):
    print("--- CREATING 10 SYNCED USERS ---")
    names = [
        ("Pal", "Gandhi"), ("Malav", "Thakor"), ("Bhargav", "Panchal"), 
        ("Shlok", "Barot"), ("Kavya", "Jariwala"), ("Uzair", "Manjre"), 
        ("Tithi", "Patel"), ("Om", "Nathani"), ("Parth", "Raval"), ("Shreyansh", "Soni")
    ]
    
    for fname, lname in names:
        email = f"{fname.lower()}.{lname.lower()}@college.edu"
        password = "password123" # Updated to your requested password
        
        try:
            fb_user = firebase_auth.get_user_by_email(email)
            print(f"Firebase User {email} already exists.")
        except firebase_auth.UserNotFoundError:
            fb_user = firebase_auth.create_user(
                email=email,
                password=password,
                display_name=f"{fname} {lname}"
            )
            print(f"Created Firebase User: {email}")

        existing_db_user = session.exec(select(User).where(User.email == email)).first()
        if not existing_db_user:
            new_user = User(
                id=str(uuid.uuid4()),
                firebase_uid=fb_user.uid,
                email=email,
                full_name=f"{fname} {lname}",
                role="student",
                is_active=True
            )
            session.add(new_user)
    
    session.commit()
    print("--- USERS SYNCED SUCCESSFULLY ---")

if __name__ == "__main__":
    with Session(engine) as session:
        create_users(session)
        # Note: populate_100_books is removed so we don't fetch books again!