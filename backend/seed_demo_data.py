from sqlmodel import SQLModel, Session, create_engine, select
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Import your models
from app.models import User, Book, BookCopy, Transaction

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL") 
engine = create_engine(DATABASE_URL)

def seed_demo_data():
    with Session(engine) as session:
        print("🌱 Checking and Seeding Demo Data for Tilak...")

        # 1. Create or Fetch the Target Student
        student = session.exec(select(User).where(User.email == "student@college.edu")).first()
        if not student:
            student = User(
                email="student@college.edu",
                full_name="Tilaksinh Chauhan",
                role="student",
                nfc_id="NFC-TILAK-001"
            )
            session.add(student)
            session.commit()
            session.refresh(student)

        # 2. Create or Fetch Books (Checking ISBNs to prevent duplicates)
        book1 = session.exec(select(Book).where(Book.isbn == "9780132350884")).first()
        if not book1:
            book1 = Book(
                title="Clean Code: A Handbook of Agile Software Craftsmanship",
                author="Robert C. Martin",
                isbn="9780132350884",
                category="Software Engineering", 
                description="A classic guide to writing readable, maintainable code.", 
                cover_image_url="https://images-na.ssl-images-amazon.com/images/I/41jEbK-jG+L._SX258_BO1,204,203,200_.jpg",
                unity_location_id="Rack_4_Shelf_2" 
            )
            session.add(book1)

        book2 = session.exec(select(Book).where(Book.isbn == "9780262033848")).first()
        if not book2:
            book2 = Book(
                title="Introduction to Algorithms",
                author="Thomas H. Cormen",
                isbn="9780262033848",
                category="Computer Science", 
                description="The comprehensive textbook on computer algorithms.", 
                cover_image_url="https://images-na.ssl-images-amazon.com/images/I/41T0iBxY8FL._SX218_BO1,204,203,200_QL40_FMwebp_.jpg",
                unity_location_id="Rack_1_Shelf_5"
            )
            session.add(book2)

        session.commit()
        if book1: session.refresh(book1)
        if book2: session.refresh(book2)
        
        # 3. Create or Fetch physical copies (RFIDs)
        copy1 = session.exec(select(BookCopy).where(BookCopy.rfid_tag == "RFID-CC-001")).first()
        if not copy1:
            copy1 = BookCopy(book_id=book1.id, rfid_tag="RFID-CC-001", status="issued")
            session.add(copy1)
            
        copy2 = session.exec(select(BookCopy).where(BookCopy.rfid_tag == "RFID-ALGO-001")).first()
        if not copy2:
            copy2 = BookCopy(book_id=book2.id, rfid_tag="RFID-ALGO-001", status="available")
            session.add(copy2)

        session.commit()
        if copy1: session.refresh(copy1)
        if copy2: session.refresh(copy2)

        # 4. Create Transactions (Only if student has no transactions yet)
        existing_tx = session.exec(select(Transaction).where(Transaction.user_id == student.id)).first()
        if not existing_tx:
            past_tx = Transaction(
                user_id=student.id,
                book_copy_id=copy2.id,
                issue_date=datetime.utcnow() - timedelta(days=20),
                due_date=datetime.utcnow() - timedelta(days=5),
                return_date=datetime.utcnow() - timedelta(days=6),
                status="completed"
            )
            
            active_tx = Transaction(
                user_id=student.id,
                book_copy_id=copy1.id,
                issue_date=datetime.utcnow() - timedelta(days=12),
                due_date=datetime.utcnow() + timedelta(days=3),
                status="active"
            )
            
            session.add_all([past_tx, active_tx])
            session.commit()

        print("✅ Demo Data Injected & Verified Successfully!")

if __name__ == "__main__":
    seed_demo_data()