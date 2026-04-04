from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, delete  # <-- Added 'delete' here
from app.db.engine import get_session
from app.models import Book, BookCopy, Transaction, User, SearchLog
from datetime import datetime, timedelta
import uuid
import random
from pydantic import BaseModel
from app.models import SearchLog

router = APIRouter()

# --- 1. SEARCH BOOKS ---
@router.get("/books/")
def search_books(query: str = None, session: Session = Depends(get_session)):
    statement = select(Book)
    if query:
        # Search by title or author
        statement = statement.where(
            (Book.title.contains(query)) | (Book.author.contains(query))
        )
    books = session.exec(statement).all()
    return books

# --- 2. ISSUE BOOK (Logic) ---
@router.post("/transactions/issue")
def issue_book(
    user_email: str, 
    rfid_tag: str, 
    days: int = 14, 
    session: Session = Depends(get_session)
):
    # A. Find User
    user = session.exec(select(User).where(User.email == user_email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # B. Find Book Copy by RFID
    copy = session.exec(select(BookCopy).where(BookCopy.rfid_tag == rfid_tag)).first()
    if not copy:
        raise HTTPException(status_code=404, detail="Book copy not found")
    
    if copy.status != "available":
        raise HTTPException(status_code=400, detail="Book is already issued or lost")

    # C. Create Transaction
    new_transaction = Transaction(
        user_id=user.id,
        copy_id=copy.id,
        due_date=datetime.utcnow() + timedelta(days=days),
        status="active"
    )

    # D. Update Copy Status
    copy.status = "issued"

    session.add(new_transaction)
    session.add(copy)
    session.commit()
    
    return {"status": "success", "message": f"Book issued to {user.full_name}", "due_date": new_transaction.due_date}
    
class SearchLogCreate(BaseModel):
    search_query: str
    unity_location_id: str

@router.post("/analytics/log-search")
def log_search(payload: SearchLogCreate, session: Session = Depends(get_session)):
    log_entry = SearchLog(
        search_query=payload.search_query,
        target_unity_location_id=payload.unity_location_id # Fixed mapping
    )
    session.add(log_entry)
    session.commit()
    
    return {"status": "success", "message": "Search intent logged successfully"}

@router.post("/books/add")
def add_book(book_data: Book, session: Session = Depends(get_session)):
    # 1. Check if ISBN already exists
    existing_book = session.exec(select(Book).where(Book.isbn == book_data.isbn)).first()
    if existing_book:
        raise HTTPException(status_code=400, detail="Book with this ISBN already exists.")

    # 2. Save to DB
    session.add(book_data)
    session.commit()
    session.refresh(book_data)
    
    return {"status": "success", "book_id": book_data.id, "message": "Asset Registered in Vault"}

@router.post("/books/seed")
def seed_database(session: Session = Depends(get_session)):
    # 1. Wipe all existing books
    statement = delete(Book)
    session.exec(statement)
    session.commit()

    # 2. Seed 50 new books with the CORRECT Rack_X_Shelf_Y format
    categories = ["Computer Science", "Physics", "Mathematics", "Fiction", "Philosophy"]
    authors = ["John Doe", "Jane Smith", "Alan Turing", "Ada Lovelace", "Isaac Newton"]
    
    books_to_add = []
    
    for i in range(1, 51):
        # Generate random location following our rules:
        # 28 Racks total. 48 Shelves total per rack (1-24 Front, 25-48 Back)
        rack_num = random.randint(1, 28)
        shelf_num = random.randint(1, 48)
        location_id = f"Rack_{rack_num}_Shelf_{shelf_num}"
        
        new_book = Book(
            id=str(uuid.uuid4()),
            title=f"Advanced Concepts in {random.choice(categories)} Vol {i}",
            author=random.choice(authors),
            isbn=f"978-3-16-148410-{i}",
            cover_image_url="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop",
            category=random.choice(categories),
            unity_location_id=location_id,  # THE CRUCIAL FIX
            totalCopies=random.randint(2, 5),
            availableCopies=random.randint(0, 5),
            status="In Stock"
        )
        books_to_add.append(new_book)
        
    session.add_all(books_to_add)
    session.commit()
    
    return {"message": "Database wiped and seeded with 50 correctly formatted books!", "count": len(books_to_add)}

@router.get("/transactions/user/{email}")
def get_user_transactions(email: str, session: Session = Depends(get_session)):
    # 1. Find the user
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 2. Explicitly map the Joins to resolve SQLAlchemy ambiguity
    statement = (
        select(Transaction, BookCopy, Book)
        .join(BookCopy, Transaction.copy_id == BookCopy.id)
        .join(Book, BookCopy.book_id == Book.id)
        .where(Transaction.user_id == user.id)
        .order_by(Transaction.due_date.desc())
    )
    
    results = session.exec(statement).all()
    
    # 3. Format the data for React
    data = []
    for tx, copy, book in results:
        # Check if overdue (active but due date has passed)
        is_overdue = tx.status == "active" and tx.due_date < datetime.utcnow()
        
        data.append({
            "id": tx.id,
            "book_title": book.title,
            "book_author": book.author,
            "cover_image_url": book.cover_image_url,
            "issue_date": tx.issue_date.isoformat(),
            "due_date": tx.due_date.isoformat(),
            "status": "overdue" if is_overdue else tx.status,
            "unity_location_id": book.unity_location_id
        })
        
    return data


@router.post("/transactions/seed-dummy")
def seed_dummy_transactions(session: Session = Depends(get_session)):
    # 1. Create the Demo Student
    target_email = "student@college.edu"
    demo_user = session.exec(select(User).where(User.email == target_email)).first()
    
    if not demo_user:
        demo_user = User(
            id=str(uuid.uuid4()),
            firebase_uid="real_student_uid_123", # Just needs to be non-null
            full_name="College Student",
            email=target_email,
            role="student"
        )
        session.add(demo_user)
        session.commit()
        session.refresh(demo_user)
    # 2. Grab 5 random books from the 50 we seeded earlier
    books = session.exec(select(Book).limit(5)).all()
    if len(books) < 5:
        raise HTTPException(status_code=400, detail="Not enough books in the database.")

    # 3. Create the Matrix of Scenarios (2 Normal, 1 Overdue, 2 Returned)
    scenarios = [
        {"status": "active", "due_offset": 7},      # Due in 7 days (Normal)
        {"status": "active", "due_offset": 14},     # Due in 14 days (Normal)
        {"status": "active", "due_offset": -2},     # Due 2 days AGO (Overdue/Red)
        {"status": "completed", "due_offset": -10}, # Returned successfully
        {"status": "completed", "due_offset": -20}  # Returned successfully
    ]

    transactions = []

    for i, book in enumerate(books):
        scenario = scenarios[i]
        
        # A. Create a physical RFID copy for the book
        copy = BookCopy(
            id=str(uuid.uuid4()),
            book_id=book.id,
            rfid_tag=f"RFID_{uuid.uuid4().hex[:8].upper()}", # <--- THE FIX: Random unique tags!
            status="issued" if scenario["status"] == "active" else "available"
        )
        session.add(copy)
        session.commit()
        session.refresh(copy)

        # B. Create the Transaction Record
        tx = Transaction(
            id=str(uuid.uuid4()),
            user_id=demo_user.id,
            copy_id=copy.id,
            issue_date=datetime.utcnow() - timedelta(days=14), # Pretend they issued it 2 weeks ago
            due_date=datetime.utcnow() + timedelta(days=scenario["due_offset"]),
            status=scenario["status"]
        )
        transactions.append(tx)

    session.add_all(transactions)
    session.commit()
    
    return {
        "message": "Demo Student created and seeded with 5 transaction scenarios!",
        "student_email": demo_user.email
    }