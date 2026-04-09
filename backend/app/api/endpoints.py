from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.engine import get_session
from app.models import User, Transaction, SearchLog, Book, BookCopy
from datetime import datetime, timedelta
import uuid
import random
from sqlalchemy import text, func
from pydantic import BaseModel

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

@router.get("/users/me/{email}/dashboard")
def get_student_dashboard_data(email: str, session: Session = Depends(get_session)):
    # 1. Find the user
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        return {"full_name": email.split("@")[0], "issued": 0, "fines": 0, "due_text": "-", "activity": []}

    # 2. Get all their transactions, newest first
    txs = session.exec(select(Transaction).where(Transaction.user_id == user.id).order_by(Transaction.issue_date.desc())).all()

    issued_count = 0
    fines = 0
    earliest_due = None

    # 3. Calculate Stats
    for tx in txs:
        if tx.status in ["active", "overdue"]:
            issued_count += 1
        if tx.status == "overdue":
            fines += 5
        
        # Find the closest due date for active books
        if tx.status == "active":
            if earliest_due is None or tx.due_date < earliest_due:
                earliest_due = tx.due_date

    # Format the "Due In" text
    due_text = "-"
    if fines > 0:
        due_text = "Overdue!"
    elif earliest_due:
        delta = (earliest_due - datetime.utcnow()).days
        due_text = f"{max(0, delta)}d"

    # 4. Get Recent Activity (Top 3)
    activity = []
    for tx in txs[:3]:
        # Look up the actual book title
        copy = session.get(BookCopy, tx.copy_id)
        book = session.get(Book, copy.book_id) if copy else None
        title = book.title if book else "Unknown Asset"

        if tx.status == "completed":
            desc = "Returned successfully"
        elif tx.status == "overdue":
            desc = "Return is overdue"
        else:
            desc = "Currently borrowed"

        activity.append({
            "title": title,
            "desc": desc,
            "status": tx.status.capitalize()
        })

    return {
        "full_name": user.full_name,
        "issued": issued_count,
        "fines": fines,
        "due_text": due_text,
        "activity": activity
    }

@router.get("/admin/master-ledger")
def get_master_ledger(session: Session = Depends(get_session)):
    # 1. Fetch all required data
    transactions = session.exec(select(Transaction)).all()
    search_logs = session.exec(select(SearchLog)).all()
    
    # Create fast lookup dictionaries so we don't query the DB inside a loop
    users = {u.id: u.full_name for u in session.exec(select(User)).all()}
    books = {b.id: b.title for b in session.exec(select(Book)).all()}
    book_copies = {c.id: c.book_id for c in session.exec(select(BookCopy)).all()}

    ledger = []

    # 2. Process Physical Transactions
    for tx in transactions:
        user_name = users.get(tx.user_id, "Unknown User")
        book_id = book_copies.get(tx.copy_id)
        book_title = books.get(book_id, "Unknown Book") if book_id else "Unknown Book"

        # If it was returned, log the return event
        if tx.status == "completed":
            ledger.append({
                "id": f"tx_ret_{tx.id}",
                "type": "return",
                "user_name": user_name,
                "action": "Returned Asset",
                "details": book_title,
                "timestamp": tx.return_date or tx.due_date,
            })
        
        # Log the original issue event for ALL transactions
        ledger.append({
            "id": f"tx_iss_{tx.id}",
            "type": "issue",
            "user_name": user_name,
            "action": "Borrowed Asset",
            "details": book_title,
            "timestamp": tx.issue_date,
        })

    # 3. Process Digital Search Intent
    for log in search_logs:
        # Remember: we set some to NULL earlier during our data cleanup!
        user_name = users.get(log.user_id, "Anonymous Student") 
        ledger.append({
            "id": f"sch_{log.id}",
            "type": "search",
            "user_name": user_name,
            "action": "Spatial Query",
            "details": f"Searched: '{log.search_query}'",
            "timestamp": log.timestamp,
        })

    # 4. Sort chronologically (Newest first) and return top 150 events
    ledger.sort(key=lambda x: x["timestamp"], reverse=True)
    return ledger[:150]

@router.post("/admin/students/{user_id}/clear-fines")
def clear_student_fines(user_id: str, session: Session = Depends(get_session)):
    # 1. Find all overdue transactions for this specific student
    overdue_txs = session.exec(select(Transaction).where(
        Transaction.user_id == user_id, 
        Transaction.status == "overdue"
    )).all()
    
    if not overdue_txs:
        return {"message": "No fines to clear."}

    # 2. Mark them as completed and free up the physical books
    for tx in overdue_txs:
        tx.status = "completed"
        tx.return_date = datetime.utcnow()
        
        # Make the physical book available on the shelf again
        copy = session.get(BookCopy, tx.copy_id)
        if copy:
            copy.status = "available"
            
    session.commit()
    return {"message": f"Successfully cleared fines and processed {len(overdue_txs)} book returns."}

@router.post("/admin/fix-students")
def fix_students_data(session: Session = Depends(get_session)):
    # 1. Safely unlink search logs so we don't lose our Heatmap analytics!
    session.exec(text("UPDATE search_logs SET user_id = NULL;"))

    # 2. Delete all transactions
    session.exec(text("DELETE FROM transaction;"))

    # 3. Delete all users EXCEPT your login
    session.exec(text("DELETE FROM \"user\" WHERE email != 'student@college.edu';"))
    session.commit()

    # 4. Generate 50 Highly Diverse Indian Names
    first_names = ["Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Siddharth", "Rohan", "Krishna", "Ishaan", "Shaurya", "Aanya", "Diya", "Kavya", "Sanya", "Riya", "Aarohi", "Ananya", "Priya", "Neha", "Aditi", "Rahul", "Karan", "Vikram", "Suraj", "Amit", "Sneha", "Pooja", "Swati", "Nisha", "Megha", "Tarun", "Varun", "Yash", "Kabir", "Dhruv", "Zara", "Tara", "Mira", "Sara", "Kiara", "Dev", "Harsh", "Jay", "Raj", "Shiv", "Maya", "Roshni", "Kiran", "Simran", "Jyoti"]
    last_names = ["Patel", "Sharma", "Singh", "Desai", "Shah", "Mehta", "Chauhan", "Bhatt", "Joshi", "Panchal", "Nathani", "Jariwala", "Gandhi", "Trivedi", "Rathod", "Parmar", "Solanki", "Verma", "Reddy", "Iyer", "Nair", "Das", "Mukherjee", "Banerjee", "Chatterjee", "Bose", "Gupta", "Agarwal", "Mishra", "Pandey", "Shukla", "Tiwari", "Dubey", "Yadav", "Chaudhary", "Thakur", "Rajput", "Gohil", "Jadeja", "Zala", "Vyas", "Dave", "Rawal", "Soni"]

    db_users = []
    for _ in range(50):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        roll = str(random.randint(1, 1130)).zfill(4)
        email = f"{fname.lower()}.{lname.lower()}{roll}@nuv.ac.in"

        user = User(
            id=str(uuid.uuid4()),
            firebase_uid=f"fake_uid_{uuid.uuid4().hex[:8]}",
            email=email,
            full_name=f"{fname} {lname}",
            role="student",
            is_active=True
        )
        session.add(user)
        db_users.append(user)
    session.commit()

    # 5. Generate fresh transactions using existing book copies
    all_copies = session.exec(select(BookCopy)).all()
    now = datetime.utcnow()

    for user in db_users:
        for _ in range(random.randint(0, 3)): # 0 to 3 books per student
            copy = random.choice(all_copies)
            status = random.choice(["active", "completed", "overdue"])

            if status == "completed":
                issue_date = now - timedelta(days=random.randint(15, 60))
                due_date = issue_date + timedelta(days=14)
                return_date = issue_date + timedelta(days=random.randint(5, 14))
            elif status == "active":
                issue_date = now - timedelta(days=random.randint(1, 12))
                due_date = issue_date + timedelta(days=14)
                return_date = None
                copy.status = "issued"
            else: # overdue
                issue_date = now - timedelta(days=random.randint(15, 30))
                due_date = issue_date + timedelta(days=14)
                return_date = None
                copy.status = "issued"

            tx = Transaction(
                id=str(uuid.uuid4()), user_id=user.id, copy_id=copy.id,
                issue_date=issue_date, due_date=due_date, return_date=return_date, status=status
            )
            session.add(tx)
    session.commit()
    return {"message": "Cleaned students! 50 diverse students and fresh transactions added. Analytics preserved!"}


@router.get("/admin/students")
def get_admin_students(session: Session = Depends(get_session)):
    # Fetch all students and calculate their live stats
    users = session.exec(select(User).where(User.role == "student")).all()
    result = []
    
    for u in users:
        txs = session.exec(select(Transaction).where(Transaction.user_id == u.id)).all()
        active_issues = len([t for t in txs if t.status in ["active", "overdue"]])
        fines = len([t for t in txs if t.status == "overdue"]) * 5
        
        result.append({
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "active_issues": active_issues,
            "fines": fines,
            "status": "Blocked" if fines > 0 else "Active"
        })
    
    return sorted(result, key=lambda x: x['fines'], reverse=True) # Sort by highest fines first

@router.get("/admin/analytics")
def get_admin_analytics(session: Session = Depends(get_session)):
    # 1. High-Level Stats
    total_students = session.exec(select(func.count(User.id)).where(User.role == "student")).one()
    active_issues = session.exec(select(func.count(Transaction.id)).where(Transaction.status.in_(["active", "overdue"]))).one()
    overdue_count = session.exec(select(func.count(Transaction.id)).where(Transaction.status == "overdue")).one()
    total_fines = overdue_count * 5

    logs = session.exec(select(SearchLog)).all()
    
    # 2. Spatial Intent Aggregation (The Rack Heatmap)
    rack_traffic = {}
    for log in logs:
        rack_base = log.target_unity_location_id.split("_Shelf")[0].replace("_", " ")
        rack_traffic[rack_base] = rack_traffic.get(rack_base, 0) + 1

    heatmap_data = [{"name": rack, "searches": count} for rack, count in rack_traffic.items()]
    heatmap_data = sorted(heatmap_data, key=lambda x: x["searches"], reverse=True)[:6]

    # 3. Content Intent Aggregation (Top Searched Books)
    # We will match the searches to actual books in the database
    book_traffic = {}
    books = session.exec(select(Book)).all()
    # Create a quick lookup dictionary by unity_location_id for fast matching
    book_lookup = {b.unity_location_id: {"title": b.title, "author": b.author} for b in books}

    for log in logs:
        if log.target_unity_location_id in book_lookup:
            title = book_lookup[log.target_unity_location_id]["title"]
            author = book_lookup[log.target_unity_location_id]["author"]
            book_traffic[title] = book_traffic.get(title, {"searches": 0, "author": author})
            book_traffic[title]["searches"] += 1

    # Format for the frontend: [{"title": "Clean Code", "author": "Robert C. Martin", "searches": 15}]
    trending_books = [{"title": title, "author": data["author"], "searches": data["searches"]} 
                      for title, data in book_traffic.items()]
    trending_books = sorted(trending_books, key=lambda x: x["searches"], reverse=True)[:5] # Top 5 books

    return {
        "stats": {
            "total_students": total_students,
            "active_issues": active_issues,
            "overdue_count": overdue_count,
            "total_fines": total_fines
        },
        "heatmap_data": heatmap_data,
        "trending_books": trending_books
    }

@router.post("/transactions/seed-realistic-nuv")
def seed_realistic_nuv_data(session: Session = Depends(get_session)):
    # 1. CLEANUP: Wipe old dummy data so we don't get Duplicate ISBN errors
    # We use text() to safely execute raw SQL in SQLModel/SQLAlchemy 2.0
    session.exec(text("DELETE FROM search_logs;"))
    session.exec(text("DELETE FROM transaction;"))
    session.exec(text("DELETE FROM book_copies;"))
    session.exec(text("DELETE FROM book;"))
    # Notice we DO NOT delete the User table here, so your student@college.edu login stays safe!
    session.commit()
    # 1. CLEANUP: Wipe old dummy data (Optional but recommended for a clean slate)
    # session.execute("DELETE FROM search_logs; DELETE FROM transaction; DELETE FROM book_copies; DELETE FROM book; DELETE FROM \"user\";")
    
    # 2. SEED REAL BOOKS (With OpenLibrary API Covers)
    real_books = [
        {"title": "Clean Code", "author": "Robert C. Martin", "isbn": "9780132350884", "category": "Software Engineering"},
        {"title": "Introduction to Algorithms", "author": "Thomas H. Cormen", "isbn": "9780262033848", "category": "Algorithms"},
        {"title": "Design Patterns", "author": "Erich Gamma", "isbn": "9780201633610", "category": "Software Engineering"},
        {"title": "The Pragmatic Programmer", "author": "Andrew Hunt", "isbn": "9780135957059", "category": "Software Engineering"},
        {"title": "Artificial Intelligence", "author": "Stuart Russell", "isbn": "9780134610993", "category": "AI"},
        {"title": "Compilers: Principles", "author": "Alfred V. Aho", "isbn": "9780201100884", "category": "Computer Science"},
        {"title": "Computer Networking", "author": "James F. Kurose", "isbn": "9780132856201", "category": "Networking"},
        {"title": "Operating System Concepts", "author": "Abraham Silberschatz", "isbn": "9781118063330", "category": "Computer Science"}
    ]

    db_books = []
    for i, b in enumerate(real_books):
        book = Book(
            id=str(uuid.uuid4()),
            title=b["title"],
            author=b["author"],
            isbn=b["isbn"],
            category=b["category"],
            description=f"A fundamental text on {b['category']}.",
            cover_image_url=f"https://covers.openlibrary.org/b/isbn/{b['isbn']}-L.jpg",
            unity_location_id=f"Rack_{random.randint(1, 10)}_Shelf_{random.randint(1, 5)}"
        )
        session.add(book)
        db_books.append(book)

        # Create 3 physical copies for each book
        for j in range(3):
            copy = BookCopy(
                id=str(uuid.uuid4()),
                book_id=book.id,
                rfid_tag=f"NUV_RFID_{b['isbn']}_{j}",
                status="available",
                condition="good"
            )
            session.add(copy)

    session.commit() # Save books first

    # 3. SEED NUV STUDENTS
    first_names = ["Om", "Bhargav", "Kavya", "Rahul", "Priya", "Amit", "Neha", "Dev", "Aarti", "Rohan"]
    last_names = ["Nathani", "Panchal", "Jariwala", "Patel", "Shah", "Desai", "Mehta", "Chauhan", "Joshi", "Bhatt"]
    years = ["22", "23", "24"]
    
    db_users = []
    for _ in range(50):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        year = random.choice(years)
        roll = str(random.randint(1, 1130)).zfill(4)
        email = f"{fname.lower()}.{lname.lower()}{roll}@nuv.ac.in"
        
        user = User(
            id=str(uuid.uuid4()),
            firebase_uid=f"fake_uid_{uuid.uuid4().hex[:8]}",
            email=email,
            full_name=f"{fname} {lname}",
            role="student",
            is_active=True
        )
        session.add(user)
        db_users.append(user)
        
    session.commit()
    
    return {"message": "Database wiped and seeded with 50 correctly formatted books!", "count": len(books_to_add)}