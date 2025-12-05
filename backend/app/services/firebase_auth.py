import firebase_admin
from firebase_admin import credentials, auth
from app.core.config import settings
import os

# Initialize Firebase only once
def initialize_firebase():
    try:
        # Check if already initialized to avoid errors on reload
        if not firebase_admin._apps:
            # Construct full path to the json file
            cred_path = os.path.join(os.getcwd(), settings.FIREBASE_CREDENTIALS)
            
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("--- Firebase Admin Initialized Successfully ---")
    except Exception as e:
        print(f"Error initializing Firebase: {e}")

# Function to verify a token sent from the Frontend
def verify_token(token: str):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token # Returns user data (uid, email)
    except Exception:
        return None