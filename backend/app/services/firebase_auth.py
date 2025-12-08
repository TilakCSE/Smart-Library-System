import firebase_admin
from firebase_admin import credentials, auth
from app.core.config import settings
import os
import json

# Initialize Firebase only once
def initialize_firebase():
    try:
        # Check if already initialized to avoid errors on reload
        if not firebase_admin._apps:
            
            # CHECK 1: Production Mode (Render/Vercel)
            # We look for the JSON content inside the environment variable
            firebase_json_str = os.getenv("FIREBASE_JSON")
            
            if firebase_json_str:
                print("--- Firebase: Detected Production Environment Variable ---")
                cred_dict = json.loads(firebase_json_str)
                cred = credentials.Certificate(cred_dict)
            
            # CHECK 2: Local Mode (Laptop)
            # We look for the physical file 'service-account.json'
            else:
                print("--- Firebase: Detected Local File Mode ---")
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