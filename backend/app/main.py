from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # <--- NEW IMPORT
from app.db.engine import create_db_and_tables
from app.services.firebase_auth import initialize_firebase
from app.models import User, Book, BookCopy, Transaction, Fine, GateLog
from app.api.endpoints import router as api_router

app = FastAPI(title="Smart Library API")

# --- CORS SETTINGS (Allow React to talk to Python) ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://smart-library-system-orpin.vercel.app",  # <--- ADD YOUR VERCEL URL HERE
    "https://smart-library-system.vercel.app"         # <--- Add this too just in case
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Alternatively, use ["*"] temporarily to allow ALL traffic
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------------------------------

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    initialize_firebase()

@app.get("/")
def root():
    # We return a specific message to prove connection works
    return {"message": "Smart Library System is Online", "status": "active"}

app.include_router(api_router, prefix="/api/v1")