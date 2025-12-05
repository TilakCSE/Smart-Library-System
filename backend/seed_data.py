from sqlmodel import Session
from app.db.engine import engine
from app.models import Book, BookCopy

def create_dummy_data():
    with Session(engine) as session:
        # Create a Book
        book1 = Book(
            title="Introduction to Algorithms",
            author="Thomas H. Cormen",
            isbn="9780262033848",
            category="Computer Science",
            unity_location_id="Rack_B_Shelf_1"
        )
        session.add(book1)
        session.commit()
        session.refresh(book1)

        # Create 2 Physical Copies of that book
        copy1 = BookCopy(book_id=book1.id, rfid_tag="TAG_123", status="available")
        copy2 = BookCopy(book_id=book1.id, rfid_tag="TAG_456", status="issued")
        
        session.add(copy1)
        session.add(copy2)
        session.commit()
        
        print("Dummy Data Added!")

if __name__ == "__main__":
    create_dummy_data()