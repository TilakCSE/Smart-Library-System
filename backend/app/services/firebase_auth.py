# backend/app/services/firebase_auth.py
import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

# 1. Force load environment variables immediately
load_dotenv()

security = HTTPBearer()

def initialize_firebase():
    """
    Called by main.py to start the Firebase Admin SDK.
    """
    cred_filename = os.getenv("FIREBASE_CREDENTIALS") 
    
    if not firebase_admin._apps:
        # Construct path to the root folder (3 levels up from this file)
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        
        if not cred_filename:
            print("--- ERROR: FIREBASE_CREDENTIALS not found in .env ---")
            return

        cred_path = os.path.join(base_dir, cred_filename)

        if os.path.exists(cred_path):
            print(f"--- SUCCESS: Initializing Firebase with {cred_path} ---")
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            print(f"--- ERROR: Service account file NOT FOUND at {cred_path} ---")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    This is the function your endpoints.py is trying to import.
    """
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"--- AUTH FAILED: {str(e)} ---")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
        )