from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, delete  # <-- Added 'delete' here
from app.db.engine import get_session
from app.models import Book, BookCopy, Transaction, User
from datetime import datetime, timedelta
import uuid
import random

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