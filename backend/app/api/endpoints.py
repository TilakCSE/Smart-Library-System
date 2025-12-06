from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.engine import get_session
from app.models import Book, BookCopy, Transaction, User
from datetime import datetime, timedelta
import uuid

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